import { Lock, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { getApiError } from '@/lib/apiError';
import { cn } from '@/lib/utils';

type ResourceKind = 'note' | 'flashcard' | 'exam' | 'set';

interface ResourceAccessErrorProps {
  resource: ResourceKind;
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export function ResourceAccessError({
  resource,
  error,
  onRetry,
  className,
}: ResourceAccessErrorProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { status } = getApiError(error);
  const accessDenied = status === 403 || status === 404;
  const label = t(`resourceAccess.type.${resource}`);
  const ns = accessDenied ? 'accessDenied' : 'loadError';

  return (
    <div
      className={cn(
        'min-h-screen flex items-center justify-center bg-[var(--pl-bg)]',
        className,
      )}
    >
      <div className='flex flex-col items-center justify-center py-24 px-6 text-center'>
        <div
          className={`w-20 h-20 rounded-[20px] grid place-items-center mb-5 ${
            accessDenied
              ? 'bg-[var(--pl-danger-soft)]'
              : 'bg-[var(--pl-warning-soft)]'
          }`}
        >
          {accessDenied ? (
            <Lock size={36} className='text-[var(--pl-danger-text)]' />
          ) : (
            <RefreshCw size={36} className='text-[var(--pl-warning-text)]' />
          )}
        </div>
        <h3 className='text-[20px] font-medium mb-2'>
          {t(`resourceAccess.${ns}.title`, { resource: label })}
        </h3>
        <p className='text-[13px] text-[var(--pl-text-muted)] mb-6 max-w-[440px]'>
          {t(`resourceAccess.${ns}.description`, { resource: label })}
        </p>
        <div className='flex items-center gap-3'>
          <Button variant='outline' onClick={() => navigate('/dashboard')}>
            {t('resourceAccess.backButton')}
          </Button>
          {!accessDenied && onRetry ? (
            <Button onClick={onRetry}>{t('resourceAccess.retry')}</Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
