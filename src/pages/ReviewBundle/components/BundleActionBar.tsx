import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  FileText,
  ListRestart,
  Loader2,
  Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
import { Button } from '@/components/ui/button';

type StatusKind = 'both' | 'flashcardOnly' | 'examOnly' | null;

export function BundleActionBar({
  onGenerateFlashcard,
  onOpenFlashcard,
  onGenerateExam,
  onOpenExam,
  onDismiss,
  flashcardPending,
  examPending,
  dismissPending,
  flashcardDone,
  examDone,
  status,
}: {
  onGenerateFlashcard: () => void;
  onOpenFlashcard?: () => void;
  onGenerateExam: () => void;
  onOpenExam?: () => void;
  onDismiss: () => void;
  flashcardPending: boolean;
  examPending: boolean;
  dismissPending: boolean;
  flashcardDone: boolean;
  examDone: boolean;
  status: StatusKind;
}) {
  const { t } = useTranslation();

  const canOpenFlashcard = flashcardDone && !!onOpenFlashcard;
  const canOpenExam = examDone && !!onOpenExam;

  return (
    <>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        <Button
          onClick={canOpenFlashcard ? onOpenFlashcard : onGenerateFlashcard}
          disabled={flashcardPending || (flashcardDone && !canOpenFlashcard)}
          className='flex items-center gap-2 bg-gradient-to-r from-[var(--pl-accent)] to-[var(--pl-accent-strong)] text-[var(--pl-accent-fg)] hover:opacity-90 cursor-pointer disabled:opacity-60'
        >
          {flashcardPending ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : canOpenFlashcard ? (
            <ArrowRight className='w-4 h-4' />
          ) : flashcardDone ? (
            <CheckCircle2 className='w-4 h-4' />
          ) : (
            <BookOpen className='w-4 h-4' />
          )}
          {canOpenFlashcard
            ? t('reviewBundles.detail.actions.openFlashcard')
            : flashcardDone
              ? t('reviewBundles.detail.actions.flashcardSaved')
              : t('reviewBundles.detail.actions.saveFlashcard')}
        </Button>

        <Button
          onClick={canOpenExam ? onOpenExam : onGenerateExam}
          disabled={examPending || (examDone && !canOpenExam)}
          className='flex items-center gap-2 cursor-pointer disabled:opacity-60'
        >
          {examPending ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : canOpenExam ? (
            <ArrowRight className='w-4 h-4' />
          ) : examDone ? (
            <CheckCircle2 className='w-4 h-4 text-[var(--pl-success)]' />
          ) : (
            <FileText className='w-4 h-4' />
          )}
          {canOpenExam
            ? t('reviewBundles.detail.actions.openExam')
            : examDone
              ? t('reviewBundles.detail.actions.examCreated')
              : t('reviewBundles.detail.actions.createExam')}
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant='outline'
              className='flex items-center gap-2 hover:text-[var(--pl-danger-text)] hover:bg-[var(--pl-danger-soft)]'
              disabled={dismissPending}
            >
              {dismissPending ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                <Trash2 className='w-4 h-4' />
              )}
              {t('reviewBundles.detail.actions.dismiss')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('reviewBundles.detail.actions.confirmTitle')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('reviewBundles.detail.actions.confirmDescription')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={onDismiss}
                className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              >
                {t('reviewBundles.detail.actions.confirmDelete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {status && (
        <div className='mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground'>
          <ListRestart className='w-4 h-4 text-[var(--pl-success)]' />
          <span>{t(`reviewBundles.detail.status.${status}`)}</span>
        </div>
      )}
    </>
  );
}
