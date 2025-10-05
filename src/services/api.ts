import axios, {type AxiosResponse } from 'axios'
import type {User} from '../store/authSlice'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

interface AuthResponse {
    user: User
    token: string
}

interface SignupData {
    name: string
    email: string
    password: string
}

interface LoginData {
    email: string
    password: string
}

interface MeResponse {
    user: User
}

interface UserStatsResponse {
    totalUsers: number
    usersToday: number
    usersThisWeek: number
    usersThisMonth: number
    chartData: {
        daily: Array<{
            date: string
            count: number
        }>
        monthly: Array<{
            month: string
            count: number
        }>
    }
}

interface UsersListResponse {
    users: Array<{
        id: number
        name: string
        email: string
        createdAt: string
        updatedAt: string
    }>
    pagination: {
        total: number
        page: number
        limit: number
        totalPages: number
    }
}

interface UsersListParams {
    page?: number
    limit?: number
    search?: string
}

interface ChangePasswordData {
    currentPassword: string
    newPassword: string
}

interface UpdateProfileData {
    name: string
    email: string
}

interface ChangePasswordResponse {
    message: string
}

interface UpdateProfileResponse {
    message: string
    user: User
}

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const authAPI = {
    signup: (userData: SignupData): Promise<AxiosResponse<AuthResponse>> =>
        api.post('/auth/signup', userData),
    login: (userData: LoginData): Promise<AxiosResponse<AuthResponse>> =>
        api.post('/auth/login', userData),
    getMe: (): Promise<AxiosResponse<MeResponse>> =>
        api.get('/auth/me')
}

export const dashboardAPI = {
    getUserStats: (): Promise<AxiosResponse<UserStatsResponse>> =>
        api.get('/api/dashboard/stats'),
    getUsers: (params: UsersListParams = {}): Promise<AxiosResponse<UsersListResponse>> =>
        api.get('/api/dashboard/users', { params })
}

export const profileAPI = {
    changePassword: (data: ChangePasswordData): Promise<AxiosResponse<ChangePasswordResponse>> =>
        api.put('/api/users/change-password', data),
    updateProfile: (data: UpdateProfileData): Promise<AxiosResponse<UpdateProfileResponse>> =>
        api.put('/api/users/profile', data)
}

export type {
    SignupData,
    LoginData,
    AuthResponse,
    MeResponse,
    UserStatsResponse,
    UsersListResponse,
    UsersListParams,
    ChangePasswordData,
    UpdateProfileData,
    ChangePasswordResponse,
    UpdateProfileResponse,
}
export default api