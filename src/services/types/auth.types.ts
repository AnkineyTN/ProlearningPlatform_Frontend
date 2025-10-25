import type { User } from '@/store/authSlice'

export interface AuthResponse {
    status: string
    message: string
    data: {
        userResponseDto: User
        accessToken: string
    }
    metadata: Record<string, any>
}

export interface SignupData {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
}

export interface LoginData {
    email: string
    password: string
}

export interface MeResponse {
    user: User
}