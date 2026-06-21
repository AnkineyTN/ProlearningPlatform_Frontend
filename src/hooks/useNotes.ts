import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noteAPI } from "@/services/endpoints/notes";
import {
  type CreateNotePayload,
  type AIGenerateNoteRequest,
  type ExplainTextRequest,
  type SummarizeFileRequest,
  type ConvertToVectorDBRequest,
  type DeleteNoteDocRequest,
  type DeleteNoteImgRequest,
  type SaveDocInNoteRequest,
  type SaveImgInNoteRequest,
  type GetAllNotesBySetApiResponse,
  type GetAllNotesBySetQuery,
  type NoteDetail,
  type NoteDocItem,
  type NoteListItem,
  type NoteListResponse,
  type NotesBySetResult,
  type NoteFileRegionCommentDto,
  type CreateNoteExplainRequest,
  type UpdateNoteExplainRequest,
} from "@/services/types/note.types";

/** Merge image list from whichever field the API returns so reload shows attachments. */
function normalizeNoteDetail(data: NoteDetail): NoteDetail {
  const x = data as NoteDetail & { set_id?: number; note_imgs?: NoteDocItem[] };
  const imgs = x.noteImgs ?? x.noteImages ?? x.note_imgs;
  const setId = x.setId ?? x.set_id;
  return {
    ...data,
    ...(imgs ? { noteImgs: imgs } : {}),
    ...(setId != null ? { setId } : {}),
  };
}

function normalizeNotesBySetResponse(
  body: GetAllNotesBySetApiResponse,
  fallbackPage: number,
  fallbackSize: number,
): NotesBySetResult {
  const raw = body.data;
  const meta = body.metadata;

  if (Array.isArray(raw)) {
    return {
      items: raw as NoteListItem[],
      pageNo: meta?.currentPage ?? fallbackPage,
      pageSize: meta?.pageSize ?? fallbackSize,
      totalPage: Math.max(1, meta?.totalPages ?? 1),
      totalElements: meta?.totalItems ?? raw.length,
    };
  }

  if (
    raw &&
    typeof raw === "object" &&
    "items" in raw &&
    Array.isArray((raw as NoteListResponse).items)
  ) {
    const r = raw as NoteListResponse;
    return {
      items: r.items,
      pageNo: r.pageNo ?? fallbackPage,
      pageSize: r.pageSize ?? fallbackSize,
      totalPage: Math.max(1, r.totalPage ?? 1),
      totalElements: r.totalElements ?? r.items.length,
    };
  }

  return {
    items: [],
    pageNo: fallbackPage,
    pageSize: fallbackSize,
    totalPage: 1,
    totalElements: 0,
  };
}

// Hook to get note detail
export const useNoteDetail = (setId: number, noteId: number) => {
  return useQuery({
    queryKey: ["note", setId, noteId],
    queryFn: async () => {
      const response = await noteAPI.getNoteDetail(setId, noteId);
      return normalizeNoteDetail(response.data.data);
    },
    enabled: !!setId && !!noteId,
  });
};

export const useNoteFileRegionComments = (setId: number, noteId: number) => {
  return useQuery({
    queryKey: ["note", noteId, "file-region-comments", setId] as const,
    queryFn: async () => {
      const response = await noteAPI.listFileRegionComments(setId, noteId);
      return response.data.data as NoteFileRegionCommentDto[];
    },
    enabled: !!setId && !!noteId,
  });
};

// Hook to get all notes by set
export const useNotesBySet = (setId: number, query: GetAllNotesBySetQuery) => {
  return useQuery({
    queryKey: [
      "notes",
      setId,
      query.page,
      query.size,
      query.q ?? "",
      query.privacy ?? "",
      query.sort ?? "id,DESC",
    ],
    queryFn: async () => {
      const response = await noteAPI.getAllNotesBySet(setId, query);
      return normalizeNotesBySetResponse(
        response.data,
        query.page,
        query.size,
      );
    },
    enabled: !!setId,
  });
};

