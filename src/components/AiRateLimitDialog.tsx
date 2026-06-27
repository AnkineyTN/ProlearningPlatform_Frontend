import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Zap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { aiRateLimitBus } from '@/services/client';

export default function AiRateLimitDialog() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string }>).detail;
      setMessage(detail.message);
      setOpen(true);
    };
    aiRateLimitBus.addEventListener('exceeded', handler);
    return () => aiRateLimitBus.removeEventListener('exceeded', handler);
  }, []);

  const isFree = !user || user.accountType === 'FREE';

  const goToApiKey = () => {
    setOpen(false);
    navigate('/profile?tab=ai');
  };

  const goToUpgrade = () => {
    setOpen(false);
    navigate('/upgrade');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-[var(--pl-warning-soft)] mb-1'>
            <Zap className='w-5 h-5 text-[var(--pl-warning-text)]' />
          </div>
          <DialogTitle className='text-[18px]'>
            {t('aiRateLimit.title')}
          </DialogTitle>
          <DialogDescription className='text-[13px] leading-relaxed'>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant='ghost' size='sm' onClick={() => setOpen(false)}>
            {t('aiRateLimit.dismiss')}
          </Button>
          <Button variant='outline' size='sm' onClick={goToApiKey}>
            {t('aiRateLimit.addApiKey')}
          </Button>
          {isFree && (
            <Button
              size='sm'
              onClick={goToUpgrade}
              className='bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:bg-[var(--pl-accent-strong)]'
            >
              {t('aiRateLimit.upgradeToPro')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
