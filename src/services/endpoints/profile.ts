import type { AxiosResponse } from 'axios'
import api from '../client'
import type { ChangePasswordData, UpdateProfileData, ChangePasswordResponse, UpdateProfileResponse } from '../types/profile.types'

export const profileAPI = {
    changePassword: (data: ChangePasswordData): Promise<AxiosResponse<ChangePasswordResponse>> =>
        api.put('/api/users/change-password', data),
    updateProfile: (data: UpdateProfileData): Promise<AxiosResponse<UpdateProfileResponse>> =>
        api.put('/api/users/profile', data)
}
