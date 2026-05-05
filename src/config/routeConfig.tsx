/* eslint-disable no-constant-binary-expression */
/* eslint-disable react-refresh/only-export-components */
import { Navigate, useParams } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

import SignIn from '@/components/auth/SignIn';
import SignUp from '@/components/auth/SignUp';
import ForgotPassword from '@/components/auth/ForgotPassword';
import VerifyEmail from '@/components/auth/VerifyEmail';
import ResetOtp from '@/components/auth/ResetOtp';
import ResetPassword from '@/components/auth/ResetPassword';
import ProtectedLayout from '@/components/ProtectedLayout';
import ProtectedLayoutNoSidebar from '@/components/ProtectedLayoutNoSidebar';
import Dashboard from '@/pages/Dashboard';
import FlashcardPage from '@/pages/FlashcardPage';
import FlashcardEditor from '@/pages/FlashcardPage/FlashcardEditor';
import LandingPage from '@/pages/LandingPage';
import TextEditor from '@/pages/NotePage';
import OnboardingApp from '@/pages/OnboardingApp.tsx';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import SetListPage from '@/pages/SetListPage';
import SetSeriesPage from '@/pages/SetSeriesPage';
import TodoDashboard from '@/pages/TodoDashboard';
import Pomodoro from '@/pages/Pomodoro';
import ExamPage from '@/pages/ExamPage';
import ExamEditor from '@/pages/ExamPage/ExamEditor';
import ProfilePage from '@/pages/ProfilePage';
import ReviewBundlesPage from '@/pages/ReviewBundle/ReviewBundlesPage';
import ReviewBundlePage from '@/pages/ReviewBundle';
import InviteAcceptPage from '@/pages/InviteAcceptPage';
import ExamInviteAcceptPage from '@/pages/ExamInviteAcceptPage';
import FlashcardInviteAcceptPage from '@/pages/FlashcardInviteAcceptPage';
import type { RouteObject } from 'react-router-dom';

function LandingPageWrapper() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to='/dashboard' replace />;
  }

  return <LandingPage />;
}

function SignInWrapper() {
  const { token } = useAuth();

  if (token) {
    return <Navigate to='/dashboard' replace />;
  }

  return <SignIn />;
}

function SignUpWrapper() {
  return <SignUp />;
}

function ForgotPasswordWrapper() {
  const { token } = useAuth();
  if (token) return <Navigate to='/dashboard' replace />;
  return <ForgotPassword />;
}

function VerifyEmailWrapper() {
  return <VerifyEmail />;
}

function ResetOtpWrapper() {
  const { token } = useAuth();
  if (token) return <Navigate to='/dashboard' replace />;
  return <ResetOtp />;
}

function ResetPasswordWrapper() {
  const { token } = useAuth();
  if (token) return <Navigate to='/dashboard' replace />;
  return <ResetPassword />;
}

// Wrapper component to extract setId from params and pass as prop
function SetSeriesPageWrapper() {
  const { id } = useParams();
  return <SetSeriesPage setId={id ?? ''} />;
}

function TextEditorWrapper() {
  return <TextEditor />;
}

function FlashcardAppWrapper() {
  const { setId, flashcardId } = useParams();
  return (
    <FlashcardPage flashcardId={flashcardId ?? ''} setId={Number(setId) ?? 0} />
  );
}

function FlashcardEditorWrapper() {
  const { setId } = useParams();
  return <FlashcardEditor setId={Number(setId) ?? 0} />;
}

function FlashcardUpdateWrapper() {
  const { setId, flashcardId } = useParams();
  return (
    <FlashcardEditor
      setId={Number(setId) ?? 0}
      flashcardId={Number(flashcardId) ?? 0}
    />
  );
}

function ExamPageWrapper() {
  const { setId, examId } = useParams();
  return <ExamPage setId={Number(setId) ?? 0} examId={examId ?? ''} />;
}

function ExamEditorWrapper() {
  return <ExamEditor />;
}

