import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { noteAPI } from "@/services/endpoints/notes";
import {
  type CreateNotePayload,
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
} from "@/services/types/note.types";

/** Merge image list from whichever field the API returns so reload shows attachments. */
function normalizeNoteDetail(data: NoteDetail): NoteDetail {
  const x = data as NoteDetail & { note_imgs?: NoteDocItem[] };
  const imgs = x.noteImgs ?? x.noteImages ?? x.note_imgs;
  if (!imgs) return data;
  return { ...data, noteImgs: imgs };
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
      }
    },
    onError: (error) => {
      console.error("Delete note image failed:", error);
    },
  });
};
