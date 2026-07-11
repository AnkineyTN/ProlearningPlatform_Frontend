import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)] px-6'>
      <div className='flex flex-col items-center justify-center text-center max-w-md'>
        <div className='w-20 h-20 rounded-[20px] grid place-items-center mb-5 bg-[var(--pl-accent-soft)]'>
          <Compass size={36} className='text-[var(--pl-accent)]' />
        </div>
        <p className='font-[family-name:var(--font-mono-pl)] text-[11px] tracking-[0.2em] text-[var(--pl-text-faint)] mb-2'>
          404
        </p>
        <h1 className='font-[family-name:var(--font-display)] text-[28px] font-normal mb-2'>
          {t('notFoundPage.title')}
        </h1>
        <p className='text-[13px] text-[var(--pl-text-muted)] mb-6'>
          {t('notFoundPage.description')}
        </p>
        <Button
          onClick={() => navigate(token ? '/dashboard' : '/')}
          className='gap-2'
        >
          <Home className='w-4 h-4' />
          {token ? t('notFoundPage.backToDashboard') : t('notFoundPage.backToHome')}
        </Button>
      </div>
    </div>
  );
}