function ExamUpdateWrapper() {
  return <ExamEditor />;
}

function AdminDashboardRoute() {
  const { token, user } = useAuth();
  if (!token) {
    return <Navigate to='/login' replace />;
  }
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;
  if (!isAdmin) {
    return <Navigate to='/dashboard' replace />;
  }
  return <AdminDashboardPage />;
}

export const routeConfig: RouteObject[] = [
  // Public routes
  {
    path: '/',
    element: <LandingPageWrapper />,
  },
  {
    path: '/login',
    element: <SignInWrapper />,
  },
  {
    path: '/signup',
    element: <SignUpWrapper />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordWrapper />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailWrapper />,
  },
  {
    path: '/reset-otp',
    element: <ResetOtpWrapper />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordWrapper />,
  },
  {
    path: '/onboarding',
    element: <OnboardingApp />,
  },
  {
    path: '/admin/onboarding',
    element: <Navigate to='/admin' replace />,
  },
  {
    path: '/admin',
    element: <AdminDashboardRoute />,
  },
  // Invite accept pages (email links — no auth required by page itself)
  {
    path: '/invites/accept',
    element: <InviteAcceptPage />,
  },
  {
    path: '/exam-invites/accept',
    element: <ExamInviteAcceptPage />,
  },
  {
    path: '/flashcard-invites/accept',
    element: <FlashcardInviteAcceptPage />,
  },
  // Protected routes
  {
    path: '/',
    element: <ProtectedLayout />,
    children: [
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'todo',
        element: <TodoDashboard />,
      },
      {
        path: 'sets',
        element: <SetListPage />,
      },
      // Explicit routes for set tabs so direct navigation works
      {
        path: 'sets/:id/notes',
        element: <SetSeriesPageWrapper />,
      },
      {
        path: 'sets/:id/flashcards',
        element: <SetSeriesPageWrapper />,
      },
      {
        path: 'sets/:id/exams',
        element: <SetSeriesPageWrapper />,
      },
      {
        path: 'sets/:id/records',
        element: <SetSeriesPageWrapper />,
      },
      {
        path: 'sets/:id/review',
        element: <SetSeriesPageWrapper />,
      },
      {
        path: 'sets/:setId/flashcards/editor',
        element: <FlashcardEditorWrapper />,
      },
      {
        // Route để UPDATE flashcard (phải đặt trước route detail)
        path: 'sets/:setId/flashcards/:flashcardId/update',
        element: <FlashcardUpdateWrapper />,
      },
      {
        // Route để VIEW flashcard detail
        path: 'sets/:setId/flashcards/:flashcardId',
        element: <FlashcardAppWrapper />,
      },
      {
        path: 'sets/:setId/flashcards/:flashcardId/study',
        element: <FlashcardAppWrapper />,
      },
      {
        path: 'sets/:setId/flashcards/:flashcardId/matching',
        element: <FlashcardAppWrapper />,
      },
      {
        path: 'sets/:setId/flashcards/:flashcardId/results',
        element: <FlashcardAppWrapper />,
      },
      {
        path: 'sets/:setId/exams/editor',
        element: <ExamEditorWrapper />,
      },
      {
        path: 'sets/:setId/exams/:examId/edit',
        element: <ExamUpdateWrapper />,
      },
      {
        path: 'sets/:setId/exams/:examId',
        element: <ExamPageWrapper />,
      },
      // Generic set page (kept after more specific set subroutes)
      {
        path: 'sets/:id',
        element: <SetSeriesPageWrapper />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'review-bundles',
        element: <ReviewBundlesPage />,
      },
      {
        path: 'review-bundles/:bundleId',
        element: <ReviewBundlePage />,
      },
      {
        path: 'pomodoro',
        element: <Pomodoro />,
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedLayoutNoSidebar />,
    children: [
      {
        path: 'sets/:setId/notes/:id',
        element: <TextEditorWrapper />,
      },
    ],
  },
];
