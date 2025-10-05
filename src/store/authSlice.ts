import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface User {
    id: string
    name: string
    email: string
    createdAt: string
    updatedAt: string
}

interface AuthState {
    user: User | null
    token: string | null
    isLoading: boolean
    error: string | null
}

const getStoredUser = (): User | null => {
    try {
        const storedUser = localStorage.getItem('user')
        return storedUser ? JSON.parse(storedUser) : null
    } catch {
        return null
    }
}

const initialState: AuthState = {
    user: getStoredUser(),
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.isLoading = true
            state.error = null
        },
        loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.isLoading = false
            state.user = action.payload.user
            state.token = action.payload.token
            state.error = null
            localStorage.setItem('token', action.payload.token)
        },
        loginFailure: (state, action: PayloadAction<string>) => {
            state.isLoading = false
            state.error = action.payload
            state.user = null
            state.token = null
            localStorage.removeItem('token')
        },
        logout: (state) => {
            state.user = null
            state.token = null
            state.error = null
            localStorage.removeItem('token')
            localStorage.removeItem('user') // Xóa user khỏi localStorage
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload
        }
    }
})

export const {
    loginStart,
    loginSuccess,
    loginFailure,
    logout,
    setUser
} = authSlice.actions

export type { User, AuthState }
export default authSlice.reducer