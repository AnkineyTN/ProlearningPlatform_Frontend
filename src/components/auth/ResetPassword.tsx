import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axios from 'axios';
import { Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import LogoFG from '@/assets/logo_fg';
import { authAPI } from '@/services/endpoints/auth';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type LocationState = {
  email?: string;
  resetToken?: string;
};

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;
  const { t } = useTranslation();

  const email = useMemo(() => state.email ?? '', [state.email]);
  const resetToken = useMemo(() => state.resetToken ?? '', [state.resetToken]);

  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          newPassword: z.string().min(8, t('resetPassword.passwordMin')),
          confirmPassword: z.string().min(1, t('resetPassword.confirmRequired')),
        })
        .refine((d) => d.newPassword === d.confirmPassword, {
          message: t('resetPassword.passwordNotMatch'),
          path: ['confirmPassword'],
        }),
    [t],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!resetToken) {
      toast.error(t('resetPassword.missingToken'));
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.resetPassword({
        resetToken,
        newPassword: data.newPassword,
      });
      toast.success(t('resetPassword.success'));
      navigate('/login');
    } catch (err: unknown) {
      const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;

      const code = payload?.metadata?.code;
      const msg = payload?.message ?? t('resetPassword.failed');

      if (code === 'OTP_ERROR') {
        toast.error(msg);
        return;
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className='mb-7'>
          <div className='text-[10px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]'>
            {t('resetPassword.subtitle')}
          </div>
          <h1
            className='text-[32px] tracking-[-0.02em] leading-[1.1] m-0 mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('resetPassword.title')}
          </h1>
          <p
            className='text-[15px] italic m-0 text-[var(--pl-text-muted)]'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('resetPassword.description')}
          </p>
        </div>

        {/* Email display */}
        <div className='mb-6'>
          <div className='text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-1.5'>
            {t('resetPassword.emailLabel')}
          </div>
          <div className='text-[13.5px] font-semibold text-[var(--pl-text)]'>
            {email || t('resetPassword.emailMissing')}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          {/* New password */}
          <div>
            <Label className='block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-2'>
              {t('resetPassword.newPassword')}{' '}
              <span className='text-[var(--pl-accent-strong)]'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'>
                <Lock size={14} />
              </span>
              <Input
                type={showPassword ? 'text' : 'password'}
                {...register('newPassword')}
                placeholder='••••••••'
                disabled={submitting}
                className={cn(inputClass(!!errors.newPassword), 'pr-10')}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)] cursor-pointer hover:text-[var(--pl-text)] transition-colors'
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </span>
            </div>
            {errors.newPassword && (
              <p className='text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[11.5px] mt-1.5'>
                {errors.newPassword.message}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <Label className='block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-2'>
              {t('resetPassword.confirmPassword')}{' '}
              <span className='text-[var(--pl-accent-strong)]'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'>
                <Lock size={14} />
              </span>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                placeholder='••••••••'
                disabled={submitting}
                className={cn(inputClass(!!errors.confirmPassword), 'pr-10')}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)] cursor-pointer hover:text-[var(--pl-text)] transition-colors'
              >
                {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className='text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[11.5px] mt-1.5'>
                {errors.confirmPassword.message}
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
            {t('resetPassword.submit')}
          </button>
        </form>

        <p className='mt-6 text-center text-[12.5px] text-[var(--pl-text-muted)]'>
          <Link
            to='/login'
            className='font-semibold text-[var(--pl-accent-strong)] hover:opacity-80 transition-opacity'
          >
            {t('resetPassword.backToLogin')}
          </Link>
        </p>
      </div>
    </div>
  );
}
