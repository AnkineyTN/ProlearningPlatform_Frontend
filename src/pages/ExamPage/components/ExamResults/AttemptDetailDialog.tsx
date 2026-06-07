import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { examAPI } from '@/services/endpoints/exam';
import type { ExamAttemptDetail } from '@/services/types/exam.types';
import { formatAttemptDateTime } from './utils';

interface AttemptDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setId: number;
  examId: number;
  attemptId: number | null;
}

export default function AttemptDetailDialog({
  open,
  onOpenChange,
  setId,
  examId,
  attemptId,
}: AttemptDetailDialogProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExamAttemptDetail | null>(null);

  useEffect(() => {
    if (!open || attemptId == null) return;
    let cancelled = false;
    setLoading(true);
    setData(null);
    examAPI
      .getExamAttempt(setId, examId, attemptId)
      .then((res) => {
        if (!cancelled) setData(res.data?.data ?? null);
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, attemptId, setId, examId]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setData(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='max-w-2xl max-h-[80vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle>{t('exam.results.attemptDetailTitle')}</DialogTitle>
        </DialogHeader>
        <div className='mt-2 min-h-0 flex-1 overflow-y-auto space-y-4 text-sm'>
          {loading && (
            <p className='text-muted-foreground py-6 text-center'>
              {t('exam.results.attemptDetailLoading')}
            </p>
          )}
          {!loading && !data && (
            <p className='text-destructive py-6 text-center'>
              {t('exam.results.attemptDetailError')}
            </p>
          )}
          {!loading && data && (
            <>
              <div className='grid grid-cols-2 gap-2 text-xs sm:text-sm'>
                <div>
                  <span className='text-muted-foreground'>
                    {t('exam.results.tableStatus')}:{' '}
                  </span>
                  <Badge variant='outline'>{data.status}</Badge>
                </div>
                <div>
                  <span className='text-muted-foreground'>
                    {t('exam.results.tableScore')}:{' '}
                  </span>
                  <span className='font-semibold'>
                    {data.score != null && data.totalPoints != null
                      ? `${data.score}/${data.totalPoints}`
                      : '—'}
                  </span>
                </div>
                <div className='col-span-2'>
                  <span className='text-muted-foreground'>
                    {t('exam.results.tableStarted')}:{' '}
                  </span>
                  {formatAttemptDateTime(data.startedAt, i18n.language)}
                </div>
                <div className='col-span-2'>
                  <span className='text-muted-foreground'>
                    {t('exam.results.tableSubmitted')}:{' '}
                  </span>
                  {formatAttemptDateTime(data.submittedAt, i18n.language)}
                </div>
              </div>
              {data.answers && data.answers.length > 0 && (
                <div className='space-y-3 border-t border-border pt-3'>
                  <p className='font-medium text-xs uppercase tracking-wide text-muted-foreground'>
                    {t('exam.results.attemptDetailAnswers')}
                  </p>
                  <ul className='space-y-3'>
                    {data.answers.map((ans, idx) => (
                      <li
                        key={`${ans.questionId}-${idx}`}
                        className='rounded-lg border border-border p-3 space-y-1'
                      >
                        <div className='flex items-start justify-between gap-2'>
                          <p className='font-medium text-sm flex-1'>
                            Q{idx + 1}:{' '}
                            {ans.questionContent ?? `ID ${ans.questionId}`}
                          </p>
                          {ans.isCorrect ? (
                            <CheckCircle className='w-4 h-4 text-[var(--pl-accent)] shrink-0' />
                          ) : (
                            <XCircle className='w-4 h-4 text-[var(--pl-danger)] shrink-0' />
                          )}
                        </div>
                        <p className='text-xs text-muted-foreground'>
                          {t('exam.results.tableScore')}: {ans.earnedPoints}
                          {ans.feedback ? (
                            <span className='block mt-1 text-foreground'>
                              {ans.feedback}
                            </span>
                          ) : null}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
