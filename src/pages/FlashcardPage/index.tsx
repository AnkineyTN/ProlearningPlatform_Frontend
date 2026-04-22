/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useDeleteCard,
  useDeleteFlashcard,
  useFlashcardDetail,
  useGenerateExamFromFlashcard,
  useUpdateCard,
} from "@/hooks/useFlashcards";
import {
  useCancelSession,
  useSessionResult,
  useSessionStatus,
  useStartSession,
  useSyncProgress,
} from "@/hooks/useFlashcardSession";

import ContinueSessionDialog from "./components/ContinueSessionDialog";
import FlashcardHeader from "./components/FlashcardHeader";
import HomeView from "./components/HomeView";
import MatchingView from "./components/MatchingView";
import ResultsView from "./components/ResultsView";
import StudyView from "./components/StudyView";

import type { Card } from "@/services/types/flashcard.types";

// Types
type ViewMode = "home" | "study" | "matching" | "results";

type Props = {
  setId: number;
  flashcardId: number | string;
};

const FlashcardPage = ({ setId, flashcardId }: Props) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<any>(null);
  const [unsyncedReviews, setUnsyncedReviews] = useState<
    Array<{ cardId: number; known: boolean }>
  >([]);
  const SYNC_BATCH_SIZE = 1;

  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const deleteFlashcardMutation = useDeleteFlashcard();
  const generateExamMutation = useGenerateExamFromFlashcard();
  const navigate = useNavigate();
  const location = useLocation();

  // Fix #5: Persist sessionId to sessionStorage so results page survives a refresh
  const SESSION_STORAGE_KEY = `flashcard-session-${setId}-${flashcardId}`;
  const [sessionId, setSessionIdState] = useState<number | null>(null);

  const setSessionId = (id: number | null) => {
    try {
      if (id !== null) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, String(id));
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
    setSessionIdState(id);
  };

  // Restore sessionId from sessionStorage on mount
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) setSessionIdState(Number(stored));
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [cardReviews, setCardReviews] = useState<
    Array<{ cardId: number; known: boolean }>
  >([]);
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const startSessionMutation = useStartSession();
  const syncProgressMutation = useSyncProgress();
  const cancelSessionMutation = useCancelSession();
  const { data: sessionStatus } = useSessionStatus(
    Number(setId),
    Number(flashcardId),
    viewMode === "study" || viewMode === "home",
  );

  const { data: sessionResult } = useSessionResult(
    Number(setId),
    Number(flashcardId),
    sessionId || 0,
    viewMode === "results",
  );

  // Fetch flashcard data from API
  const { data, isLoading, isError, error, refetch } = useFlashcardDetail(
    Number(setId),
    Number(flashcardId),
  );

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setStudiedCards(new Set(studiedCards).add(currentCardIndex));
    }
  };

  const title = useMemo(() => data?.data.title || "Flashcard Set", [data]);
  const description = useMemo(() => data?.data.description || "", [data]);

  const flashcards: Array<Card> = useMemo(() => {
    const cards = data?.data.cards || [];
    return [...cards].sort((a, b) => a.id - b.id);
  }, [data]);

  // Apply shuffle to original cards (used in home / matching views)
  const displayedFlashcards: Array<Card> = useMemo(() => {
    if (isShuffled && shuffledIndices.length > 0) {
      return shuffledIndices.map((index) => flashcards[index]);
    }
    return flashcards;
  }, [flashcards, isShuffled, shuffledIndices]);

  // Fix #3: Apply shuffle to session cards so shuffle works in study mode
  const displayedSessionCards: Array<Card> = useMemo(() => {
    if (sessionCards.length === 0) return [];
    if (isShuffled && shuffledIndices.length > 0) {
      return shuffledIndices.map((i) => sessionCards[i]);
    }
    return sessionCards;
  }, [sessionCards, isShuffled, shuffledIndices]);

  // Single source of truth: session cards take priority over original cards
  const activeCards: Array<Card> = useMemo(
    () =>
      displayedSessionCards.length > 0
        ? displayedSessionCards
        : displayedFlashcards,
    [displayedSessionCards, displayedFlashcards],
  );

  const handleNext = () => {
    if (currentCardIndex < activeCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      navigate(`/sets/${setId}/flashcards/${flashcardId}/results`);
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  // Fix #2: Sync any pending reviews before navigating back
  const handleBackFromStudy = async () => {
    if (unsyncedReviews.length > 0 && sessionId) {
      try {
        await syncProgressMutation.mutateAsync({
          setId: Number(setId),
          flashcardId: Number(flashcardId),
          sessionId,
          data: { cardItemReviews: unsyncedReviews },
        });
        setUnsyncedReviews([]);
      } catch {
        // best-effort – navigate home regardless
      }
    }
    navigate(`/sets/${setId}/flashcards/${flashcardId}`);
  };

  const handleShuffle = () => {
    if (isShuffled) {
      setShuffledIndices([]);
      setIsShuffled(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } else {
      const length =
        sessionCards.length > 0 ? sessionCards.length : flashcards.length;
      const shuffled = Array.from({ length }, (_, i) => i).sort(
        () => Math.random() - 0.5,
      );
      setShuffledIndices(shuffled);
      setIsShuffled(true);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const handleCardClick = (index: number) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
  };

  const startStudying = async () => {
    const statusData = sessionStatus?.data || [];

    if (statusData.length > 0 && statusData[0].status === "IN_PROGRESS") {
      setPendingSessionData(statusData[0]);
      setShowContinueDialog(true);
      return;
    }

    await startNewSession();
  };

  const startNewSession = async () => {
    try {
      const response = await startSessionMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
      });

      const sessionData = response.data.data;
      setSessionId(sessionData.id);
      setSessionCards(sessionData.cards ?? []);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setCardReviews([]);
      navigate(`/sets/${setId}/flashcards/${flashcardId}/study`);
    } catch (error) {
      console.error("Failed to start session:", error);
      toast.error("Không thể bắt đầu phiên học");
    }
  };

  const handleContinueSession = async () => {
    if (pendingSessionData) {
      try {
        const response = await startSessionMutation.mutateAsync({
          setId: Number(setId),
          flashcardId: Number(flashcardId),
        });

        const sessionData = response.data.data;
        setSessionId(sessionData.id);
        setSessionCards(sessionData.cards ?? []);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowContinueDialog(false);
        navigate(`/sets/${setId}/flashcards/${flashcardId}/study`);
      } catch (error) {
        console.error("Failed to continue session:", error);
        toast.error("Không thể tiếp tục phiên học");
      }
    }
  };

  const handleResetSession = async () => {
    if (pendingSessionData?.id) {
      try {
        await cancelSessionMutation.mutateAsync({
          setId: Number(setId),
          flashcardId: Number(flashcardId),
          sessionId: pendingSessionData.id,
        });
        setShowContinueDialog(false);
        setSessionId(null); // clears sessionStorage too
        await startNewSession();
      } catch (error) {
        console.error("Failed to cancel session:", error);
        toast.error("Không thể hủy phiên học cũ");
      }
    }
  };

  // Fix #1: Returns true when session completes so callers can skip further navigation
  const syncProgress = async (
    reviews: Array<{ cardId: number; known: boolean }>,
  ): Promise<boolean> => {
    if (!sessionId || reviews.length === 0) return false;

    try {
      const response = await syncProgressMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
        sessionId,
        data: { cardItemReviews: reviews },
      });

      setUnsyncedReviews([]);

      if (response.data.data.status === "COMPLETED") {
        navigate(`/sets/${setId}/flashcards/${flashcardId}/results`);
        return true;
      }
    } catch (error) {
      console.error("Failed to sync progress:", error);
    }
    return false;
  };

  const handleCardAnswer = async (known: boolean) => {
    if (!sessionId) return;

    // Fix #3: Use activeCards so the correct card ID is read after shuffle
    const currentCard = activeCards[currentCardIndex];
    const review = { cardId: currentCard.id, known };

    const newUnsyncedReviews = [...unsyncedReviews, review];
    setUnsyncedReviews(newUnsyncedReviews);
    setCardReviews([...cardReviews, review]);

    if (newUnsyncedReviews.length >= SYNC_BATCH_SIZE) {
      // Fix #1: If session completed, syncProgress already navigated – skip handleNext
      const completed = await syncProgress(newUnsyncedReviews);
      if (completed) return;
    }

    handleNext();
  };

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (unsyncedReviews.length > 0 && sessionId) {
        e.preventDefault();
        await syncProgress(unsyncedReviews);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsyncedReviews, sessionId]);

  const resetFlashcards = () => {
    setStudiedCards(new Set());
    setCurrentCardIndex(0);
    setIsFlipped(false);
    navigate(`/sets/${setId}/flashcards/${flashcardId}/study`);
  };

  // Sync viewMode state with pathname so UI components still read viewMode
  useEffect(() => {
    const p = location.pathname.toLowerCase();
    if (p.endsWith("/study")) setViewMode("study");
    else if (p.endsWith("/matching")) setViewMode("matching");
    else if (p.endsWith("/results")) setViewMode("results");
    else setViewMode("home");
  }, [location.pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg text-muted-foreground'>
          Loading flashcards...
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-destructive mb-2'>
            Error loading flashcards
          </div>
          <div className='text-sm text-muted-foreground'>
            {error instanceof Error ? error.message : "Unknown error"}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data?.data || flashcards.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-muted-foreground mb-2'>
            No flashcards available
          </div>
          <div className='text-sm text-muted-foreground'>
            This flashcard set is empty
          </div>
        </div>
      </div>
    );
  }

  const handleUpdateCard = async (data: {
    id: number;
    frontCard: string;
    backCard: string;
    imageAssetId?: number | null;
    cardStatus?: "NEW" | "LEARNING" | "KNOWN";
  }) => {
    try {
      await updateCardMutation.mutateAsync({
        setId,
        flashcardId,
        cardId: data.id,
        data,
      });
      await refetch();
      toast.success("Card updated successfully");
    } catch (error) {
      console.error("Failed to update card:", error);
      toast.error("Failed to update card. Please try again.");
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    try {
      await deleteCardMutation.mutateAsync({
        setId,
        flashcardId,
        cardId,
      });
      await refetch();
      toast.success("Card deleted successfully");
    } catch (error) {
      console.error("Failed to delete card:", error);
      toast.error("Failed to delete card. Please try again.");
    }
  };

  const handleDeleteFlashcard = async () => {
    try {
      await deleteFlashcardMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
      });
      toast.success("Flashcard set deleted successfully");
      navigate(`/sets/${setId}`);
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Failed to delete flashcard. Please try again.");
    }
  };

  const handlePracticeWithExam = async () => {
    try {
      const response = await generateExamMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
      });
      const examId = response.data.data.id;
      navigate(`/sets/${setId}/exams/${examId}`);
    } catch (error) {
      console.error("Failed to generate exam:", error);
      toast.error("Failed to generate exam. Please try again.");
    }
  };

  const userRole = data?.data.userRole ?? 'OWNER';
  const privacy = data?.data.privacy ?? 'PRIVATE';

  return (
    <div>
      <FlashcardHeader
        setId={Number(setId)}
        flashcardId={Number(flashcardId)}
        title={title}
        description={description}
        userRole={userRole}
      />
      <ContinueSessionDialog
        open={showContinueDialog}
        onContinue={handleContinueSession}
        onReset={handleResetSession}
        onOpenChange={setShowContinueDialog}
      />
      {viewMode === "home" && (
        <HomeView
          setId={setId}
          flashcardId={flashcardId}
          flashcards={displayedFlashcards}
          onCardClick={handleCardClick}
          onStudy={startStudying}
          onMatching={() =>
            navigate(`/sets/${setId}/flashcards/${flashcardId}/matching`)
          }
          onPracticeWithExam={handlePracticeWithExam}
          isPracticeWithExamLoading={generateExamMutation.isPending}
          isFlipped={isFlipped}
          currentCardIndex={currentCardIndex}
          onFlip={handleFlip}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onUpdateCard={handleUpdateCard}
          onDeleteCard={handleDeleteCard}
          onDeleteFlashcard={handleDeleteFlashcard}
          isUpdating={updateCardMutation.isPending}
          isDeletingFlashcard={deleteFlashcardMutation.isPending}
          onShuffle={handleShuffle}
          onCardAnswer={handleCardAnswer}
        />
      )}

      {viewMode === "study" && (
        <StudyView
          flashcards={activeCards}
          currentCardIndex={currentCardIndex}
          isFlipped={isFlipped}
          onBack={handleBackFromStudy}
          onFlip={handleFlip}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onShuffle={handleShuffle}
          onCardAnswer={handleCardAnswer}
          sessionProgress={sessionStatus?.data?.[0]}
        />
      )}

      {viewMode === "results" && (
        <ResultsView
          studiedCards={studiedCards.size}
          totalCards={flashcards.length}
          flashcards={activeCards}
          onHome={() => navigate(`/sets/${setId}/flashcards/${flashcardId}`)}
          onContinue={() =>
            navigate(`/sets/${setId}/flashcards/${flashcardId}/study`)
          }
          onReset={resetFlashcards}
          sessionResult={sessionResult?.data}
        />
      )}

      {viewMode === "matching" && (
        <MatchingView
          setId={Number(setId)}
          flashcardId={flashcardId}
          privacy={privacy}
          flashcards={flashcards}
          onBack={() => navigate(`/sets/${setId}/flashcards/${flashcardId}`)}
        />
      )}
    </div>
  );
};

export default FlashcardPage;
