import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Crown,
  XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { authQueryKey } from '@/hooks/useAuth';
import { useGetPaymentStatus } from '@/hooks/usePayment';
import { useQueryClient } from '@tanstack/react-query';

type ResultState = 'loading' | 'paid' | 'pending' | 'failed' | 'error';

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const orderCodeParam = searchParams.get('orderCode');
  const orderCode = orderCodeParam ? Number(orderCodeParam) : null;

  const qc = useQueryClient();
  const [resultState, setResultState] = useState<ResultState>(
    orderCode ? 'loading' : 'error',
  );
  const pollCountRef = useRef(0);
  const [pollCount, setPollCount] = useState(0);

  const { data, isError } = useGetPaymentStatus({
    orderCode,
    enabled: resultState === 'loading',
    pollCount,
  });

  useEffect(() => {
    if (!data) return;

    if (data.status === 'PAID') {
      qc.invalidateQueries({ queryKey: authQueryKey });
      setResultState('paid');
      return;
    }
    if (data.status === 'CANCELLED' || data.status === 'EXPIRED') {
      setResultState('failed');
      return;
    }
    if (data.status === 'PENDING') {
      pollCountRef.current += 1;
      setPollCount(pollCountRef.current);
      if (pollCountRef.current >= 10) {
        setResultState('pending');
      }
    }
  }, [data, qc]);

  useEffect(() => {
    if (isError) setResultState('error');
  }, [isError]);

  const handleRetryPoll = () => {
    pollCountRef.current = 0;
    setPollCount(0);
    setResultState('loading');
  };

  if (resultState === 'loading') {
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

  if (resultState === 'paid') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)] p-4'>
        <div className='w-full max-w-md rounded-[20px] overflow-hidden bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-xl text-center'>
          <div className='p-8 bg-[linear-gradient(135deg,_var(--pl-accent-soft),_color-mix(in_oklch,_var(--pl-accent)_8%,_transparent))]'>
            <div className='w-20 h-20 rounded-full grid place-items-center mx-auto mb-4 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'>
              <CheckCircle size={36} />
            </div>
            <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] uppercase tracking-[0.14em] font-semibold mb-3 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'>
              <Crown size={11} />
              PRO {t('upgrade.badge')}
            </span>
            <h2
              className='text-[26px] font-medium mb-2 text-[var(--pl-text)]'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('payment.paid.title')}
            </h2>
            <p className='text-[13px] text-[var(--pl-text-muted)]'>
              {t('payment.paid.description')}
            </p>
          </div>
          <div className='p-8'>
            <Button
              onClick={() => navigate('/dashboard')}
              className='w-full h-12 rounded-full text-[14px] font-medium gap-2'
            >
              <Crown size={15} />
              {t('payment.paid.cta')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (resultState === 'pending') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)] p-4'>
        <div className='w-full max-w-sm text-center p-8 rounded-[20px] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-xl'>
          <div className='w-16 h-16 rounded-full grid place-items-center mx-auto mb-4 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'>
            <Clock size={28} />
          </div>
          <h2
            className='text-[22px] font-medium mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('payment.pending.title')}
          </h2>
          <p className='text-[13px] mb-6 text-[var(--pl-text-muted)]'>
            {t('payment.pending.description')}
          </p>
          <div className='flex flex-col gap-2'>
            <Button onClick={handleRetryPoll} className='w-full rounded-full'>
              {t('payment.pending.retry')}
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

  if (resultState === 'failed') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)] p-4'>
        <div className='w-full max-w-sm text-center p-8 rounded-[20px] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-xl'>
          <div className='w-16 h-16 rounded-full grid place-items-center mx-auto mb-4 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'>
            <XCircle size={28} />
          </div>
          <h2
            className='text-[22px] font-medium mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('payment.failed.title')}
          </h2>
          <p className='text-[13px] mb-6 text-[var(--pl-text-muted)]'>
            {t('payment.failed.description')}
          </p>
          <div className='flex flex-col gap-2'>
            <Button
              onClick={() => navigate('/upgrade')}
              className='w-full rounded-full'
            >
              {t('payment.failed.retry')}
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

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)] p-4'>
      <div className='w-full max-w-sm text-center p-8 rounded-[20px] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-xl'>
        <div className='w-16 h-16 rounded-full grid place-items-center mx-auto mb-4 bg-[var(--pl-bg-subtle)] text-[var(--pl-text-muted)]'>
          <AlertTriangle size={28} />
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
