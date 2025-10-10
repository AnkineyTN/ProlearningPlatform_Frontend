import { type RouteObject } from 'react-router-dom'
import SignIn from '@/components/auth/SignIn'
import SignUp from '@/components/auth/SignUp'
import Dashboard from '@/pages/Dashboard'
import SetListPage from '@/pages/SetListPage'
import ProtectedLayout from '@/components/ProtectedLayout'
import LandingPage from '@/pages/LandingPage'
import OnboardingApp from "@/pages/OnboardingApp.tsx";
import SetSeriesPage from '@/pages/SetSeriesPage'

export const routeConfig: RouteObject[] = [
    // Public routes
    {
        path: '/',
        element: <LandingPage />
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
    {
        path: '/dashboard',
        element: <Dashboard />
    },
    {
        path: '/sets',
        element: <SetListPage />
    },
    {
        path: '/sets/details',
        element: <SetSeriesPage />
    }
    // Protected routes
    // {
    //     path: '/',
    //     element: <ProtectedLayout />,
    //     children: [
    //         {
    //             path: 'dashboard',
    //             element: <Dashboard />
    //         },
    //     ]
    // }
]