// Hook to create note
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateNotePayload) =>
      noteAPI.createNote(payload.setId, payload),
    onSuccess: () => {
      // Invalidate all notes lists for the set
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (error) => {
      console.error("Error creating note:", error);
    },
  });
};

function extractCreatedNoteId(body: unknown): number | undefined {
  if (!body || typeof body !== "object") return undefined;
  const raw = (body as { data?: unknown }).data;
  if (typeof raw === "number") return raw;
  if (raw && typeof raw === "object") {
    const r = raw as { id?: unknown; noteId?: unknown; note_id?: unknown };
    const candidate = r.id ?? r.noteId ?? r.note_id;
    if (typeof candidate === "number") return candidate;
    if (typeof candidate === "string" && candidate !== "") {
      const parsed = Number(candidate);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }
  return undefined;
}

/** Create a note and persist its content in one step (used by file import).
 * The create response shape varies across backend versions, so fall back to
 * fetching the newest note of the set when no id can be extracted. */
export const useImportNoteFromFile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setId,
      title,
      description,
      privacy,
      content,
    }: {
      setId: number;
      title: string;
      description: string;
      privacy: string;
      content: string;
    }) => {
      const createRes = await noteAPI.createNote(setId, {
        setId,
        title,
        description,
        privacy,
      });

      let noteId = extractCreatedNoteId(createRes.data);

      if (!noteId) {
        const listRes = await noteAPI.getAllNotesBySet(setId, {
          page: 0,
          size: 1,
          sort: "id,DESC",
        });
        const normalized = normalizeNotesBySetResponse(listRes.data, 0, 1);
        noteId = normalized.items[0]?.id;
      }

      if (!noteId) {
        throw new Error("Could not resolve the id of the created note");
      }

      if (content) {
        await noteAPI.autoSaveNote(setId, noteId, { title, content });
      }

      return noteId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (error) => {
      console.error("Error importing note from file:", error);
    },
  });
};

// Hook to generate a note with AI from a topic + reference links
export const useAIGenerateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      data,
    }: {
      setId: number;
      data: AIGenerateNoteRequest;
    }) => noteAPI.aiGenerateNote(setId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
    onError: (error) => {
      console.error("Error generating note with AI:", error);
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      id,
      payload,
    }: {
      setId: number;
      id: number;
      payload: Partial<CreateNotePayload>;
    }) => noteAPI.updateNote(setId, id, payload),
    onSuccess: (_data, variables) => {
      // Invalidate all notes lists and note detail
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({
        queryKey: ["note", variables.setId, variables.id],
      });
    },
    onError: (error) => {
      console.error("Error updating note:", error);
    },
  });
};

// Hook to delete note
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, noteId }: { setId: number; noteId: number }) =>
      noteAPI.deleteNote(setId, noteId),
    onSuccess: (_data, variables) => {
      // Invalidate all notes lists and note detail
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({
        queryKey: ["note", variables.setId, variables.noteId],
      });
    },
    onError: (error) => {
      console.error("Error deleting note:", error);
    },
  });
};

export const noteKeys = {
  all: ["notes"] as const,
  detail: (setId: number, id: number) => ["note", setId, id] as const,
};

export const useAutoSaveNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      noteId,
      title,
      content,
    }: {
      setId: number;
      noteId: number;
      title: string;
      content: string;
    }) => noteAPI.autoSaveNote(setId, noteId, { title, content }),
    onSuccess: (_, variables) => {
      // Invalidate and refetch note detail after successful save
      queryClient.invalidateQueries({
        queryKey: noteKeys.detail(variables.setId, variables.noteId),
      });
    },
    onError: (error) => {
      console.error("Auto-save failed:", error);
      // Optionally show a toast notification
    },
  });
};

// Hook for explain text with AI
export const useExplainText = () => {
  return useMutation({
    mutationFn: ({ setId, data }: { setId: number; data: ExplainTextRequest }) =>
      noteAPI.explainText(setId, data),
    onError: (error) => {
      console.error("Explain text failed:", error);
    },
  });
};

