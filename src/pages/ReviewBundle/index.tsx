import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  useReviewBundle,
  useGenerateFlashcardFromBundle,
  useGenerateExamFromBundle,
  useDismissBundle,
} from '@/hooks/useReviewBundles';

function formatPeriod(from: string, to: string): string {
  const fmt = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };
  return `${fmt(from)} – ${fmt(to)}`;
}

export default function ReviewBundlePage() {
  const { bundleId } = useParams<{ bundleId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useReviewBundle(bundleId);
  const generateFlashcard = useGenerateFlashcardFromBundle();
  const generateExam = useGenerateExamFromBundle();
  const dismissBundle = useDismissBundle();

  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flashcardDone, setFlashcardDone] = useState(false);
  const [examDone, setExamDone] = useState(false);

  const bundle = data?.data;
  const cards = bundle?.cards ?? [];

  const handlePrev = () => {
    setFlipped(false);
    setCardIndex((i) => Math.max(0, i - 1));
  };
  const handleNext = () => {
    setFlipped(false);
    setCardIndex((i) => Math.min(cards.length - 1, i + 1));
  };

  const handleGenerateFlashcard = async () => {
    if (!bundleId) return;
    try {
      const res = await generateFlashcard.mutateAsync(bundleId);
      setFlashcardDone(true);
      toast.success('Đã tạo Flashcard ôn tập thành công!');
      const setId = (res.data as { data?: { setId?: number } })?.data?.setId;
      if (setId) {
        setTimeout(() => navigate(`/sets/${setId}/flashcards`), 1500);
      }
    } catch {
      toast.error('Tạo Flashcard thất bại. Vui lòng thử lại.');
    }
  };

  const handleGenerateExam = async () => {
    if (!bundleId) return;
    try {
      await generateExam.mutateAsync(bundleId);
      setExamDone(true);
      toast.success('Đã tạo Exam ôn tập thành công!');
    } catch {
      toast.error('Tạo Exam thất bại. Vui lòng thử lại.');
    }
  };

  const handleDismiss = async () => {
    if (!bundleId) return;
    try {
      await dismissBundle.mutateAsync(bundleId);
      toast.success('Bundle đã được đánh dấu hoàn thành.');
      navigate('/review-bundles');
    } catch {
      toast.error('Không thể xóa bundle. Vui lòng thử lại.');
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
        <p className='text-destructive'>
          Không tải được bundle. Bundle có thể đã bị xóa.
        </p>
        <Button variant='outline' onClick={() => navigate('/review-bundles')}>
          <ArrowLeft className='w-4 h-4 mr-2' />
          Quay lại
        </Button>
      </div>
    );
  }

  const currentCard = cards[cardIndex];

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-3xl mx-auto'>
        {/* Header */}
        <div className='flex items-center gap-3 mb-6'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate('/review-bundles')}
            className='cursor-pointer'
          >
            <ArrowLeft className='w-4 h-4 mr-1' />
            Bundles
          </Button>
        </div>

        <div className='mb-6'>
          <h1 className='text-xl font-bold'>Bundle #{bundle.id}</h1>
          <p className='text-sm text-muted-foreground mt-1'>
            Kỳ: {formatPeriod(bundle.periodFrom, bundle.periodTo)} &middot;{' '}
            <span className='font-medium text-pink-500'>
              {bundle.cardCount} thẻ sai
            </span>
          </p>
        </div>

        {/* Flip card viewer */}
        {cards.length > 0 ? (
          <div className='mb-8'>
            {/* Card */}
            <div
              className='relative cursor-pointer select-none'
              style={{ perspective: '1000px' }}
              onClick={() => setFlipped((f) => !f)}
            >
              <div
                className='relative w-full min-h-[200px] transition-transform duration-500'
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* Front */}
                <div
                  className='absolute inset-0 flex flex-col items-center justify-center bg-[var(--pl-bg)] border border-border rounded-2xl p-8 text-center backface-hidden'
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <p className='text-xs text-muted-foreground mb-3 uppercase tracking-wider'>
                    Mặt trước
                  </p>
                  <p className='text-lg font-medium'>{currentCard.frontCard}</p>
                  <p className='text-xs text-muted-foreground mt-4'>
                    Nhấn để xem đáp án
                  </p>
                </div>
                {/* Back */}
                <div
                  className='absolute inset-0 flex flex-col items-center justify-center bg-purple-500/10 border border-purple-500/30 rounded-2xl p-8 text-center'
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <p className='text-xs text-muted-foreground mb-3 uppercase tracking-wider'>
                    Mặt sau
                  </p>
                  <p className='text-lg font-medium'>{currentCard.backCard}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className='flex items-center justify-center gap-4 mt-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={handlePrev}
                disabled={cardIndex === 0}
                className='cursor-pointer'
              >
                <ChevronLeft className='w-5 h-5' />
              </Button>
              <span className='text-sm text-muted-foreground'>
                {cardIndex + 1} / {cards.length}
              </span>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleNext}
                disabled={cardIndex >= cards.length - 1}
                className='cursor-pointer'
              >
                <ChevronRight className='w-5 h-5' />
              </Button>
            </div>

            {/* Flip hint */}
            <div className='flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground'>
              <RotateCcw className='w-3 h-3' />
              <span>Nhấn vào thẻ để lật</span>
            </div>
          </div>
        ) : (
          <div className='bg-[var(--pl-bg)] border border-border rounded-2xl p-10 text-center mb-8 text-muted-foreground'>
            Bundle này không có thẻ nào.
          </div>
        )}

        {/* Action buttons */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
          {/* Lưu Flashcard */}
          <Button
            onClick={handleGenerateFlashcard}
            disabled={generateFlashcard.isPending || flashcardDone}
            className='flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 cursor-pointer disabled:opacity-60'
          >
            {generateFlashcard.isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : flashcardDone ? (
              <CheckCircle2 className='w-4 h-4' />
            ) : (
              <BookOpen className='w-4 h-4' />
            )}
            {flashcardDone ? 'Đã tạo Flashcard' : 'Lưu Flashcard'}
          </Button>

          {/* Tạo Exam */}
          <Button
            onClick={handleGenerateExam}
            disabled={generateExam.isPending || examDone}
            variant='outline'
            className='flex items-center gap-2 cursor-pointer disabled:opacity-60'
          >
            {generateExam.isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : examDone ? (
              <CheckCircle2 className='w-4 h-4 text-green-500' />
            ) : (
              <FileText className='w-4 h-4' />
            )}
            {examDone ? 'Đã tạo Exam' : 'Tạo Exam'}
          </Button>

          {/* Đã nắm rồi (Dismiss) */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant='ghost'
                className='flex items-center gap-2 text-muted-foreground hover:text-destructive cursor-pointer'
                disabled={dismissBundle.isPending}
              >
                {dismissBundle.isPending ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Trash2 className='w-4 h-4' />
                )}
                Đã nắm rồi
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xác nhận hoàn thành</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn chắc chắn đã nắm nội dung trong bundle này? Bundle sẽ bị
                  xóa nhưng các Flashcard và Exam đã tạo từ bundle sẽ không bị
                  ảnh hưởng.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDismiss}
                  className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
                >
                  Xóa bundle
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
