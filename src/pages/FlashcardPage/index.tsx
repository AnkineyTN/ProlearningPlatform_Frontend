import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import {
  useDeleteCard,
  useDeleteFlashcard,
  useFlashcardDetail,
  useUpdateCard,
} from "@/hooks/useFlashcards";
import {
  useCancelSession,
  useSessionResult,
  useSessionStatus,
  useStartSession,
  useSyncProgress,
} from "@/hooks/useFlashcardSession";

import FlashcardHeader from "./components/FlashcardHeader";
import HomeView from "./components/HomeView";
import MatchingView from "./components/MatchingView";
import ResultsView from "./components/ResultsView";
import StudyView from "./components/StudyView";

import type { Card } from "@/services/types/flashcard.types";
// Types
type ViewMode = "home" | "study" | "matching" | "results";

interface FlashcardDetailProps {
  setId: number;
  flashcardId: number | string;
}

export default function FlashcardPage({
  setId,
  flashcardId,
}: FlashcardDetailProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const deleteFlashcardMutation = useDeleteFlashcard();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [cardReviews, setCardReviews] = useState<
    Array<{ cardId: number; known: boolean }>
  >([]);
  const [hasFetchedSessionFromHome, setHasFetchedSessionFromHome] =
    useState(false);
  const startSessionMutation = useStartSession();
  const syncProgressMutation = useSyncProgress();
  const cancelSessionMutation = useCancelSession();
  const { data: sessionStatus } = useSessionStatus(
    Number(setId),
    Number(flashcardId),
    viewMode === "study" || viewMode === "home"
  );
  console.log("🚀 ~ FlashcardPage ~ data:", sessionStatus);

  const { data: sessionResult } = useSessionResult(
    Number(setId),
    Number(flashcardId),
    sessionId || 0,
    viewMode === "results"
  );

  // Fetch flashcard data from API
  const { data, isLoading, isError, error, refetch } = useFlashcardDetail(
    Number(setId),
    Number(flashcardId)
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
    console.log("🚀 ~ FlashcardPage ~ cards:", cards);
    return [...cards].sort((a, b) => a.id - b.id);
  }, [data]);

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
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
  const handleBackFromStudy = async () => {
    if (sessionId) {
      try {
        await cancelSessionMutation.mutateAsync({
          setId: Number(setId),
          flashcardId: Number(flashcardId),
          sessionId,
        });
        setSessionId(null);
      } catch (error) {
        console.error("Failed to cancel session:", error);
      }
    }
    navigate(`/sets/${setId}/flashcards/${flashcardId}`);
  };

  const handleShuffle = () => {
    if (isShuffled) {
      // Reset to original order
      setShuffledIndices([]);
      setIsShuffled(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } else {
      // Create shuffled indices array
      const indices = flashcards.map((_, index) => index);
      const shuffled = [...indices].sort(() => Math.random() - 0.5);
      setShuffledIndices(shuffled);
      setIsShuffled(true);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    }
  };

  const displayedFlashcards: Array<Card> = useMemo(() => {
    const cards = data?.data.cards || [];
    const sortedCards = [...cards].sort((a, b) => a.id - b.id);

    if (isShuffled && shuffledIndices.length > 0) {
      return shuffledIndices.map((index) => sortedCards[index]);
    }

    return sortedCards;
  }, [data, isShuffled, shuffledIndices]);
  console.log("🚀 ~ FlashcardPage ~ displayedFlashcards:", displayedFlashcards);

  const handleCardClick = (index: number) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
  };

  const startStudying = async () => {
    try {
      const response = await startSessionMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
      });
      console.log("🚀 ~ startStudying ~ response:", response.data.data);

      const sessionData = response.data.data;
      setSessionId(sessionData.id);

      // Try to determine which card to start from based on session response.
      try {
        const respCards =
          (sessionData as any).cards ?? (sessionData as any).cardItems ?? [];
        let firstCardId: number | null = null;
        if (Array.isArray(respCards)) {
          firstCardId = respCards.length > 0 ? respCards[0].id : null;
        } else if (
          respCards &&
          typeof respCards === "object" &&
          "id" in respCards
        ) {
          firstCardId = (respCards as any).id;
        }

        if (firstCardId != null) {
          const idx = displayedFlashcards.findIndex(
            (c) => c.id === firstCardId
          );
          setCurrentCardIndex(idx >= 0 ? idx : 0);
        } else {
          setCurrentCardIndex(0);
        }
      } catch (e) {
        setCurrentCardIndex(0);
      }

      setIsFlipped(false);
      setCardReviews([]); // Reset reviews
      navigate(`/sets/${setId}/flashcards/${flashcardId}/study`);
    } catch (error) {
      console.error("Failed to start session:", error);
      // Có thể show toast error ở đây
    }
  };

  // While on the Home view, try to fetch/resume the session once so we can
  // display where the user left off (and start from that card when they go
  // to study). We guard with `hasFetchedSessionFromHome` to avoid repeated
  // calls / creating duplicate sessions.
  useEffect(() => {
    if (viewMode !== "home") return;
    if (hasFetchedSessionFromHome) return;
    if (!displayedFlashcards || displayedFlashcards.length === 0) return;

    let mounted = true;

    (async () => {
      try {
        const response = await startSessionMutation.mutateAsync({
          setId: Number(setId),
          flashcardId: Number(flashcardId),
        });

        if (!mounted) return;

        const sessionData = response.data.data;
        setSessionId(sessionData.id);

        const respCards =
          (sessionData as any).cards ?? (sessionData as any).cardItems ?? [];
        let firstCardId: number | null = null;
        if (Array.isArray(respCards)) {
          firstCardId = respCards.length > 0 ? respCards[0].id : null;
        } else if (
          respCards &&
          typeof respCards === "object" &&
          "id" in respCards
        ) {
          firstCardId = (respCards as any).id;
        }

        if (firstCardId != null) {
          const idx = displayedFlashcards.findIndex(
            (c) => c.id === firstCardId
          );
          if (idx >= 0) setCurrentCardIndex(idx);
        }
      } catch (err) {
        console.error("Failed to fetch/resume session from Home:", err);
      } finally {
        if (mounted) setHasFetchedSessionFromHome(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [viewMode, displayedFlashcards, hasFetchedSessionFromHome, setSessionId]);

  const handleCardAnswer = async (known: boolean) => {
    if (!sessionId) return;

    const currentCard = displayedFlashcards[currentCardIndex];
    const review = { cardId: currentCard.id, known };

    // Lưu review vào state
    const updatedReviews = [...cardReviews, review];
    setCardReviews(updatedReviews);

    // Sync progress lên server
    try {
      await syncProgressMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
        sessionId,
        data: { cardItemReviews: [review] },
      });

      // Tự động chuyển card tiếp theo
      handleNext();
    } catch (error) {
      console.error("Failed to sync progress:", error);
    }
  };

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
    imageAssetId?: number;
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

  return (
    <div>
      <FlashcardHeader
        setId={Number(setId)}
        title={title}
        description={description}
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
          flashcards={displayedFlashcards}
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
          flashcards={flashcards}
          onBack={() => navigate(`/sets/${setId}/flashcards/${flashcardId}`)}
        />
      )}
    </div>
  );
}
