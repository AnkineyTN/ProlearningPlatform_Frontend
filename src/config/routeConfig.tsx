import { useSelector } from "react-redux";
import { Navigate, useParams } from "react-router-dom";

import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import ProtectedLayout from "@/components/ProtectedLayout";
import ProtectedLayoutNoSidebar from "@/components/ProtectedLayoutNoSidebar";
import Dashboard from "@/pages/Dashboard";
import FlashcardPage from "@/pages/FlashcardPage";
import FlashcardEditor from "@/pages/FlashcardPage/FlashcardEditor";
import LandingPage from "@/pages/LandingPage";
import TextEditor from "@/pages/NotePage";
import OnboardingApp from "@/pages/OnboardingApp.tsx";
import SetListPage from "@/pages/SetListPage";
import SetSeriesPage from "@/pages/SetSeriesPage";
import TodoDashboard from "@/pages/TodoDashboard";
import PDFAnnotator from "@/pages/PDF";
import TestPage from "@/pages/TestPage";
import TestEditor from "@/pages/TestPage/TestEditor";
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

function TestPageWrapper() {
  const { setId, testId } = useParams();
  return <TestPage setId={Number(setId) ?? 0} testId={testId ?? ""} />;
}

function TestEditorWrapper() {
  const { setId } = useParams();
  return <TestEditor setId={Number(setId) ?? 0} />;
}

function TestUpdateWrapper() {
  const { setId, testId } = useParams();
  return <TestEditor setId={Number(setId) ?? 0} testId={Number(testId) ?? 0} />;
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
    path: "/onboarding",
    element: <OnboardingApp />,
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
        path: "sets/:id/tests",
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
        path: "sets/:setId/tests/editor",
        element: <TestEditorWrapper />,
      },
      {
        // Route để UPDATE test (phải đặt trước route detail)
        path: "sets/:setId/tests/:testId/edit",
        element: <TestUpdateWrapper />,
      },
      {
        // Route để VIEW test detail
        path: "sets/:setId/tests/:testId",
        element: <TestPageWrapper />,
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
        path: "note/:id",
        element: <TextEditorWrapper />,
      },
    ],
  },
];
