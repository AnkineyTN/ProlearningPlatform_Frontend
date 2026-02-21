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
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionId, setSessionId] = useState<number | null>(null);
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

  const handleNext = () => {
    const cardsToUse = sessionCards.length > 0 ? sessionCards : flashcards;
    if (currentCardIndex < cardsToUse.length - 1) {
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
    navigate(`/sets/${setId}/flashcards/${flashcardId}`);
  };

  const handleShuffle = () => {
    const cardsToUse = sessionCards.length > 0 ? sessionCards : flashcards;
    if (isShuffled) {
      // Reset to original order
      setShuffledIndices([]);
      setIsShuffled(false);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } else {
      // Create shuffled indices array
      const indices = cardsToUse.map((_, index) => index);
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

  const handleCardClick = (index: number) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
  };

  const startStudying = async () => {
    // Check session status trước
    const statusData = sessionStatus?.data || [];

    if (statusData.length > 0 && statusData[0].status === "IN_PROGRESS") {
      // Có session đang dở
      setPendingSessionData(statusData[0]);
      setShowContinueDialog(true);
      return;
    }

    // Không có session dở -> start mới
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

      // Sử dụng danh sách cards từ API response
      const respCards = sessionData.cards ?? [];
      setSessionCards(respCards);

      // Bắt đầu từ card đầu tiên trong danh sách
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
        // Gọi lại startSession để lấy danh sách cards còn lại từ BE
        const response = await startSessionMutation.mutateAsync({
          setId: Number(setId),
          flashcardId: Number(flashcardId),
        });

        const sessionData = response.data.data;
        setSessionId(sessionData.id);

        // Sử dụng danh sách cards từ API response
        const respCards = sessionData.cards ?? [];
        setSessionCards(respCards);

        // Bắt đầu từ card đầu tiên trong danh sách
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
        await startNewSession();
      } catch (error) {
        console.error("Failed to cancel session:", error);
        toast.error("Không thể hủy phiên học cũ");
      }
    }
  };

  const handleCardAnswer = async (known: boolean) => {
    if (!sessionId) return;

    const currentCard = sessionCards[currentCardIndex];
    const review = { cardId: currentCard.id, known };

    // Thêm vào unsynced reviews
    const newUnsyncedReviews = [...unsyncedReviews, review];
    setUnsyncedReviews(newUnsyncedReviews);
    setCardReviews([...cardReviews, review]);

    // Sync nếu đủ batch size
    if (newUnsyncedReviews.length >= SYNC_BATCH_SIZE) {
      await syncProgress(newUnsyncedReviews);
    }

    // Tự động next
    handleNext();
  };

  const syncProgress = async (
    reviews: Array<{ cardId: number; known: boolean }>,
  ) => {
    if (!sessionId || reviews.length === 0) return;

    try {
      const response = await syncProgressMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
        sessionId,
        data: { cardItemReviews: reviews },
      });

      // Clear unsynced sau khi sync thành công
      setUnsyncedReviews([]);

      // Check nếu completed
      if (response.data.data.status === "COMPLETED") {
        navigate(`/sets/${setId}/flashcards/${flashcardId}/results`);
      }
    } catch (error) {
      console.error("Failed to sync progress:", error);
    }
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
          flashcards={
            sessionCards.length > 0 ? sessionCards : displayedFlashcards
          }
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
          flashcards={sessionCards.length > 0 ? sessionCards : flashcards}
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
};
