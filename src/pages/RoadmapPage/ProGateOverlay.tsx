import { Crown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const ProGateOverlay = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className='absolute inset-0 z-40 flex items-center justify-center p-4 bg-[var(--pl-bg)]/60'>
      <div className='rounded-[18px] p-8 max-w-[420px] w-full text-center bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] shadow-2xl'>
        <div className='w-16 h-16 rounded-[16px] grid place-items-center mx-auto mb-4 bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'>
          <Crown size={28} />
        </div>
        <span className='inline-flex items-center px-2.5 py-1 rounded-full text-[10.5px] uppercase tracking-[0.14em] font-semibold mb-4 bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'>
          PRO
        </span>
        <h2 className='text-[20px] font-medium mb-2 text-[var(--pl-text)]'>
          {t('roadmap.proGate.title')}
        </h2>
        <p className='text-[13px] mb-6 max-w-[340px] mx-auto text-[var(--pl-text-muted)]'>
          {t('roadmap.proGate.description')}
        </p>
        <Button
          onClick={() => navigate('/profile')}
          className='gap-2 px-6 py-3 rounded-full text-[13px] font-medium bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:bg-[var(--pl-accent-strong)] h-auto'
        >
          <Crown size={13} />
          {t('roadmap.proGate.cta')}
        </Button>
      </div>
    </div>
  );
};

export default ProGateOverlay;
