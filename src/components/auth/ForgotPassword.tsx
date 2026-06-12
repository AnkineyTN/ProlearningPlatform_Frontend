import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Mail, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import LogoFG from '@/assets/logo_fg';
import { authAPI } from '@/services/endpoints/auth';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useCountdown } from '@/hooks/useCountdown';

type LocationState = {
  email?: string;
  autoSubmit?: boolean;
};

type FormData = {
  email: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const { t } = useTranslation();

  const schema = useMemo(
    () =>
      z.object({
        email: z.string().email(t('forgotPassword.invalidEmail')),
      }),
    [t],
  );

  const [submitting, setSubmitting] = useState(false);
  const resendLock = useCountdown({ seconds: 60, autoStart: false });

  const defaultEmail = useMemo(() => state.email ?? '', [state.email]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: defaultEmail },
  });

  useEffect(() => {
    if (state.email) setValue('email', state.email);
  }, [setValue, state.email]);

  const email = watch('email');

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await authAPI.forgotPassword({ email: data.email });
      toast.success(t('forgotPassword.otpSent'));
      resendLock.reset(60);
      navigate('/reset-otp', { state: { email: data.email } });
    } catch (err: unknown) {
      const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;

      const code = payload?.metadata?.code;
      const msg = payload?.message ?? t('forgotPassword.otpSendFailed');

      if (code === 'EMAIL_NOT_VERIFIED') {
        toast.info(msg);
        navigate('/verify-email', {
          state: { email: data.email, after: 'forgot' },
        });
        return;
      }

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (state.autoSubmit && state.email) {
      handleSubmit(onSubmit)();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClass = (hasError: boolean) =>
    cn(
      'w-full pl-10 pr-3.5 py-2.5 text-[13.5px] outline-none transition-colors',
      'bg-[var(--pl-bg)] border rounded-[10px]',
      'placeholder:text-[var(--pl-text-faint)]',
      'focus:border-[var(--pl-accent-border)] focus:bg-[var(--pl-bg-hover)]',
      hasError
        ? 'border-[var(--pl-danger,oklch(0.65_0.2_25))]'
        : 'border-[var(--pl-border-strong)]',
    );

  return (
    <div className='min-h-screen w-screen flex items-center justify-center relative overflow-hidden'>
      {/* Gradient orbs */}
      <div className='absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,var(--pl-accent-border)_0%,var(--pl-accent-soft)_50%,transparent_70%)] blur-[60px] pointer-events-none' />
      <div className='absolute -bottom-40 -right-20 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,var(--pl-accent-soft)_0%,var(--pl-accent-soft)_50%,transparent_70%)] blur-[70px] pointer-events-none' />
      <div className='absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,var(--pl-accent-soft)_0%,transparent_70%)] blur-[50px] pointer-events-none' />

      {/* Logo */}
      <a
        href='/dashboard'
        className='absolute top-8 left-8 flex items-center gap-2'
      >
        <div className='w-8 h-8 grid place-items-center'>
          <LogoFG />
        </div>
        <span
          className='text-[16px] font-semibold tracking-[-0.015em] text-[var(--pl-text)]'
          style={{ fontFamily: 'var(--font-display)' }}
        >
          ProLearning
        </span>
      </a>

      {/* Card */}
      <div className='relative w-[420px] max-w-full bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] px-9 py-10'>
        {/* Header */}
        <div className='mb-8'>
          <div className='text-[10px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]'>
            {t('forgotPassword.subtitle')}
          </div>
          <h1
            className='text-[32px] tracking-[-0.02em] leading-[1.1] m-0 mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('forgotPassword.title')}
          </h1>
          <p
            className='text-[15px] italic m-0 text-[var(--pl-text-muted)]'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('forgotPassword.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          {/* Email */}
          <div>
            <Label className='block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-2'>
              {t('forgotPassword.email')}{' '}
              <span className='text-[var(--pl-accent-strong)]'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'>
                <Mail size={14} />
              </span>
              <Input
                type='email'
                {...register('email')}
                placeholder={t('forgotPassword.emailPlaceholder')}
                disabled={submitting}
                className={inputClass(!!errors.email)}
              />
            </div>
            {errors.email && (
              <p className='text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[11.5px] mt-1.5'>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type='submit'
            disabled={submitting}
            className='w-full mt-1 py-3 rounded-full text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer'
          >
            {submitting && <RefreshCw size={13} className='animate-spin' />}
            {t('forgotPassword.submit')}
          </button>

          {resendLock.isRunning && (
            <div className='text-[11.5px] text-[var(--pl-text-faint)] text-center'>
              {resendLock.isDone ? (
                <span>{t('forgotPassword.canResend')}</span>
              ) : (
                <span>
                  {t('forgotPassword.resendIn', { time: resendLock.format() })}
                </span>
              )}
            </div>
          )}
        </form>

        {email ? (
          <div className='mt-5 text-center text-[11.5px] text-[var(--pl-text-faint)]'>
            {t('forgotPassword.currentEmail')}{' '}
            <span className='font-semibold text-[var(--pl-text)]'>{email}</span>
          </div>
        ) : null}

        <p className='mt-6 text-center text-[12.5px] text-[var(--pl-text-muted)]'>
          <Link
            to='/login'
            className='font-semibold text-[var(--pl-accent-strong)] hover:opacity-80 transition-opacity'
          >
            {t('forgotPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
