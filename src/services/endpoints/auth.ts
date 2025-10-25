import type { AxiosResponse } from 'axios'
import api from '../client'
import type { AuthResponse, SignupData, LoginData, MeResponse } from '../types/auth.types'

export const authAPI = {
    signup: (userData: SignupData): Promise<AxiosResponse<AuthResponse>> =>
        api.post('/auth/register', userData),

    login: (userData: LoginData): Promise<AxiosResponse<AuthResponse>> =>
        api.post('/auth/login', userData),

    getMe: (): Promise<AxiosResponse<MeResponse>> =>
        api.get('/users/me'),

    googleAuth: (): Promise<AxiosResponse<{
        status: string;
        message: string;
        data: {
            authorizationUrl: string;
        };
        metadata: {};
    }>> =>
        api.get('/auth/google')
}