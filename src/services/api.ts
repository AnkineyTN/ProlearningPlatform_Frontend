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

interface NoteDetail {
    id: number;
    title: string;
    description: string;
    privacy: string;
    content: any;
    noteDocs: any[];
}

interface NoteListItem {
    id: number;
    title: string;
    description: string;
    timeAgo: string;
    privacy: string;
    created_at: string;
    updated_at: string;
}

interface NoteListResponse {
    pageNo: number;
    pageSize: number;
    totalPage: number;
    totalElements: number;
    items: NoteListItem[];
}

interface CreateNotePayload {
    title: string;
    privacy: string;
    description: string;
    setId: number;
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

interface AutoSaveNoteRequest {
    title: string;
    content: string;
}

interface ExplainTextRequest {
    noteId: number;
    queryText: string;
}

interface ExplainTextResponse {
    data: {
        status: number;
        message: string;
        data: {
            queryText: string;
            answer: string;
        };
    };
}

interface NoteDetailResponse {
    id: number;
    title: string;
    content: any;
    createdAt: string;
    updatedAt: string;
}

interface UploadFileResponse {
    status: number;
    message: string;
    data: {
        id: number;
        fileName: string;
        fileUrl: string;
        extension: string;
        publicId: string;
    };
}

interface SummarizeFileRequest {
    noteDocsId: number;
    fileUrl: string;
    extension: string;
}

interface SummarizeFileResponse {
    status: number;
    message: string;
    data: {
        noteDocsId: number;
        summary: string;
    };
}

interface ConvertToVectorDBRequest {
    noteDocsId: number;
    fileName: string;
    fileUrl: string;
    extension: string;
    noteId: number;
}

interface DeleteNoteDocRequest {
    publicId: string;
    extension: string;
}

interface ConvertToVectorDBResponse {
    status: number;
    message: string;
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

export const noteAPI = {
    getNoteDetail: (noteId: number): Promise<AxiosResponse<{ status: number; message: string; data: NoteDetail }>> =>
        api.get(`/note/${noteId}`),
    createNote: (payload: CreateNotePayload): Promise<AxiosResponse<{ status: number; message: string; data: NoteDetail }>> =>
        api.post('/note/create', payload),
    updateNote: (noteId: number, payload: Partial<CreateNotePayload>): Promise<AxiosResponse<{ status: number; message: string; data: NoteDetail }>> =>
        api.patch(`/note/update/${noteId}`, payload),
    deleteNote: (noteId: number): Promise<AxiosResponse> =>
        api.delete(`/note/delete/${noteId}`),
    getAllNotesBySet: (setId: number, pageNo: number, pageSize: number): Promise<AxiosResponse<{ status: number; message: string; data: NoteListResponse }>> =>
        api.get(`/note/all/${setId}?pageNo=${pageNo}&pageSize=${pageSize}`),
    autoSaveNote: (noteId: number, data: AutoSaveNoteRequest): Promise<AxiosResponse> =>
        api.patch(`/note/save/${noteId}`, data),
    explainText: (data: ExplainTextRequest): Promise<ExplainTextResponse> =>
        api.post('/note/explain', data),
    uploadFile: (file: File, noteId: number): Promise<AxiosResponse<UploadFileResponse>> => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post(`/upload-file?subject=note-document&id=${noteId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
    summarizeFile: (data: SummarizeFileRequest): Promise<AxiosResponse<SummarizeFileResponse>> =>
        api.post('/note/summarize', data),
    convertToVectorDB: (data: ConvertToVectorDBRequest): Promise<AxiosResponse<ConvertToVectorDBResponse>> =>
        api.post('/note/convert-to-vectordb', data),
    deleteNoteDoc: (noteDocsId: number, data: DeleteNoteDocRequest): Promise<AxiosResponse> =>
        api.delete(`/note/delete-doc/${noteDocsId}`, { data }),
};

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
    NoteDetail,
    NoteListItem,
    NoteListResponse,
    CreateNotePayload,
    ChangePasswordResponse,
    UpdateProfileResponse,
    AutoSaveNoteRequest,
    ExplainTextRequest,
    ExplainTextResponse,
    NoteDetailResponse,
    UploadFileResponse,
    SummarizeFileRequest,
    SummarizeFileResponse,
    ConvertToVectorDBRequest,
    ConvertToVectorDBResponse,
    DeleteNoteDocRequest
}
export default api