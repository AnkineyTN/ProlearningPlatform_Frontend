import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { loginSchema, type LoginFormData } from '@/schemas/auth';
import { authAPI } from '@/services/endpoints/auth';
import { useLogin } from '@/hooks/useAuth';
import { appealsAPI } from '@/services/endpoints/appeals';
import {
  AlertCircleIcon,
  Eye,
  EyeOff,
  LockIcon,
  Mail,
  RefreshCw,
  ShieldAlert,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import LogoFG from '@/assets/logo_fg';
import { cn } from '@/lib/utils';
import { getApiError, prettifyApiMessage } from '@/lib/apiError';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const SignIn = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const loginSchemaInstance = loginSchema(t);
  const login = useLogin();
  const isLoading = login.isPending;
  const [error, setError] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [appealEmail, setAppealEmail] = useState('');
  const [appealReason, setAppealReason] = useState('');
  const [appealSubmitting, setAppealSubmitting] = useState(false);
  const [appealSuccess, setAppealSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchemaInstance),
  });

  const handleGoogleLogin = async () => {
    try {
      const response = await authAPI.googleAuth();
      window.location.href = response.data.data.authorizationUrl;
    } catch {
      toast.error(t('signin.failedGoogleConnect'));
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsBlocked(false);
    try {
      await login.mutateAsync(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      const { code, message, status, isNetwork } = getApiError(err);

      if (code === 'ACCOUNT_BLOCKED') {
        setIsBlocked(true);
        setAppealEmail(data.email);
      } else if (code === 'EMAIL_NOT_VERIFIED') {
        toast.info(message ?? t('signin.wrongCredentials'));
        navigate('/verify-email', {
          state: { email: data.email, after: 'signup' },
        });
      } else if (isNetwork) {
        setError(t('signin.networkError'));
      } else if (
        status === 400 ||
        status === 401 ||
        status === 404 ||
        /CREDENTIAL|PASSWORD|INVALID|NOT_FOUND/i.test(code ?? '')
      ) {
        setError(t('signin.wrongCredentials'));
      } else {
        setError(prettifyApiMessage(message) ?? t('signin.unexpectedError'));
      }
    }
  };

  const handleSubmitAppeal = async () => {
    if (!appealEmail || !appealReason.trim()) return;
    setAppealSubmitting(true);
    try {
      await appealsAPI.submitPublic(appealEmail, appealReason.trim());
      setAppealSuccess(true);
      setShowAppealForm(false);
    } catch {
      toast.error(t('signin.appealError'));
    } finally {
      setAppealSubmitting(false);
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
      <div className='absolute bottom-10 left-1/4 w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,var(--pl-accent-soft)_0%,transparent_70%)] blur-[50px] pointer-events-none' />

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
            {t('signin.subtitle')}
          </div>
          <h1
            className='text-[32px] tracking-[-0.02em] leading-[1.1] m-0 mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('signin.title')}
          </h1>
          <p
            className='text-[15px] italic m-0 text-[var(--pl-text-muted)]'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('signin.description')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          {/* Email */}
          <div>
            <Label className='block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-2'>
              {t('signin.email')}{' '}
              <span className='text-[var(--pl-accent-strong)]'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'>
                <Mail size={14} />
              </span>
              <Input
                type='text'
                maxLength={254}
                {...register('email')}
                placeholder={t('signup.emailPlaceholder')}
                required
                className={inputClass(!!errors.email)}
              />
            </div>
            {errors.email && (
              <p className='text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[11.5px] mt-1.5'>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className='flex items-center mb-2'>
              <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)]'>
                {t('signin.password')}{' '}
                <span className='text-[var(--pl-accent-strong)]'>*</span>
              </Label>
              <a
                href='/forgot-password'
                className='ml-auto text-[11.5px] text-[var(--pl-accent-strong)] hover:opacity-80 transition-opacity'
              >
                {t('signin.forgotPassword')}
              </a>
            </div>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'>
                <LockIcon size={14} />
              </span>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder='••••••••'
                required
                {...register('password')}
                className={cn(inputClass(!!errors.password), 'pr-10')}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)] cursor-pointer hover:text-[var(--pl-text)] transition-colors'
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </span>
            </div>
            {errors.password && (
              <p className='text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[11.5px] mt-1.5'>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* API error */}
          {error && (
            <div className='flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border border-[var(--pl-danger,oklch(0.65_0.2_25))]/30 bg-[var(--pl-danger,oklch(0.65_0.2_25))]/10 text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[12.5px]'>
              <AlertCircleIcon size={14} />
              <p className='m-0'>{error}</p>
            </div>
          )}

          {/* Blocked account banner */}
          {isBlocked && !showAppealForm && !appealSuccess && (
            <div className='rounded-[10px] border border-[var(--pl-warning-border)] bg-[var(--pl-warning-soft)] p-3.5 space-y-2'>
              <div className='flex items-center gap-2 text-[var(--pl-warning-text)] text-[12.5px] font-medium'>
                <ShieldAlert size={14} />
                <span>{t('signin.accountBlocked')}</span>
              </div>
              <p className='text-[11.5px] text-[var(--pl-warning-text)]/80 m-0'>
                {t('signin.accountBlockedDesc')}
              </p>
              <button
                type='button'
                onClick={() => setShowAppealForm(true)}
                className='text-[12px] font-semibold text-[var(--pl-warning-text)] underline underline-offset-2 hover:opacity-80'
              >
                {t('signin.submitAppeal')}
              </button>
            </div>
          )}

          {/* Appeal form */}
          {isBlocked && showAppealForm && !appealSuccess && (
            <div className='rounded-[10px] border border-[var(--pl-warning-border)] bg-[var(--pl-warning-soft)] p-3.5 space-y-3'>
              <p className='text-[12.5px] font-medium text-[var(--pl-warning-text)] m-0'>
                {t('signin.appealFormTitle')}
              </p>
              <textarea
                className='w-full rounded-[8px] text-[12.5px] px-3 py-2 bg-white/70 border border-[var(--pl-warning-border)] outline-none resize-none text-[var(--pl-text)] placeholder:text-[var(--pl-text-faint)]'
                rows={3}
                placeholder={t('signin.appealReasonPlaceholder')}
                value={appealReason}
                onChange={(e) => setAppealReason(e.target.value)}
              />
              <div className='flex gap-2'>
                <button
                  type='button'
                  disabled={appealSubmitting || !appealReason.trim()}
                  onClick={handleSubmitAppeal}
                  className='flex-1 py-2 rounded-full text-[12.5px] font-semibold bg-[var(--pl-warning)] text-white hover:opacity-90 disabled:opacity-50'
                >
                  {appealSubmitting ? '...' : t('signin.appealSubmit')}
                </button>
                <button
                  type='button'
                  onClick={() => setShowAppealForm(false)}
                  className='px-3 py-2 rounded-full text-[12.5px] border border-[var(--pl-warning-border)] text-[var(--pl-warning-text)] hover:bg-[var(--pl-warning-soft)]'
                >
                  {t('signin.cancel')}
                </button>
              </div>
            </div>
          )}

          {/* Appeal success */}
          {appealSuccess && (
            <div className='rounded-[10px] border border-[var(--pl-success)]/30 bg-[var(--pl-success-soft)] p-3.5 text-[12.5px] text-[var(--pl-success)]'>
              {t('signin.appealSubmitted')}
            </div>
          )}

          {/* Submit */}
          <button
            type='submit'
            disabled={isLoading}
            data-testid='login-btn'
            className='w-full mt-1 py-3 rounded-full text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer'
          >
            {isLoading && <RefreshCw size={13} className='animate-spin' />}
            {t('signin.subtitle')}
          </button>

          {/* Divider */}
          <div className='flex items-center gap-3 my-1'>
            <div className='flex-1 h-px bg-[var(--pl-border)]' />
            <span className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
              {t('signin.orContinueWith')}
            </span>
            <div className='flex-1 h-px bg-[var(--pl-border)]' />
          </div>

          {/* Google */}
          <button
            type='button'
            onClick={handleGoogleLogin}
            className='w-full py-2.5 rounded-full border border-[var(--pl-border-strong)] bg-transparent text-[13.5px] font-medium text-[var(--pl-text)] inline-flex items-center justify-center gap-2.5 hover:bg-[var(--pl-bg-hover)] transition-colors cursor-pointer'
          >
            <svg width='14' height='14' viewBox='0 0 24 24'>
              <path
                d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                fill='currentColor'
              />
            </svg>
            Google
          </button>
        </form>

        <p className='mt-7 text-center text-[12.5px] text-[var(--pl-text-muted)]'>
          {t('signin.noAccount')}{' '}
          <Link
            to='/signup'
            className='font-semibold text-[var(--pl-accent-strong)] hover:opacity-80 transition-opacity'
          >
            {t('signin.createAccount')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