export const useUploadFile = () => {
  return useMutation({
    mutationFn: ({
      file,
      setId,
      noteId,
    }: {
      file: File;
      setId: number;
      noteId: number;
    }) => noteAPI.uploadFile(file, setId, noteId),
    onError: (error) => {
      console.error("Upload file failed:", error);
    },
  });
};

export const useSaveDocumentInNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, data }: { setId: number; data: SaveDocInNoteRequest }) =>
      noteAPI.saveDocumentInNote(setId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note"] });
    },
    onError: (error) => {
      console.error("Save document in note failed:", error);
    },
  });
};

export const useSaveImageInNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, data }: { setId: number; data: SaveImgInNoteRequest }) =>
      noteAPI.saveImageInNote(setId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["note"] });
    },
    onError: (error) => {
      console.error("Save image in note failed:", error);
    },
  });
};

// Hook for summarize file
export const useSummarizeFile = () => {
  return useMutation({
    mutationFn: ({ setId, data }: { setId: number; data: SummarizeFileRequest }) =>
      noteAPI.summarizeFile(setId, data),
    onError: (error) => {
      console.error("Summarize file failed:", error);
    },
  });
};

export const useConvertToVectorDB = () => {
  return useMutation({
    mutationFn: ({
      setId,
      payload,
    }: {
      setId: number;
      payload: ConvertToVectorDBRequest;
    }) => noteAPI.convertToVectorDB(setId, payload),
    onError: (error) => {
      console.error("Convert to vector DB failed:", error);
    },
  });
};

export const useDeleteNoteDoc = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, data }: { setId: number; data: DeleteNoteDocRequest }) =>
      noteAPI.deleteNoteDoc(setId, data),
    onSuccess: (_data, variables) => {
      if (variables.data.noteId > 0) {
        queryClient.invalidateQueries({
          queryKey: ["note"],
        });
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "note" &&
            q.queryKey[1] === variables.data.noteId &&
            q.queryKey[2] === "file-region-comments",
        });
      }
    },
    onError: (error) => {
      console.error("Delete note document failed:", error);
    },
  });
};

export const useDeleteNoteImg = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, data }: { setId: number; data: DeleteNoteImgRequest }) =>
      noteAPI.deleteImgInNote(setId, data),
    onSuccess: (_data, variables) => {
      if (variables.data.noteId > 0) {
        queryClient.invalidateQueries({
          queryKey: ["note"],
        });
        queryClient.invalidateQueries({
          predicate: (q) =>
            Array.isArray(q.queryKey) &&
            q.queryKey[0] === "note" &&
            q.queryKey[1] === variables.data.noteId &&
            q.queryKey[2] === "file-region-comments",
        });
      }
    },
    onError: (error) => {
      console.error("Delete note image failed:", error);
    },
  });
};

// ─── Note Explains hooks ──────────────────────────────────────────────────────

export const useNoteExplains = (setId: number, noteId: number) => {
  return useQuery({
    queryKey: ["note", setId, noteId, "explains"] as const,
    queryFn: async () => {
      const response = await noteAPI.getExplains(setId, noteId);
      return response.data.data;
    },
    enabled: !!setId && !!noteId,
  });
};

export const useCreateNoteExplain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      noteId,
      data,
    }: {
      setId: number;
      noteId: number;
      data: CreateNoteExplainRequest;
    }) => noteAPI.createExplain(setId, noteId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["note", variables.setId, variables.noteId, "explains"],
      });
    },
  });
};

export const useUpdateNoteExplain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      noteId,
      explainId,
      data,
    }: {
      setId: number;
      noteId: number;
      explainId: number;
      data: UpdateNoteExplainRequest;
    }) => noteAPI.updateExplain(setId, noteId, explainId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["note", variables.setId, variables.noteId, "explains"],
      });
    },
  });
};

export const useDeleteNoteExplain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      noteId,
      explainId,
    }: {
      setId: number;
      noteId: number;
      explainId: number;
    }) => noteAPI.deleteExplain(setId, noteId, explainId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["note", variables.setId, variables.noteId, "explains"],
      });
    },
  });
};
