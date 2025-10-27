import type { User } from '@/store/authSlice'

export interface ChangePasswordData {
    currentPassword: string
    newPassword: string
}

export interface UpdateProfileData {
    name: string
    email: string
}

export interface ChangePasswordResponse {
    message: string
}

export interface UpdateProfileResponse {
    message: string
    user: User
}