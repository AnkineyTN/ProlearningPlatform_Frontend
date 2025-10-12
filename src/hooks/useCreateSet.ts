import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setAPI, type CreateSetPayload } from '@/services/api'

export const useCreateSet = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (payload: CreateSetPayload) => setAPI.createSet(payload),
        onSuccess: () => {
            // Refresh lại danh sách sets sau khi tạo thành công
            queryClient.invalidateQueries({ queryKey: ['setData'] })
        },
    })
}