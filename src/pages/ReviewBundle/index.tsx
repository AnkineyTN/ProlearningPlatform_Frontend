import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { Button } from '@/components/ui/button';
import {
  useReviewBundle,
  useReviewBundles,
  useGenerateFlashcardFromBundle,
  useGenerateExamFromBundle,
  useDismissBundle,
} from '@/hooks/useReviewBundles';
import { BundleDetailHeader } from './components/BundleDetailHeader';
import { FlipCardViewer } from './components/FlipCardViewer';
import { CardListViewer } from './components/CardListViewer';
import { BundleActionBar } from './components/BundleActionBar';

type ViewMode = 'flip' | 'list';

export default function ReviewBundlePage() {
  const { t } = useTranslation();
  const { bundleId } = useParams<{ bundleId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useReviewBundle(bundleId);
  const { data: bundleList } = useReviewBundles();
  const generateFlashcard = useGenerateFlashcardFromBundle();
  const generateExam = useGenerateExamFromBundle();
  const dismissBundle = useDismissBundle();

  const [viewMode, setViewMode] = useState<ViewMode>('flip');
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flashcardDone, setFlashcardDone] = useState(false);
  const [flashcardSetId, setFlashcardSetId] = useState<string | number | null>(null);
  const [examDone, setExamDone] = useState(false);
  const [examTarget, setExamTarget] = useState<{
    setId: number;
    examId: number;
  } | null>(null);

  const bundle = data?.data;
  const cards = bundle?.cards ?? [];

  // Neither the bundle detail nor the exam-from-bundle response carries setId,
  // so fall back to the list item, which always does.
  const bundleSetId = bundleList?.data?.find(
    (b) => b.id === Number(bundleId),
  )?.setId;

  const handlePrev = () => {
    setFlipped(false);
    setCardIndex((i) => Math.max(0, i - 1));
  };
  const handleNext = () => {
    setFlipped(false);
    setCardIndex((i) => Math.min(cards.length - 1, i + 1));
  };

  const openFlashcard = (setId: string | number) =>
    navigate(`/sets/${setId}/flashcards`);

  const handleGenerateFlashcard = async () => {
    if (!bundleId) return;
    try {
      const res = await generateFlashcard.mutateAsync(bundleId);
      setFlashcardDone(true);
      const generated = res.data?.data as { id?: string | number; setId?: number };
      const setId = generated?.id ?? generated?.setId ?? null;
      setFlashcardSetId(setId);
      toast.success(
        t('reviewBundles.detail.toast.flashcardSuccess'),
        setId
          ? {
              action: {
                label: t('reviewBundles.detail.toast.flashcardView'),
                onClick: () => openFlashcard(setId),
              },
            }
          : undefined,
      );
    } catch (error) {
      toast.error(
        apiErrorMessage(error, t('reviewBundles.detail.toast.flashcardError')),
      );
    }
  };

  const openExam = (setId: number, examId: number) =>
    navigate(`/sets/${setId}/exams/${examId}`);

  const handleGenerateExam = async () => {
    if (!bundleId) return;
    try {
      const res = await generateExam.mutateAsync(bundleId);
      setExamDone(true);
      const exam = res.data?.data;
      const setId = exam?.setId ?? bundleSetId;
      const examId = exam?.id;
      const target =
        setId != null && examId != null ? { setId, examId } : null;
      setExamTarget(target);
      toast.success(
        t('reviewBundles.detail.toast.examSuccess'),
        target
          ? {
              action: {
                label: t('reviewBundles.detail.toast.examView'),
                onClick: () => openExam(target.setId, target.examId),
              },
            }
          : undefined,
      );
    } catch (error) {
      toast.error(
        apiErrorMessage(error, t('reviewBundles.detail.toast.examError')),
      );
    }
  };

  const handleDismiss = async () => {
    if (!bundleId) return;
    try {
      await dismissBundle.mutateAsync(bundleId);
      toast.success(t('reviewBundles.detail.toast.dismissSuccess'));
      navigate('/review-bundles');
    } catch (error) {
      toast.error(
        apiErrorMessage(error, t('reviewBundles.detail.toast.dismissError')),
      );
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Loader2 className='w-8 h-8 animate-spin text-muted-foreground' />
      </div>
    );
  }

  if (isError || !bundle) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
        <p className='text-destructive'>{t('reviewBundles.detail.error.load')}</p>
        <Button variant='outline' onClick={() => navigate('/review-bundles')}>
          <ArrowLeft className='w-4 h-4 mr-2' />
          {t('reviewBundles.detail.error.back')}
        </Button>
      </div>
    );
  }

  const currentCard = cards[cardIndex];

  const overlayBusy =
    generateFlashcard.isPending ||
    generateExam.isPending ||
    dismissBundle.isPending;

  const status = flashcardDone && examDone
    ? 'both'
    : flashcardDone
      ? 'flashcardOnly'
      : examDone
        ? 'examOnly'
        : null;

  return (
    <div className='min-h-screen p-6 relative'>
      <div className='max-w-3xl mx-auto'>
        <BundleDetailHeader
          bundle={bundle}
          hasCards={cards.length > 0}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onBack={() => navigate('/review-bundles')}
        />

        {cards.length > 0 ? (
          viewMode === 'flip' ? (
            <FlipCardViewer
              card={currentCard}
              index={cardIndex}
              total={cards.length}
              flipped={flipped}
              onFlip={() => setFlipped((f) => !f)}
              onPrev={handlePrev}
              onNext={handleNext}
            />
          ) : (
            <CardListViewer cards={cards} />
          )
        ) : (
          <div className='bg-[var(--pl-bg)] border border-border rounded-2xl p-10 text-center mb-8 text-muted-foreground'>
            {t('reviewBundles.detail.empty')}
          </div>
        )}

        <BundleActionBar
          onGenerateFlashcard={handleGenerateFlashcard}
          onOpenFlashcard={
            flashcardSetId != null ? () => openFlashcard(flashcardSetId) : undefined
          }
          onGenerateExam={handleGenerateExam}
          onOpenExam={
            examTarget
              ? () => openExam(examTarget.setId, examTarget.examId)
              : undefined
          }
          onDismiss={handleDismiss}
          flashcardPending={generateFlashcard.isPending}
          examPending={generateExam.isPending}
          dismissPending={dismissBundle.isPending}
          flashcardDone={flashcardDone}
          examDone={examDone}
          status={status}
        />
      </div>

      {overlayBusy && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm'>
          <div className='bg-[var(--pl-bg-elev)] border border-border rounded-xl px-5 py-4 flex items-center gap-3 shadow-lg'>
            <Loader2 className='w-5 h-5 animate-spin' />
            <span className='text-sm'>{t('reviewBundles.detail.processing')}</span>
          </div>
        </div>
      )}
    </div>
  );
}
