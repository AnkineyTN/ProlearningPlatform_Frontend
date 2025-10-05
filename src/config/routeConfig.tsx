import {type RouteObject, Navigate } from 'react-router-dom'
import SignIn from '../components/SignIn'
import SignUp from '../components/SignUp'
import Dashboard from '../pages/Dashboard'
import Profile from '../pages/Profile'
import ProtectedLayout from '../components/ProtectedLayout'
import Pomodoro from "@/pages/Pomodoro.tsx";
import Landing from '@/pages/Landing.tsx'

export const routeConfig: RouteObject[] = [
    // Public routes
    {
        path: '/',
        element: <Landing />
    },
    {
        path: '/login',
        element: <SignIn />
    },
    {
        path: '/signup',
        element: <SignUp />
    },
    // Protected routes
    {
        path: '/',
        element: <ProtectedLayout />,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />
            },
            {
                path: 'profile',
                element: <Profile />
            },
            {
                path: 'pomodoro',
                element: <Pomodoro />
            }
        ]
    }
]