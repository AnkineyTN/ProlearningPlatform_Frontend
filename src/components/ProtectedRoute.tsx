import { useEffect, type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { authAPI } from '@/services/api'
import { setUser, logout } from '@/store/authSlice'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'

interface ProtectedRouteProps {
    children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const dispatch = useAppDispatch()
    const { token, user } = useAppSelector(state => state.auth)

    useEffect(() => {
        const fetchUser = async () => {
            if (token && !user) {
                try {
                    const response = await authAPI.getMe()
                    dispatch(setUser(response.data.user))
                } catch (error) {
                    dispatch(logout())
                }
            }
        }

        fetchUser()
    }, [token, user, dispatch])

    if (!token) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}