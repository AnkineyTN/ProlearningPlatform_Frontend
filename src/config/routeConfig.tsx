import {type RouteObject } from 'react-router-dom'
import SignIn from '../components/SignIn'
import SignUp from '../components/SignUp'
import Dashboard from '../pages/Dashboard'
import ProtectedLayout from '../components/ProtectedLayout'
import Landing from '@/pages/Landing.tsx'
import OnboardingApp from "@/pages/OnboardingApp.tsx";

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
    {
        path: '/onboarding',
        element: <OnboardingApp />
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
        ]
    }
]