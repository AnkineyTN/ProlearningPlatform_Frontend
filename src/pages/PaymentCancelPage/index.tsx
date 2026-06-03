import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
