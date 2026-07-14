import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';

export default function CalendarCallbackPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const connected = params.get('connected');
    const reason = params.get('reason');

    if (connected === 'true') {
      toast.success(t('googleCalendar.toast.connectSuccess'));
    } else if (reason) {
      const key =
        reason === 'access_denied'
          ? 'googleCalendar.toast.accessDenied'
          : reason === 'invalid_state'
            ? 'googleCalendar.toast.invalidState'
            : 'googleCalendar.toast.connectFailed';
      toast.error(t(key));
    }

    qc.invalidateQueries({ queryKey: ['calendar', 'status'] });

    if (window.opener) {
      window.opener.postMessage(
        { type: 'calendar-auth', connected: connected === 'true' },
        window.location.origin,
      );
      window.close();
    } else {
      navigate('/profile', { replace: true });
    }
  }, [params, navigate, qc, t]);

  return (
    <div className='flex items-center justify-center min-h-screen'>
      <p className='text-[var(--pl-text-muted)] text-sm'>
        {t('googleCalendar.redirecting')}
      </p>
    </div>
  );
}
