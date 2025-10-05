import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { profileAPI, authAPI, type ChangePasswordData, type UpdateProfileData } from '../services/api'
import { toast } from 'react-hot-toast' // hoặc thư viện toast khác bạn đang dùng

export const useMe = () => {
    return useQuery({
        queryKey: ['auth', 'me'],
        queryFn: () => authAPI.getMe(),
        select: (response) => response.data.user
    })
}

export const useChangePassword = () => {
    return useMutation({
        mutationFn: (data: ChangePasswordData) => profileAPI.changePassword(data),
        onSuccess: (response) => {
            console.log('✅ RESPONSE', response);
            toast.success(response.data.message || 'Password changed successfully')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Wrong current password. Try again.'
            toast.error(message)
        }
    })
}

export const useUpdateProfile = () => {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: UpdateProfileData) => profileAPI.updateProfile(data),
        onSuccess: (response) => {
            // Update user data in auth/me cache
            queryClient.setQueryData(['auth', 'me'], (oldData: any) => {
                if (oldData) {
                    return {
                        ...oldData,
                        data: {
                            ...oldData.data,
                            user: response.data.user
                        }
                    }
                }
                return oldData
            })

            // Invalidate auth/me query to refetch fresh data
            queryClient.invalidateQueries({ queryKey: ['auth', 'me'] })
            console.log('✅ RESPONSE', response);
            toast.success(response.data.message || 'Profile updated successfully')
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update profile'
            toast.error(message)
        }
    })
}