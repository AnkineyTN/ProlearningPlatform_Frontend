import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { authQueryKey } from '@/hooks/useAuth';
import { useCancelPayment, useGetPaymentStatus } from '@/hooks/usePayment';
import { useQueryClient } from '@tanstack/react-query';

type CancelState = 'loading' | 'cancelled' | 'error';

export default function PaymentCancelPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const qc = useQueryClient();

  const orderCodeParam = searchParams.get('orderCode');
  const orderCode = orderCodeParam ? Number(orderCodeParam) : null;

  const [state, setState] = useState<CancelState>(
    orderCode ? 'loading' : 'error',
  );
  const cancelPayment = useCancelPayment();
  const { refetch } = useGetPaymentStatus({
    orderCode,
    enabled: false,
    pollCount: 0,
  });

  useEffect(() => {
    if (!orderCode) return;

    let ignore = false;
    cancelPayment.mutate(orderCode, {
      onSuccess: () => {
        if (!ignore) setState('cancelled');
      },
      onError: async () => {
        // Cancel only fails if the order is no longer PENDING — the
        // webhook may have already marked it PAID before the user backed out.
        const { data: statusData } = await refetch();
        if (ignore) return;
        if (statusData?.status === 'PAID') {
          qc.invalidateQueries({ queryKey: authQueryKey });
          navigate(`/payment/result?orderCode=${orderCode}`, {
            replace: true,
          });
          return;
        }
        setState('cancelled');
      },
    });

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderCode]);

  if (state === 'loading') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)]'>
        <div className='text-center max-w-sm p-8'>
          <div className='w-16 h-16 rounded-full border-4 border-[var(--pl-accent)] border-t-transparent animate-spin mx-auto mb-6' />
          <h2
            className='text-[22px] font-medium mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('payment.verifying.title')}
          </h2>
          <p className='text-[13px] text-[var(--pl-text-muted)]'>
            {t('payment.verifying.description')}
          </p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)] p-4'>
        <div className='w-full max-w-sm text-center p-8 rounded-[20px] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-xl'>
          <div className='w-16 h-16 rounded-full grid place-items-center mx-auto mb-4 bg-[var(--pl-bg-subtle)] text-[var(--pl-text-muted)]'>
            <XCircle size={28} />
          </div>
          <h2
            className='text-[22px] font-medium mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('payment.error.title')}
          </h2>
          <p className='text-[13px] mb-6 text-[var(--pl-text-muted)]'>
            {t('payment.error.description')}
          </p>
          <Button
            variant='ghost'
            onClick={() => navigate('/dashboard')}
            className='w-full rounded-full'
          >
            {t('payment.goHome')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)] p-4'>
      <div className='w-full max-w-sm text-center p-8 rounded-[20px] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-xl'>
        <div className='w-16 h-16 rounded-full grid place-items-center mx-auto mb-4 bg-[var(--pl-danger-soft)] text-[var(--pl-danger)]'>
          <XCircle size={28} />
        </div>
        <h2
          className='text-[22px] font-medium mb-2 text-[var(--pl-text)]'
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('payment.cancel.title')}
        </h2>
        <p className='text-[13px] mb-6 text-[var(--pl-text-muted)]'>
          {t('payment.cancel.description')}
        </p>
        <div className='flex flex-col gap-2'>
          <Button
            onClick={() => navigate('/upgrade')}
            className='w-full rounded-full'
          >
            {t('payment.cancel.retry')}
          </Button>
          <Button
            variant='ghost'
            onClick={() => navigate('/dashboard')}
            className='w-full rounded-full'
          >
            {t('payment.goHome')}
          </Button>
        </div>
      </div>
    </div>
  );
}
