import { type RouteObject } from 'react-router-dom'
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
    return <FlashcardApp flashcardId={flashcardId ?? ''} setId={setId ?? ''} />;
}

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
                path: 'sets',
                element: <SetListPage />
            },
            {
                path: 'sets/:id',
                element: <SetSeriesPageWrapper />
            },
            {
                path: 'flashcards/edit/:id',
                element: <FlashcardEditor />
            },
            {
                path: '/sets/:setId/flashcards/:flashcardId',
                element: <FlashcardAppWrapper />
            }
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