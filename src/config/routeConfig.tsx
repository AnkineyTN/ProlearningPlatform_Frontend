/* eslint-disable no-constant-binary-expression */
/* eslint-disable react-refresh/only-export-components */
import { useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";

import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import ForgotPassword from "@/components/auth/ForgotPassword";
import VerifyEmail from "@/components/auth/VerifyEmail";
import ResetOtp from "@/components/auth/ResetOtp";
import ResetPassword from "@/components/auth/ResetPassword";
import ProtectedLayout from "@/components/ProtectedLayout";
import ProtectedLayoutNoSidebar from "@/components/ProtectedLayoutNoSidebar";
import Dashboard from "@/pages/Dashboard";
import FlashcardPage from "@/pages/FlashcardPage";
import FlashcardEditor from "@/pages/FlashcardPage/FlashcardEditor";
import LandingPage from "@/pages/LandingPage";
import TextEditor from "@/pages/NotePage";
import OnboardingApp from "@/pages/OnboardingApp.tsx";
import AdminOnboardingPage from "@/pages/AdminOnboardingPage";
import SetListPage from "@/pages/SetListPage";
import SetSeriesPage from "@/pages/SetSeriesPage";
import TodoDashboard from "@/pages/TodoDashboard";
import PDFAnnotator from "@/pages/PDF";
import ExamPage from "@/pages/ExamPage";
import ExamEditor from "@/pages/ExamPage/ExamEditor";
import type { RouteObject } from "react-router-dom";

import type { RootState } from "@/store";
function LandingPageWrapper() {
  const token = useSelector((state: RootState) => state.auth.token);

  if (token) {
    return <Navigate to='/dashboard' replace />;
  }

  return <LandingPage />;
}

function SignInWrapper() {
  const token = useSelector((state: RootState) => state.auth.token);

  if (token) {
    return <Navigate to='/dashboard' replace />;
  }

  return <SignIn />;
}

function SignUpWrapper() {
  const token = useSelector((state: RootState) => state.auth.token);

  if (token) {
    return <Navigate to='/dashboard' replace />;
  }

  return <SignUp />;
}

function ForgotPasswordWrapper() {
  const token = useSelector((state: RootState) => state.auth.token);
  if (token) return <Navigate to='/dashboard' replace />;
  return <ForgotPassword />;
}

function VerifyEmailWrapper() {
  const token = useSelector((state: RootState) => state.auth.token);
  if (!token) return <Navigate to='/login' replace />;
  return <VerifyEmail />;
}

function ResetOtpWrapper() {
  const token = useSelector((state: RootState) => state.auth.token);
  if (token) return <Navigate to='/dashboard' replace />;
  return <ResetOtp />;
}

function ResetPasswordWrapper() {
  const token = useSelector((state: RootState) => state.auth.token);
  if (token) return <Navigate to='/dashboard' replace />;
  return <ResetPassword />;
}

// Wrapper component to extract setId from params and pass as prop
function SetSeriesPageWrapper() {
  const { id } = useParams();
  return <SetSeriesPage setId={id ?? ""} />;
}

function TextEditorWrapper() {
  return <TextEditor />;
}

function FlashcardAppWrapper() {
  const { setId, flashcardId } = useParams();
  return (
    <FlashcardPage flashcardId={flashcardId ?? ""} setId={Number(setId) ?? 0} />
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
  return <ExamPage setId={Number(setId) ?? 0} examId={examId ?? ""} />;
}

function ExamEditorWrapper() {
  return <ExamEditor />;
}

function ExamUpdateWrapper() {
  return <ExamEditor />;
}

function AdminOnboardingRoute() {
  const token = useSelector((s: RootState) => s.auth.token);
  const user = useSelector((s: RootState) => s.auth.user);
  if (!token) {
    return <Navigate to='/login' replace />;
  }
  const isAdmin = user?.roles?.includes("ROLE_ADMIN") ?? false;
  if (!isAdmin) {
    return <Navigate to='/dashboard' replace />;
  }
  return <AdminOnboardingPage />;
}

export const routeConfig: RouteObject[] = [
  // Public routes
  {
    path: "/",
    element: <LandingPageWrapper />,
  },
  {
    path: "/login",
    element: <SignInWrapper />,
  },
  {
    path: "/signup",
    element: <SignUpWrapper />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordWrapper />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmailWrapper />,
  },
  {
    path: "/reset-otp",
    element: <ResetOtpWrapper />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordWrapper />,
  },
  {
    path: "/onboarding",
    element: <OnboardingApp />,
  },
  {
    path: "/admin/onboarding",
    element: <AdminOnboardingRoute />,
  },
  {
    path: "/test",
    element: <PDFAnnotator />,
  },
  // Protected routes
  {
    path: "/",
    element: <ProtectedLayout />,
    children: [
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "todo",
        element: <TodoDashboard />,
      },
      {
        path: "sets",
        element: <SetListPage />,
      },
      // Explicit routes for set tabs so direct navigation works
      {
        path: "sets/:id/notes",
        element: <SetSeriesPageWrapper />,
      },
      {
        path: "sets/:id/flashcards",
        element: <SetSeriesPageWrapper />,
      },
      {
        path: "sets/:id/mindmaps",
        element: <SetSeriesPageWrapper />,
      },
      {
        path: "sets/:id/exams",
        element: <SetSeriesPageWrapper />,
      },
      {
        path: "sets/:id/records",
        element: <SetSeriesPageWrapper />,
      },
      {
        path: "sets/:setId/flashcards/editor",
        element: <FlashcardEditorWrapper />,
      },
      {
        // Route để UPDATE flashcard (phải đặt trước route detail)
        path: "sets/:setId/flashcards/:flashcardId/update",
        element: <FlashcardUpdateWrapper />,
      },
      {
        // Route để VIEW flashcard detail
        path: "sets/:setId/flashcards/:flashcardId",
        element: <FlashcardAppWrapper />,
      },
      {
        path: "sets/:setId/flashcards/:flashcardId/study",
        element: <FlashcardAppWrapper />,
      },
      {
        path: "sets/:setId/flashcards/:flashcardId/matching",
        element: <FlashcardAppWrapper />,
      },
      {
        path: "sets/:setId/flashcards/:flashcardId/results",
        element: <FlashcardAppWrapper />,
      },
      {
        path: "sets/:setId/exams/editor",
        element: <ExamEditorWrapper />,
      },
      {
        path: "sets/:setId/exams/:examId/edit",
        element: <ExamUpdateWrapper />,
      },
      {
        path: "sets/:setId/exams/:examId",
        element: <ExamPageWrapper />,
      },
      // Generic set page (kept after more specific set subroutes)
      {
        path: "sets/:id",
        element: <SetSeriesPageWrapper />,
      },
    ],
  },
  {
    path: "/",
    element: <ProtectedLayoutNoSidebar />,
    children: [
      {
        path: "sets/:setId/notes/:id",
        element: <TextEditorWrapper />,
      },
    ],
  },
];
