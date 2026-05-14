import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { appealsAPI, type AppealDto } from '@/services/endpoints/appeals';

type AppealListDialogProps = {
  userId: number;
  userName: string;
  open: boolean;
  onClose: () => void;
};

const AppealListDialog = ({
  userId,
  userName,
  open,
  onClose,
}: AppealListDialogProps) => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'appeals', userId],
    queryFn: async () => {
      const res = await appealsAPI.adminList({ page: 0, size: 50 });
      const raw = res.data.data;
      const all: AppealDto[] = Array.isArray(raw)
        ? (raw as AppealDto[])
        : ((raw as { content?: AppealDto[] }).content ?? []);
      return all.filter((a) => a.userId === userId);
    },
    enabled: open,
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      appealId,
      status,
    }: {
      appealId: number;
      status: 'ACCEPTED' | 'REJECTED';
    }) => appealsAPI.adminReview(appealId, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'appeals', userId] });
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setReviewingId(null);
      toast.success(t('adminDashboard.appealReviewed'));
    },
    onError: () => toast.error(t('adminDashboard.appealReviewError')),
  });

  const statusBadge = (status: AppealDto['status']) => {
    const map: Record<AppealDto['status'], string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      ACCEPTED: 'bg-green-500/10 text-green-600 border-green-500/30',
      REJECTED: 'bg-red-500/10 text-red-500 border-red-500/30',
    };
    return map[status];
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>
            {t('adminDashboard.appealsDialogTitle', { name: userName })}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className='text-sm text-muted-foreground py-6 text-center'>
            {t('onboarding.loading')}
          </p>
        ) : !data || data.length === 0 ? (
          <p className='text-sm text-muted-foreground py-6 text-center'>
            {t('adminDashboard.appealsEmpty')}
          </p>
        ) : (
          <div className='space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1'>
            {data.map((appeal) => (
              <div
                key={appeal.id}
                className='rounded-xl border border-border bg-muted/30 p-4 space-y-2'
              >
                <div className='flex items-center justify-between gap-2'>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusBadge(appeal.status)}`}
                  >
                    {appeal.status}
                  </span>
                  <span className='text-[11px] text-muted-foreground'>
                    {new Date(appeal.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className='text-sm'>{appeal.reason}</p>

                {appeal.adminNote && (
                  <p className='text-xs italic text-muted-foreground'>
                    {t('adminDashboard.adminNote')}: {appeal.adminNote}
                  </p>
                )}

                {appeal.status === 'PENDING' && (
                  <div className='flex gap-2 pt-1'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='gap-1.5 text-green-600 border-green-500/40 hover:bg-green-500/10'
                      disabled={reviewMutation.isPending && reviewingId === appeal.id}
                      onClick={() => {
                        setReviewingId(appeal.id);
                        reviewMutation.mutate({ appealId: appeal.id, status: 'ACCEPTED' });
                      }}
                    >
                      <CheckCircle className='w-3.5 h-3.5' />
                      {t('adminDashboard.appealAccept')}
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='gap-1.5 text-destructive border-destructive/40 hover:bg-destructive/10'
                      disabled={reviewMutation.isPending && reviewingId === appeal.id}
                      onClick={() => {
                        setReviewingId(appeal.id);
                        reviewMutation.mutate({ appealId: appeal.id, status: 'REJECTED' });
                      }}
                    >
                      <XCircle className='w-3.5 h-3.5' />
                      {t('adminDashboard.appealReject')}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppealListDialog;
