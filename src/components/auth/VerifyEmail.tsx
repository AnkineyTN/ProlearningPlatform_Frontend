import { useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import LogoFG from '@/assets/logo_fg';
import { authAPI } from '@/services/endpoints/auth';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import { useCountdown } from '@/hooks/useCountdown';
import OtpInput from './OtpInput';

type LocationState = {
  email?: string;
  after?: 'signup' | 'forgot';
};

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const email = useMemo(() => state.email ?? '', [state.email]);
  const after = state.after ?? 'signup';
  const { t } = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const succeededRef = useRef(false);
  const resendLock = useCountdown({ seconds: 60, autoStart: true });
  const otpTtl = useCountdown({ seconds: 60, autoStart: true });

  const handleVerify = async (otp: string) => {
    if (succeededRef.current) return;
    if (!email) {
      toast.error(t('verifyEmail.missingEmailError'));
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.verifyEmail({ email, otp });
      succeededRef.current = true;
      toast.success(t('verifyEmail.verifySuccess'));

      if (after === 'forgot') {
        navigate('/forgot-password', { state: { email, autoSubmit: true } });
        return;
      }

      navigate('/onboarding');
    } catch (err: unknown) {
      const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;
      const code = payload?.metadata?.code;
      const msg = payload?.message ?? t('verifyEmail.otpError');

      if (code === 'OTP_ERROR') {
        toast.error(msg);
        return;
      }

      toast.error(msg);
    } finally {
      if (!succeededRef.current) {
        setSubmitting(false);
      }
    }
  };

  const handleReturnToLogin = () => {
    // Signup flow: user is already auto-logged in, so going back means
    // continuing into the app. Forgot flow: not authenticated → go to login.
    navigate(after === 'forgot' ? '/login' : '/dashboard');
  };

  const handleResend = async () => {
    if (!resendLock.isDone) return;
    if (!email) {
      toast.error(t('verifyEmail.missingEmailError'));
      return;
    }

    setSubmitting(true);
    try {
      if (after === 'forgot') {
        await authAPI.forgotPassword({ email });
        toast.success(t('verifyEmail.otpResent'));
      } else {
        await authAPI.resendVerifyOtp();
        toast.success(t('verifyEmail.otpResent'));
      }
      resendLock.reset(60);
      otpTtl.reset(60);
    } catch (err: unknown) {
      const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;
      toast.error(payload?.message ?? t('verifyEmail.resendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className='mb-7'>
          <div className='text-[10px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]'>
            {t('verifyEmail.subtitle')}
          </div>
          <h1
            className='text-[32px] tracking-[-0.02em] leading-[1.1] m-0 mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('verifyEmail.title')}
          </h1>
          <p
            className='text-[15px] italic m-0 text-[var(--pl-text-muted)]'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('verifyEmail.description')}
          </p>
        </div>

        {/* Email display */}
        <div className='mb-6'>
          <div className='text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-1.5'>
            {t('verifyEmail.emailLabel')}
          </div>
          <div className='text-[13.5px] font-semibold text-[var(--pl-text)]'>
            {email || t('verifyEmail.emailMissing')}
          </div>
        </div>

        <div className='flex flex-col gap-5'>
          <OtpInput disabled={submitting} onComplete={handleVerify} />

          <div className='flex items-center justify-between text-[11.5px] text-[var(--pl-text-faint)]'>
            <span>
              {t('verifyEmail.otpExpiresIn', { time: otpTtl.format() })}
            </span>
            {resendLock.isDone ? (
              <button
                type='button'
                onClick={handleResend}
                disabled={submitting}
                className='font-semibold text-[var(--pl-accent-strong)] hover:opacity-80 transition-opacity disabled:opacity-60 cursor-pointer'
              >
                {t('verifyEmail.resendCode')}
              </button>
            ) : (
              <span>
                {t('verifyEmail.resendIn', { time: resendLock.format() })}
              </span>
            )}
          </div>

          <button
            type='button'
            disabled
            title={t('verifyEmail.autoVerifyTitle')}
            className='w-full py-3 rounded-full text-[13.5px] font-semibold bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] opacity-50 cursor-not-allowed'
          >
            {t('verifyEmail.autoVerifyButton')}
          </button>
        </div>

        <p className='mt-6 text-center text-[12.5px] text-[var(--pl-text-muted)]'>
          <button
            type='button'
            onClick={handleReturnToLogin}
            className='font-semibold text-[var(--pl-accent-strong)] hover:opacity-80 transition-opacity cursor-pointer'
          >
            {t('verifyEmail.back')}
          </button>
        </p>
      </div>
    </div>
  );
}
