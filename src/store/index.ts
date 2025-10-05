import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import {authMiddleware} from "@/store/middleware/authMiddleware.ts";

export const store = configureStore({
    reducer: {
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().prepend(authMiddleware.middleware)
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch