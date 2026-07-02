import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, History, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useExamAnalyses,
  useFlashcardAnalyses,
  useSetAnalyses,
} from '@/hooks/useKnowledgeAnalysis';
import AnalysisResult from '../KnowledgeAnalysisDialog/AnalysisResult';
import HistoryListItem from './HistoryListItem';
import type { HistoryTarget } from './types';

export type { HistoryTarget } from './types';

interface AnalysisHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: HistoryTarget;
}

export default function AnalysisHistoryDialog({
  open,
  onOpenChange,
  target,
}: AnalysisHistoryDialogProps) {
  const { t } = useTranslation();

  const isSet = target.kind === 'set';
  const isFlashcard = target.kind === 'flashcard';
  const isExam = target.kind === 'exam';

  const setQuery = useSetAnalyses(target.setId, open && isSet);
  const flashcardQuery = useFlashcardAnalyses(
    target.setId,
    isFlashcard ? target.flashcardId : 0,
    open && isFlashcard,
  );
  const examQuery = useExamAnalyses(
    target.setId,
    isExam ? target.examId : 0,
    open && isExam,
  );

  const query = isSet ? setQuery : isFlashcard ? flashcardQuery : examQuery;

  const analyses = useMemo(() => {
    const list = query.data ?? [];
    return [...list].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [query.data]);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      setSelectedId(null);
      return;
    }
    if (analyses.length > 0) {
      setSelectedId((prev) =>
        prev != null && analyses.some((a) => a.id === prev)
          ? prev
          : analyses[0].id,
      );
    }
  }, [open, analyses]);

  const selected =
    analyses.find((a) => a.id === selectedId) ?? analyses[0] ?? null;

  const titleKey =
    target.kind === 'set'
      ? 'analysis.history.title.set'
      : target.kind === 'flashcard'
        ? 'analysis.history.title.flashcard'
        : 'analysis.history.title.exam';

  const titleDefault =
    target.kind === 'set'
      ? 'Set analysis history'
      : target.kind === 'flashcard'
        ? 'Flashcard analysis history'
        : 'Exam analysis history';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='min-w-5xl max-h-[88vh] flex flex-col gap-0'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <History className='w-5 h-5 text-[var(--pl-accent)]' />
            {t(titleKey, { defaultValue: titleDefault })}
          </DialogTitle>
        </DialogHeader>

        {query.isLoading ? (
          <div className='flex flex-col items-center justify-center py-16 gap-3 text-[var(--pl-text-muted)]'>
            <Loader2 className='w-6 h-6 animate-spin' />
            <p className='text-sm'>
              {t('analysis.history.loading', {
                defaultValue: 'Loading history…',
              })}
            </p>
          </div>
        ) : query.isError ? (
          <div className='flex flex-col items-center justify-center py-16 gap-3 text-center'>
            <AlertCircle className='w-8 h-8 text-[var(--pl-danger)]' />
            <p className='text-sm text-[var(--pl-danger-text)] max-w-md'>
              {t('analysis.history.error', {
                defaultValue: 'Could not load analysis history.',
              })}
            </p>
          </div>
        ) : analyses.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 gap-3 text-center'>
            <div className='w-16 h-16 rounded-[18px] grid place-items-center bg-[var(--pl-accent-soft)]'>
              <History className='w-7 h-7 text-[var(--pl-accent)]' />
            </div>
            <p className='text-sm text-[var(--pl-text-muted)] max-w-md'>
              {t('analysis.history.empty', {
                defaultValue:
                  'No analyses yet. Run an analysis to start building your history.',
              })}
            </p>
          </div>
        ) : (
          <div className='mt-3 min-h-0 flex-1 flex flex-col md:flex-row md:gap-4 overflow-hidden'>
            <div className='md:w-56 shrink-0 md:border-r md:border-b-0 border-b border-[var(--pl-border)] md:pr-3 pb-3 md:pb-0 max-h-40 md:max-h-none overflow-y-auto'>
              <p className='font-[family-name:var(--font-mono-pl)] text-[10px] tracking-[0.2em] text-[var(--pl-text-faint)] uppercase mb-2 px-1'>
                {t('analysis.history.listTitle', {
                  defaultValue: 'History',
                })}
              </p>
              <div className='space-y-1.5'>
                {analyses.map((analysis, index) => (
                  <HistoryListItem
                    key={analysis.id}
                    analysis={analysis}
                    isLatest={index === 0}
                    isActive={selected?.id === analysis.id}
                    onSelect={() => setSelectedId(analysis.id)}
                  />
                ))}
              </div>
            </div>

            <div className='min-h-0 flex-1 overflow-y-auto md:pl-1 pt-3 md:pt-0'>
              {selected && <AnalysisResult analysis={selected} />}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
