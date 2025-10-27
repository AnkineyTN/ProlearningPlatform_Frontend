import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { setAPI } from '@/services/endpoints/sets';
import { type CreateSetPayload, type SetQueryParams, type UpdateSetPayload } from '@/services/types/set.types';

export const useSetData = ({ page, size, sort }: SetQueryParams) => {
    return useQuery({
        queryKey: ['setData', { page, size, sort }],
        queryFn: () => setAPI.getSetData({ page, size, sort }),
    })
}

export const useCreateSet = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateSetPayload) => setAPI.createSet(payload),
        onSuccess: () => {
            // Refresh lại danh sách sets sau khi tạo thành công
            queryClient.invalidateQueries({ queryKey: ['setData'] })
        },
    })
};

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