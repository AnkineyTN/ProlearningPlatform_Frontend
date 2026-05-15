import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, MessageSquareWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appealsAPI, type AppealDto, type AppealStatus } from '@/services/endpoints/appeals';

const STATUS_OPTIONS: (AppealStatus | 'ALL')[] = ['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'];

const AppealsSection = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<AppealStatus | 'ALL'>('PENDING');
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'appeals', 'all', statusFilter],
    queryFn: async () => {
      const res = await appealsAPI.adminList({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        page: 0,
        size: 100,
      });
      const raw = res.data.data;
      return Array.isArray(raw)
        ? (raw as AppealDto[])
        : ((raw as { content?: AppealDto[] }).content ?? []);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ appealId, status }: { appealId: number; status: AppealStatus }) =>
      appealsAPI.adminReview(appealId, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'appeals'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setReviewingId(null);
      toast.success(t('adminDashboard.appealReviewed'));
    },
    onError: () => toast.error(t('adminDashboard.appealReviewError')),
  });

  const statusBadgeClass = (status: AppealDto['status']) => {
    const map: Record<AppealDto['status'], string> = {
      PENDING: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',
      ACCEPTED: 'bg-green-500/10 text-green-600 border-green-500/30',
      REJECTED: 'bg-red-500/10 text-red-500 border-red-500/30',
    };
    return map[status];
  };

  return (
    <section className='space-y-3'>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center'>
          <MessageSquareWarning className='w-4 h-4 text-amber-500' />
        </div>
        <div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
            MANAGEMENT
          </p>
          <h2 className='font-semibold leading-tight'>{t('adminDashboard.appealsTitle')}</h2>
        </div>
      </div>

      <div className='flex gap-2 flex-wrap'>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-colors ${
              statusFilter === s
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40'
            }`}
          >
            {t(`adminDashboard.appealStatus_${s}`)}
          </button>
        ))}
      </div>

      <div className='rounded-2xl border border-border bg-[var(--pl-bg)] overflow-hidden'>
        {isLoading ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>
            {t('onboarding.loading')}
          </div>
        ) : isError ? (
          <div className='p-16 text-center text-destructive text-sm'>
            {t('adminDashboard.appealsLoadError')}
          </div>
        ) : !data || data.length === 0 ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>
            {t('adminDashboard.appealsEmpty')}
          </div>
        ) : (
          <div className='divide-y divide-border'>
            {data.map((appeal) => (
              <div
                key={appeal.id}
                className='p-4 flex flex-col sm:flex-row sm:items-start gap-3 hover:bg-muted/20 transition-colors'
              >
                <div className='flex-1 space-y-1 min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-sm font-medium'>{appeal.email}</span>
                    {appeal.userId != null && (
                      <span className='text-[11px] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                        #{appeal.userId}
                      </span>
                    )}
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${statusBadgeClass(appeal.status)}`}
                    >
                      {appeal.status}
                    </span>
                    <span className='text-[11px] text-muted-foreground sm:ml-auto'>
                      {new Date(appeal.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className='text-sm text-muted-foreground'>{appeal.reason}</p>
                  {appeal.adminNote && (
                    <p className='text-xs italic text-muted-foreground'>
                      {t('adminDashboard.adminNote')}: {appeal.adminNote}
                    </p>
                  )}
                </div>

                {appeal.status === 'PENDING' && (
                  <div className='flex gap-2 shrink-0'>
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
      </div>
    </section>
  );
};

export default AppealsSection;
