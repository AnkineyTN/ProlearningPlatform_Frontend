import { useTranslation } from 'react-i18next';
import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import NotFoundPage from '@/pages/NotFoundPage';

export default function RouteErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFoundPage />;
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)] px-6'>
      <div className='flex flex-col items-center justify-center text-center max-w-md'>
        <div className='w-20 h-20 rounded-[20px] grid place-items-center mb-5 bg-[var(--pl-danger-soft)]'>
          <AlertTriangle size={36} className='text-[var(--pl-danger-text)]' />
        </div>
        <h1 className='font-[family-name:var(--font-display)] text-[28px] font-normal mb-2'>
          {t('errorPage.title')}
        </h1>
        <p className='text-[13px] text-[var(--pl-text-muted)] mb-6'>
          {t('errorPage.description')}
        </p>
        <div className='flex items-center gap-3'>
          <Button variant='outline' onClick={() => window.location.reload()}>
            {t('errorPage.reload')}
          </Button>
          <Button onClick={() => navigate('/')}>{t('errorPage.backToHome')}</Button>
        </div>
      </div>
    </div>
  );
}
