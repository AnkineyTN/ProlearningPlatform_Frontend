import { type RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import SignIn from '@/components/auth/SignIn'
import SignUp from '@/components/auth/SignUp'
import Dashboard from '@/pages/Dashboard'
import SetListPage from '@/pages/SetListPage'
import ProtectedLayout from '@/components/ProtectedLayout'
import ProtectedLayoutNoSidebar from '@/components/ProtectedLayoutNoSidebar'
import LandingPage from '@/pages/LandingPage'
import OnboardingApp from "@/pages/OnboardingApp.tsx";
import SetSeriesPage from '@/pages/SetSeriesPage'
import TextEditor from '@/pages/TextEditor'
import FlashcardEditor from '@/pages/flashcard/FlashcardEditor'
import { useParams } from 'react-router-dom';
import FlashcardApp from '@/pages/flashcard/FlashcardApp'
import GoogleAuthCallback from '@/pages/GoogleAuthCallback'
import GoogleAuthFailure from '@/pages/GoogleAuthFailure'
import TodoDashboard from '@/pages/TodoDashboard';

function LandingPageWrapper() {
    const token = useSelector((state: RootState) => state.auth.token);

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <LandingPage />;
}

function SignInWrapper() {
    const token = useSelector((state: RootState) => state.auth.token);

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <SignIn />;
}

function SignUpWrapper() {
    const token = useSelector((state: RootState) => state.auth.token);

    if (token) {
        return <Navigate to="/dashboard" replace />;
    }

    return <SignUp />;
}

// Wrapper component to extract setId from params and pass as prop
function SetSeriesPageWrapper() {
    const { id } = useParams();
    return <SetSeriesPage setId={id ?? ''} />;
}

function TextEditorWrapper() {
    const { id } = useParams();
    return <TextEditor initialTitle={id ? `Note ${id}` : 'Untitled Note'} noteId={id ?? ''} />;
}

function FlashcardAppWrapper() {
    const { setId, flashcardId } = useParams();
    return <FlashcardApp flashcardId={flashcardId ?? ''} setId={Number(setId) ?? 0} />;
}

function FlashcardEditorWrapper() {
    const { setId } = useParams();
    return <FlashcardEditor setId={Number(setId) ?? 0} />;
}

function FlashcardUpdateWrapper() {
    const { setId, flashcardId } = useParams();
    return <FlashcardEditor setId={Number(setId) ?? 0} flashcardId={Number(flashcardId) ?? 0} />;
}

export const routeConfig: RouteObject[] = [
    // Public routes
    {
        path: '/',
        element: <LandingPageWrapper />
    },
    {
        path: '/login',
        element: <SignInWrapper />
    },
    {
        path: '/signup',
        element: <SignUpWrapper />
    },
    {
        path: '/onboarding',
        element: <OnboardingApp />
    },
    {
        path: '/auth/google/callback',
        element: <GoogleAuthCallback />
    },
    {
        path: '/auth/google/failure',
        element: <GoogleAuthFailure />
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
                path: 'todo',
                element: <TodoDashboard />
            },
            {
                path: 'sets',
                element: <SetListPage />
            },
            {
                path: 'sets/:id',
                element: <SetSeriesPageWrapper />
            },
            {
                path: 'sets/:setId/flashcards/editor',
                element: <FlashcardEditorWrapper />
            },
            {
                // Route để UPDATE flashcard (phải đặt trước route detail)
                path: 'sets/:setId/flashcards/:flashcardId/update',
                element: <FlashcardUpdateWrapper />
            },
            {
                // Route để VIEW flashcard detail
                path: 'sets/:setId/flashcards/:flashcardId',
                element: <FlashcardAppWrapper />
            },
        ]
    },
    {
        path: '/',
        element: <ProtectedLayoutNoSidebar />,
        children: [
            {
                path: 'note/:id',
                element: <TextEditorWrapper />
            }
        ]
    }
]