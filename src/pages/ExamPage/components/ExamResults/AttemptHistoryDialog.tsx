import { useEffect, useState } from 'react';
import { History } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { examAPI } from '@/services/endpoints/exam';
import type { ExamAttemptSummary } from '@/services/types/exam.types';
import { formatAttemptDateTime, sortAttemptsByRecency } from './utils';

interface AttemptHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setId: number;
  examId: number;
  onSelectAttempt: (attemptId: number) => void;
}

export default function AttemptHistoryDialog({
  open,
  onOpenChange,
  setId,
  examId,
  onSelectAttempt,
}: AttemptHistoryDialogProps) {
  const { t, i18n } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [attempts, setAttempts] = useState<ExamAttemptSummary[]>([]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    examAPI
      .listExamAttempts(setId, examId)
      .then((res) => {
        if (cancelled) return;
        setAttempts(sortAttemptsByRecency(res.data?.data ?? []));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, setId, examId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[85vh] flex flex-col gap-0'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <History className='w-5 h-5' />
            {t('exam.results.attemptHistoryTitle')}
          </DialogTitle>
        </DialogHeader>
        <div className='mt-2 min-h-0 flex-1 overflow-y-auto pr-1'>
          {loading && (
            <p className='text-sm text-muted-foreground py-8 text-center'>
              {t('exam.results.attemptHistoryLoading')}
            </p>
          )}
          {error && !loading && (
            <p className='text-sm text-destructive py-8 text-center'>
              {t('exam.results.attemptHistoryLoadError')}
            </p>
          )}
          {!loading && !error && attempts.length === 0 && (
            <p className='text-sm text-muted-foreground py-8 text-center'>
              {t('exam.results.attemptHistoryEmpty')}
            </p>
          )}
          {!loading && !error && attempts.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('exam.results.tableStatus')}</TableHead>
                  <TableHead>{t('exam.results.tableStarted')}</TableHead>
                  <TableHead>{t('exam.results.tableSubmitted')}</TableHead>
                  <TableHead>{t('exam.results.tableScore')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attempts.map((row) => {
                  const submitted =
                    row.status === 'SUBMITTED' || row.submittedAt != null;
                  const scoreLabel =
                    submitted && row.score != null && row.totalPoints != null
                      ? `${row.score}/${row.totalPoints}`
                      : '—';
                  return (
                    <TableRow
                      key={row.id}
                      onClick={() => onSelectAttempt(row.id)}
                      className='cursor-pointer'
                    >
                      <TableCell>
                        <Badge
                          variant={submitted ? 'default' : 'secondary'}
                          className='text-xs'
                        >
                          {row.status}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-muted-foreground whitespace-normal'>
                        {formatAttemptDateTime(row.startedAt, i18n.language)}
                      </TableCell>
                      <TableCell className='text-muted-foreground whitespace-normal'>
                        {formatAttemptDateTime(row.submittedAt, i18n.language)}
                      </TableCell>
                      <TableCell>{scoreLabel}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
