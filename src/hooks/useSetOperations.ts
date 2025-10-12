import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAPI, type UpdateSetPayload } from '@/services/api';

// Hook for deleting a set
export const useDeleteSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => setAPI.deleteSet(id),
        onSuccess: () => {
            // Refresh danh sách sets sau khi xóa
            queryClient.invalidateQueries({ queryKey: ['setData'] });
        },
        onError: (error) => {
            console.error('Error deleting set:', error);
        }
    });
};

// Hook for updating a set
export const useUpdateSet = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: UpdateSetPayload }) =>
            setAPI.updateSet(id, payload),
        onSuccess: () => {
            // Refresh danh sách sets sau khi update
            queryClient.invalidateQueries({ queryKey: ['setData'] });
        },
        onError: (error) => {
            console.error('Error updating set:', error);
        }
    });
};