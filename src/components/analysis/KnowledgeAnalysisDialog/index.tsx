import { AlertCircle, Brain, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useAssignExamTopics,
  useAssignFlashcardTopics,
} from '@/hooks/useKnowledgeAnalysis';
import AnalysisResult from './AnalysisResult';
import type { AnalysisTarget } from './types';
import { useAnalysisFetch } from './useAnalysisFetch';
import { extractApiMessage } from './utils';

export type { AnalysisTarget } from './types';

interface KnowledgeAnalysisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AnalysisTarget;
}

export default function KnowledgeAnalysisDialog({
  open,
  onOpenChange,
  target,
}: KnowledgeAnalysisDialogProps) {
  const { t } = useTranslation();
  const { phase, setPhase, retry } = useAnalysisFetch(open, target);
  const assignFlashcardTopics = useAssignFlashcardTopics();
  const assignExamTopics = useAssignExamTopics();

  const handleAssignThenRetry = async () => {
    try {
      if (target.kind === 'flashcard') {
        await assignFlashcardTopics.mutateAsync({
          setId: target.setId,
          flashcardId: target.flashcardId,
        });
      } else if (target.kind === 'exam') {
        await assignExamTopics.mutateAsync({
          setId: target.setId,
          examId: target.examId,
        });
      }
      retry();
    } catch (error) {
      setPhase({
        state: 'error',
        message:
          extractApiMessage(error) ??
          t('analysis.errors.assignFailed', {
            defaultValue: 'Failed to assign topics.',
          }),
      });
    }
  };

  const titleKey =
    target.kind === 'set'
      ? 'analysis.title.set'
      : target.kind === 'flashcard'
        ? 'analysis.title.flashcard'
        : 'analysis.title.exam';

  const titleDefault =
    target.kind === 'set'
      ? 'Set knowledge analysis'
      : target.kind === 'flashcard'
        ? 'Flashcard knowledge analysis'
        : 'Exam knowledge analysis';

  const assignPending =
    assignFlashcardTopics.isPending || assignExamTopics.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[88vh] flex flex-col gap-0'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Brain className='w-5 h-5 text-[var(--pl-accent)]' />
            {t(titleKey, { defaultValue: titleDefault })}
          </DialogTitle>
        </DialogHeader>

        <div className='mt-3 min-h-0 flex-1 overflow-y-auto pr-1'>
          {phase.state === 'loading' && (
            <div className='flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground'>
              <Loader2 className='w-6 h-6 animate-spin' />
              <p className='text-sm'>
                {t('analysis.loading', {
                  defaultValue: 'Analyzing your knowledge…',
                })}
              </p>
            </div>
          )}

          {phase.state === 'no-topics' && (
            <div className='flex flex-col items-center justify-center py-10 gap-3 text-center'>
              <AlertCircle className='w-8 h-8 text-[var(--pl-warning)]' />
              <p className='text-sm text-muted-foreground max-w-md'>
                {t('analysis.noTopics', {
                  defaultValue:
                    'Topics are being assigned, please try again shortly.',
                })}
              </p>
              <Button
                size='sm'
                onClick={handleAssignThenRetry}
                disabled={assignPending}
              >
                {assignPending && <Loader2 className='w-4 h-4 animate-spin' />}
                {t('analysis.actions.assignAndRetry', {
                  defaultValue: 'Assign topics and retry',
                })}
              </Button>
            </div>
          )}

          {phase.state === 'set-empty' && (
            <div className='flex flex-col items-center justify-center py-10 gap-3 text-center'>
              <AlertCircle className='w-8 h-8 text-[var(--pl-warning)]' />
              <p className='text-sm text-muted-foreground max-w-md'>
                {t('analysis.setEmpty', {
                  defaultValue:
                    'Study a flashcard or take an exam first, then try again.',
                })}
              </p>
            </div>
          )}

          {phase.state === 'error' && (
            <div className='flex flex-col items-center justify-center py-10 gap-3 text-center'>
              <AlertCircle className='w-8 h-8 text-[var(--pl-danger)]' />
              <p className='text-sm text-[var(--pl-danger-text)] max-w-md'>{phase.message}</p>
              <Button size='sm' variant='outline' onClick={retry}>
                {t('analysis.actions.retry', { defaultValue: 'Retry' })}
              </Button>
            </div>
          )}

          {phase.state === 'ready' && (
            <AnalysisResult analysis={phase.analysis} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
