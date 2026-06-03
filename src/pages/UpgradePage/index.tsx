import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, ArrowLeft, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useCreatePayment } from '@/hooks/usePayment';
import { useAuth } from '@/hooks/useAuth';

const proFeatures = [
  'upgrade.features.aiUnlimited',
  'upgrade.features.mockTest',
  'upgrade.features.analysis',
  'upgrade.features.roadmap',
  'upgrade.features.noAds',
];

export default function UpgradePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const createPayment = useCreatePayment();
  const [error, setError] = useState<string | null>(null);

  if (user?.accountType === 'PRO') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)]'>
        <div className='text-center max-w-sm p-8'>
          <div className='w-16 h-16 rounded-[16px] grid place-items-center mx-auto mb-4 bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'>
            <Crown size={28} />
          </div>
          <h2
            className='text-[24px] font-medium mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('upgrade.alreadyPro.title')}
          </h2>
          <p className='text-[13px] mb-6 text-[var(--pl-text-muted)]'>
            {t('upgrade.alreadyPro.description')}
          </p>
          <Button onClick={() => navigate('/dashboard')} className='rounded-full'>
            {t('upgrade.alreadyPro.cta')}
          </Button>
        </div>
      </div>
    );
  }

  const handleUpgrade = async () => {
    setError(null);
    try {
      const { orderCode, checkoutUrl } = await createPayment.mutateAsync();
      sessionStorage.setItem('pendingOrderCode', String(orderCode));
      window.location.href = checkoutUrl;
    } catch {
      setError(t('upgrade.error.createFailed'));
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)] p-4'>
      <div className='w-full max-w-md'>
        <button
          onClick={() => navigate(-1)}
          className='flex items-center gap-1.5 text-[13px] mb-6 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] transition-colors'
        >
          <ArrowLeft size={15} />
          {t('upgrade.back')}
        </button>

        <div className='rounded-[20px] overflow-hidden bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-xl'>
          <div className='p-8 bg-[linear-gradient(135deg,_var(--pl-accent-soft),_color-mix(in_oklch,_var(--pl-accent)_8%,_transparent))] border-b border-[var(--pl-accent-border)]'>
            <div className='flex items-center gap-2 mb-4'>
              <div className='w-10 h-10 rounded-[10px] grid place-items-center bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'>
                <Crown size={18} />
              </div>
              <span className='text-[11px] tracking-[0.18em] uppercase font-semibold text-[var(--pl-accent-strong)]'>
                PRO {t('upgrade.badge')}
              </span>
            </div>
            <h1
              className='text-[32px] font-medium tracking-tight mb-1 text-[var(--pl-text)]'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {t('upgrade.title')}
            </h1>
            <p className='text-[13px] text-[var(--pl-text-muted)]'>
              {t('upgrade.subtitle')}
            </p>

            <div className='mt-5 flex items-baseline gap-1.5'>
              <span
                className='text-[42px] font-medium leading-none text-[var(--pl-text)]'
                style={{ fontFamily: 'var(--font-display)' }}
              >
                499.000₫
              </span>
              <div className='flex flex-col'>
                <span className='text-[12px] line-through text-[var(--pl-text-faint)]'>
                  999.000₫
                </span>
                <span className='text-[11px] text-[var(--pl-accent-strong)] font-medium'>
                  {t('upgrade.oneTime')}
                </span>
              </div>
            </div>
          </div>

          <div className='p-8'>
            <ul className='m-0 p-0 list-none flex flex-col gap-3 mb-8'>
              {proFeatures.map((key) => (
                <li key={key} className='flex items-start gap-3 text-[14px] text-[var(--pl-text)]'>
                  <Check
                    className='w-4 h-4 shrink-0 mt-0.5'
                    style={{ color: 'oklch(0.72 0.15 155)' }}
                    strokeWidth={2.4}
                  />
                  {t(key)}
                </li>
              ))}
            </ul>

            {error && (
              <p className='text-[12px] text-red-500 mb-4 text-center'>{error}</p>
            )}

            <Button
              onClick={handleUpgrade}
              disabled={createPayment.isPending}
              className='w-full h-12 rounded-full text-[14px] font-medium gap-2'
            >
              <Zap size={15} />
              {createPayment.isPending
                ? t('upgrade.loading')
                : t('upgrade.cta')}
            </Button>

            <p className='mt-4 text-center text-[11.5px] text-[var(--pl-text-faint)]'>
              {t('upgrade.secureNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
