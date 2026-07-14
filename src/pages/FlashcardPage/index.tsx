/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { ResourceAccessError } from '@/components/collaboration/ResourceAccessError';

import {
  useDeleteCard,
  useDeleteFlashcard,
  useFlashcardDetail,
  useGenerateExamFromFlashcard,
  useUpdateCard,
} from '@/hooks/useFlashcards';
import {
  useCancelSession,
  useSessionResult,
  useSessionStatus,
  useStartSession,
  useSyncProgress,
} from '@/hooks/useFlashcardSession';
import { useFlashcardStudySettings } from '@/hooks/useFlashcardStudySettings';
import { useSessionTracker } from '@/hooks/useSessionTracker';

import ContinueSessionDialog from './components/ContinueSessionDialog';
import FlashcardHeader from './components/FlashcardHeader';
import HomeView from './components/HomeView';
import MatchingView from './components/MatchingView';
import ResultsView from './components/ResultsView';
import StudyView from './components/StudyView';

import type { StudyMode } from '@/services/types/flashcard-session.types';

import type { Card } from '@/services/types/flashcard.types';

// Types
type ViewMode = 'home' | 'study' | 'matching' | 'results';

type Props = {
  setId: number;
  flashcardId: number | string;
};

const FlashcardPage = ({ setId, flashcardId }: Props) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [studiedCards, setStudiedCards] = useState<Set<number>>(new Set());
  const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);
  const [showContinueDialog, setShowContinueDialog] = useState(false);
  const [pendingSessionData, setPendingSessionData] = useState<any>(null);
  // Reviews that failed to sync — retried on the next answer / back / unload.
  const [unsyncedReviews, setUnsyncedReviews] = useState<
    Array<{ cardId: number; known: boolean }>
  >([]);
  const [studyMode, setStudyMode] = useState<StudyMode | null>(null);
  const [reviewBannerMessage, setReviewBannerMessage] = useState<string>('');
  const { isProgressTrackingEnabled } = useFlashcardStudySettings();

  const { recordItem } = useSessionTracker({
    contentType: 'FLASHCARD',
    setId: Number(flashcardId),
  });

  const { t } = useTranslation();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();
  const deleteFlashcardMutation = useDeleteFlashcard();
  const generateExamMutation = useGenerateExamFromFlashcard();
  const navigate = useNavigate();
  const location = useLocation();
  const goTo = (path: string) => navigate(path, { state: location.state });

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

  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const startSessionMutation = useStartSession();
  const syncProgressMutation = useSyncProgress();
  const cancelSessionMutation = useCancelSession();
  const { data: sessionStatus } = useSessionStatus(
    Number(setId),
    Number(flashcardId),
    viewMode === 'study' || viewMode === 'home',
  );

  const { data: sessionResult } = useSessionResult(
    Number(setId),
    Number(flashcardId),
    sessionId || 0,
    viewMode === 'results',
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
      recordItem();
    }
  };

  const title = useMemo(() => data?.data.title || 'Flashcard Set', [data]);
  const description = useMemo(() => data?.data.description || '', [data]);
  const setTitle = useMemo(() => data?.data.set?.title || '', [data]);

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

  // Accepts overrides because handleCardAnswer may realign the current index
  // to a freshly-started session's card list within the same async call,
  // before the component re-renders with the new state.
  const handleNext = (cardsOverride?: Card[], indexOverride?: number) => {
    const cards = cardsOverride ?? activeCards;
    const index = indexOverride ?? currentCardIndex;
    if (index < cards.length - 1) {
      setCurrentCardIndex(index + 1);
      setIsFlipped(false);
    } else {
      goTo(`/sets/${setId}/flashcards/${flashcardId}/results`);
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
    goTo(`/sets/${setId}/flashcards/${flashcardId}`);
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

    if (statusData.length > 0 && statusData[0].status === 'IN_PROGRESS') {
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
      setStudyMode(sessionData.studyMode ?? null);
      setReviewBannerMessage(
        sessionData.studyMode === 'REVIEW' ? (sessionData.message ?? '') : '',
      );
      setCurrentCardIndex(0);
      setIsFlipped(false);
      // Set viewMode synchronously alongside sessionId so useSessionResult's
      // `enabled` flag never sees the new sessionId while viewMode is still
      // 'results' — navigate()'s location update lands a render later than
      // this state batch, which was firing a spurious GET .../result for the
      // brand-new (not-yet-completed) session.
      setViewMode('study');
      goTo(`/sets/${setId}/flashcards/${flashcardId}/study`);
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error(apiErrorMessage(error, t('flashcard.page.startSessionError')));
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
        // Spec: preserve any studyMode from the existing session if present;
        // otherwise fall back to the start response.
        setStudyMode(
          pendingSessionData.studyMode ?? sessionData.studyMode ?? null,
        );
        const effectiveMode =
          pendingSessionData.studyMode ?? sessionData.studyMode;
        setReviewBannerMessage(
          effectiveMode === 'REVIEW' ? (sessionData.message ?? '') : '',
        );
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowContinueDialog(false);
        setViewMode('study');
        goTo(`/sets/${setId}/flashcards/${flashcardId}/study`);
      } catch (error) {
        console.error('Failed to continue session:', error);
        toast.error(
          apiErrorMessage(error, t('flashcard.page.continueSessionError')),
        );
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
        console.error('Failed to cancel session:', error);
        toast.error(
          apiErrorMessage(error, t('flashcard.page.cancelSessionError')),
        );
      }
    }
  };

  // Starts (or resumes, per the backend's own idempotent behaviour) a session
  // on demand — used when the user grades a card from the Home view, where no
  // session has been started yet. Unlike startNewSession, this does not reset
  // currentCardIndex or navigate, since the caller may be mid-browse.
  const ensureSession = async (): Promise<{
    sessionId: number;
    cards: Card[];
  } | null> => {
    if (sessionId) return { sessionId, cards: sessionCards };

    try {
      const response = await startSessionMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
      });

      const sessionData = response.data.data;
      const cards = sessionData.cards ?? [];
      setSessionId(sessionData.id);
      setSessionCards(cards);
      setStudyMode(sessionData.studyMode ?? null);
      setReviewBannerMessage(
        sessionData.studyMode === 'REVIEW' ? (sessionData.message ?? '') : '',
      );
      return { sessionId: sessionData.id, cards };
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error(apiErrorMessage(error, t('flashcard.page.startSessionError')));
      return null;
    }
  };

  // Fix #1: Returns true when session completes so callers can skip further navigation
  const syncProgress = async (
    reviews: Array<{ cardId: number; known: boolean }>,
    sessionIdOverride?: number,
  ): Promise<boolean> => {
    const activeSessionId = sessionIdOverride ?? sessionId;
    if (!activeSessionId || reviews.length === 0) return false;

    try {
      const response = await syncProgressMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
        sessionId: activeSessionId,
        data: { cardItemReviews: reviews },
      });

      setUnsyncedReviews([]);

      if (response.data.data.status === 'COMPLETED') {
        goTo(`/sets/${setId}/flashcards/${flashcardId}/results`);
        return true;
      }
    } catch (error) {
      console.error('Failed to sync progress:', error);
      // Keep it queued so the next answer / back / unload retries the send.
      setUnsyncedReviews(reviews);
    }
    return false;
  };

  const handleCardAnswer = async (known: boolean) => {
    recordItem();

    // Fix #3: Use activeCards so the correct card ID is read after shuffle
    const cardBeingAnswered = activeCards[currentCardIndex];
    const review = { cardId: cardBeingAnswered.id, known };

    let activeSessionId = sessionId;
    let cardsForNav = activeCards;
    let indexForNav = currentCardIndex;

    // Grading from the Home view (browsing, no session yet) — start one now
    // so the review is tracked exactly like it would be from the Study view.
    if (!activeSessionId) {
      const session = await ensureSession();
      if (!session) {
        // Couldn't start a session — fall back to local-only navigation.
        handleNext();
        return;
      }
      activeSessionId = session.sessionId;
      cardsForNav = session.cards;
      // Home's card order/subset can differ from the session's due-card
      // list, so realign to the same card by id rather than trusting index.
      const idx = session.cards.findIndex((c) => c.id === cardBeingAnswered.id);
      indexForNav = idx >= 0 ? idx : 0;
      setCurrentCardIndex(indexForNav);
      setViewMode('study');
      goTo(`/sets/${setId}/flashcards/${flashcardId}/study`);
    }

    const completed = await syncProgress(
      [...unsyncedReviews, review],
      activeSessionId,
    );
    if (completed) return;

    handleNext(cardsForNav, indexForNav);
  };

  useEffect(() => {
    const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
      if (unsyncedReviews.length > 0 && sessionId) {
        e.preventDefault();
        await syncProgress(unsyncedReviews);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unsyncedReviews, sessionId]);

  const resetFlashcards = () => {
    setStudiedCards(new Set());
    setCurrentCardIndex(0);
    setIsFlipped(false);
    goTo(`/sets/${setId}/flashcards/${flashcardId}/study`);
  };

  // Sync viewMode state with pathname so UI components still read viewMode
  useEffect(() => {
    const p = location.pathname.toLowerCase();
    if (p.endsWith('/study')) setViewMode('study');
    else if (p.endsWith('/matching')) setViewMode('matching');
    else if (p.endsWith('/results')) setViewMode('results');
    else setViewMode('home');
  }, [location.pathname]);

  // Loading state
  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-lg text-muted-foreground'>
          {t('flashcard.page.loading')}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <ResourceAccessError
        resource='flashcard'
        error={error}
        onRetry={() => void refetch()}
      />
    );
  }

  // Empty state
  if (!data?.data || flashcards.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-lg text-muted-foreground mb-2'>
            {t('flashcard.page.empty')}
          </div>
          <div className='text-sm text-muted-foreground'>
            {t('flashcard.page.emptySub')}
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
    cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
  }) => {
    try {
      await updateCardMutation.mutateAsync({
        setId,
        flashcardId,
        cardId: data.id,
        data,
      });
      await refetch();
      toast.success(t('flashcard.page.cardUpdated'));
    } catch (error) {
      console.error('Failed to update card:', error);
      toast.error(apiErrorMessage(error, t('flashcard.page.updateCardError')));
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
      toast.success(t('flashcard.page.cardDeleted'));
    } catch (error) {
      console.error('Failed to delete card:', error);
      toast.error(apiErrorMessage(error, t('flashcard.page.deleteCardError')));
    }
  };

  const handleDeleteFlashcard = async () => {
    try {
      await deleteFlashcardMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
      });
      toast.success(t('flashcard.page.setDeleted'));
      navigate(`/sets/${setId}`);
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error(apiErrorMessage(error, t('flashcard.page.deleteSetError')));
    }
  };

  const handlePracticeWithExam = async () => {
    try {
      const response = await generateExamMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: Number(flashcardId),
      });
      const examId = response.data.data.id;
      goTo(`/sets/${setId}/exams/${examId}`);
    } catch (error) {
      console.error('Failed to generate exam:', error);
      toast.error(apiErrorMessage(error, t('flashcard.page.generateExamError')));
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
        setTitle={setTitle}
        userRole={userRole}
        isFavorited={data?.data.isFavorited}
      />
      <ContinueSessionDialog
        open={showContinueDialog}
        onContinue={handleContinueSession}
        onReset={handleResetSession}
        onOpenChange={setShowContinueDialog}
      />
      {viewMode === 'home' && (
        <HomeView
          setId={setId}
          flashcardId={flashcardId}
          flashcards={displayedFlashcards}
          onCardClick={handleCardClick}
          onStudy={startStudying}
          onMatching={() =>
            goTo(`/sets/${setId}/flashcards/${flashcardId}/matching`)
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

      {viewMode === 'study' && (
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
          reviewBannerMessage={
            studyMode === 'REVIEW' ? reviewBannerMessage : undefined
          }
        />
      )}

      {viewMode === 'results' && (
        <ResultsView
          setId={Number(setId)}
          flashcardId={Number(flashcardId)}
          studiedCards={studiedCards.size}
          totalCards={flashcards.length}
          flashcards={activeCards}
          onHome={() => goTo(`/sets/${setId}/flashcards/${flashcardId}`)}
          onContinue={startNewSession}
          onPracticeWithExam={handlePracticeWithExam}
          onMatching={() =>
            goTo(`/sets/${setId}/flashcards/${flashcardId}/matching`)
          }
          onReset={resetFlashcards}
          sessionResult={sessionResult?.data}
          isProgressTrackingEnabled={isProgressTrackingEnabled}
          isPracticeWithExamLoading={generateExamMutation.isPending}
        />
      )}

      {viewMode === 'matching' && (
        <MatchingView
          setId={Number(setId)}
          flashcardId={flashcardId}
          privacy={privacy}
          flashcards={flashcards}
          flashcardTitle={title}
          onBack={() => goTo(`/sets/${setId}/flashcards/${flashcardId}`)}
        />
      )}
    </div>
  );
};

export default FlashcardPage;
