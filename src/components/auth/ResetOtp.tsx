import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import LogoFG from '@/assets/logo_fg';
import { authAPI } from '@/services/endpoints/auth';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import { useCountdown } from '@/hooks/useCountdown';
import OtpInput from './OtpInput';

type LocationState = {
  email?: string;
};

export default function ResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const email = useMemo(() => state.email ?? '', [state.email]);
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const otpTtl = useCountdown({ seconds: 15 * 60, autoStart: true });

  const handleVerifyResetOtp = async (otp: string) => {
    if (!email) {
      toast.error(t('resetOtp.missingEmailError'));
      return;
    }
    setSubmitting(true);
    try {
      const res = await authAPI.verifyResetOtp({ email, otp });
      const resetToken = res.data.data.resetToken;
      toast.success(t('resetOtp.success'));
      navigate('/reset-password', { state: { email, resetToken } });
    } catch (err: unknown) {
      const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;
      const code = payload?.metadata?.code;
      const msg = payload?.message ?? t('resetOtp.otpError');
      if (code === 'OTP_ERROR') {
        toast.error(msg);
        return;
      }
      toast.error(msg);
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
            {t('resetOtp.subtitle')}
          </div>
          <h1
            className='text-[32px] tracking-[-0.02em] leading-[1.1] m-0 mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('resetOtp.title')}
          </h1>
          <p
            className='text-[15px] italic m-0 text-[var(--pl-text-muted)]'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('resetOtp.description')}
          </p>
        </div>

        {/* Email display */}
        <div className='mb-6'>
          <div className='text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-1.5'>
            {t('resetOtp.emailLabel')}
          </div>
          <div className='text-[13.5px] font-semibold text-[var(--pl-text)]'>
            {email || t('resetOtp.emailMissing')}
          </div>
        </div>

        <div className='flex flex-col gap-5'>
          <OtpInput disabled={submitting} onComplete={handleVerifyResetOtp} />
          <div className='text-[11.5px] text-[var(--pl-text-faint)] text-center'>
            {t('resetOtp.otpExpiresIn', { time: otpTtl.format() })}
          </div>
        </div>

        <p className='mt-6 text-center text-[12.5px] text-[var(--pl-text-muted)]'>
          <Link
            to='/forgot-password'
            className='font-semibold text-[var(--pl-accent-strong)] hover:opacity-80 transition-opacity'
            state={{ email }}
          >
            {t('resetOtp.resendOtp')}
          </Link>
        </p>
      </div>
    </div>
  );
}
