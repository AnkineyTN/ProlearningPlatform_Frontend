import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    noteAPI,
    type CreateNotePayload,
    type ExplainTextRequest,
    type SummarizeFileRequest,
    type ConvertToVectorDBRequest,
    type DeleteNoteDocRequest,
} from '@/services/api';

// Hook to get note detail
export const useNoteDetail = (noteId: number) => {
    return useQuery({
        queryKey: ['note', noteId],
        queryFn: async () => {
            const response = await noteAPI.getNoteDetail(noteId);
            return response.data.data;
        },
        enabled: !!noteId,
    });
};

// Hook to get all notes by set
export const useNotesBySet = (setId: number, pageNo: number = 0, pageSize: number = 10) => {
    return useQuery({
        queryKey: ['notes', setId, pageNo, pageSize],
        queryFn: async () => {
            const response = await noteAPI.getAllNotesBySet(setId, pageNo, pageSize);
            return response.data.data;
        },
        enabled: !!setId,
    });
};

// Hook to create note
export const useCreateNote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateNotePayload) => noteAPI.createNote(payload),
        onSuccess: () => {
            // Invalidate all notes lists for the set
            queryClient.invalidateQueries({ queryKey: ['notes'] });
        },
        onError: (error) => {
            console.error('Error creating note:', error);
        }
    });
};

export const useUpdateNote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<CreateNotePayload> }) =>
            noteAPI.updateNote(id, payload),
        onSuccess: (_data, variables) => {
            // Invalidate all notes lists and note detail
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            queryClient.invalidateQueries({ queryKey: ['note', variables.id] });
        },
        onError: (error) => {
            console.error('Error updating note:', error);
        }
    });
}

// Hook to delete note
export const useDeleteNote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (noteId: number) => noteAPI.deleteNote(noteId),
        onSuccess: (_data, noteId) => {
            // Invalidate all notes lists and note detail
            queryClient.invalidateQueries({ queryKey: ['notes'] });
            queryClient.invalidateQueries({ queryKey: ['note', noteId] });
        },
        onError: (error) => {
            console.error('Error deleting note:', error);
        }
    });
};

export const noteKeys = {
    all: ['notes'] as const,
    detail: (id: number) => ['notes', 'detail', id] as const,
};

export const useAutoSaveNote = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ noteId, title, content }: { noteId: number; title: string; content: string }) =>
            noteAPI.autoSaveNote(noteId, { title, content }),
        onSuccess: (_, variables) => {
            // Invalidate and refetch note detail after successful save
            queryClient.invalidateQueries({ queryKey: noteKeys.detail(variables.noteId) });
        },
        onError: (error) => {
            console.error('Auto-save failed:', error);
            // Optionally show a toast notification
        },
    });
};

// Hook for explain text with AI
export const useExplainText = () => {
    return useMutation({
        mutationFn: (data: ExplainTextRequest) => noteAPI.explainText(data),
        onError: (error) => {
            console.error('Explain text failed:', error);
        },
    });
};

export const useUploadFile = () => {
    return useMutation({
        mutationFn: ({ file, noteId }: { file: File; noteId: number }) => noteAPI.uploadFile(file, noteId),
        onError: (error) => {
            console.error('Upload file failed:', error);
        },
    });
};

// Hook for summarize file
export const useSummarizeFile = () => {
    return useMutation({
        mutationFn: (data: SummarizeFileRequest) => noteAPI.summarizeFile(data),
        onError: (error) => {
            console.error('Summarize file failed:', error);
        },
    });
};

export const useConvertToVectorDB = () => {
    return useMutation({
        mutationFn: (payload: ConvertToVectorDBRequest) => noteAPI.convertToVectorDB(payload),
        onError: (error) => {
            console.error('Convert to vector DB failed:', error);
        }
    });
};

export const useDeleteNoteDoc = () => {
    return useMutation({
        mutationFn: ({ noteDocsId, data }: { noteDocsId: number, data: DeleteNoteDocRequest }) => noteAPI.deleteNoteDoc(noteDocsId, data),
        onError: (error) => {
            console.error('Delete note document failed:', error);
        }
    });
};