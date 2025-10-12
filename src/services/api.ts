import axios, {type AxiosResponse } from 'axios'
import type {User} from '@/store/authSlice'

const API_BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

interface AuthResponse {
    status: string
    message: string
    data: {
        userResponseDto: User
        accessToken: string
    }
    metadata: Record<string, any>
}
interface SignupData {
    firstName: string
    lastName: string
    email: string
    password: string
    role: string
}

interface LoginData {
    email: string
    password: string
}

interface MeResponse {
    user: User
}

interface SetData {
    data: Array<{
        title: string
        code: string
        instructor: string
        progress: number
        duration: string
        flashcards: number
        tests: number
        audio: string
        video: string
        lastUpdated: string
        date: string
    }>
    page: number
    size: number
    sort: Array<{
        property: string
        direction: string
    }>
}

interface SetQueryParams {
    page: number
    size: number
    sort: Array<{
        property: string
        direction: string
    }>
}

interface CreateSetPayload {
    title: string
    description: string
    privacy: 'PUBLIC' | 'PRIVATE'
}

interface CreateSetResponse {
    id: string
    title: string
    description: string
    privacy: string
    numNotes: number
}

interface UpdateSetPayload {
    title: string;
    description: string;
    privacy: 'PUBLIC' | 'PRIVATE';
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
        api.post('/auth/register', userData),
    login: (userData: LoginData): Promise<AxiosResponse<AuthResponse>> =>
        api.post('/auth/login', userData),
    getMe: (): Promise<AxiosResponse<MeResponse>> =>
        api.get('/users/me')
}

export const setAPI = {
    getSetData: ({ page, size, sort }: SetQueryParams): Promise<AxiosResponse<SetData>> =>
        api.get(`/sets?page=${page}&size=${size}&sort=${sort[0].property},${sort[0].direction}`),
    createSet: (payload: CreateSetPayload): Promise<AxiosResponse<CreateSetResponse>> =>
        api.post('/sets', payload),
    deleteSet: (id: number): Promise<AxiosResponse<void>> =>
        api.delete(`/sets/${id}`),
    updateSet: (id: number, payload: UpdateSetPayload): Promise<AxiosResponse<any>> =>
        api.patch(`/sets/${id}`, payload),
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
    SetData,
    SetQueryParams,
    CreateSetPayload,
    CreateSetResponse,
    UpdateSetPayload,
    ChangePasswordData,
    UpdateProfileData,
    ChangePasswordResponse,
    UpdateProfileResponse,
}
export default api