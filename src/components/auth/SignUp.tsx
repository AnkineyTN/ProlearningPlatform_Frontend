import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signupSchema, type SignupFormData } from '@/schemas/auth';
import { authAPI } from '@/services/endpoints/auth';
import { useLogin, useSignup } from '@/hooks/useAuth';
import {
  AlertCircleIcon,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  CircleDot,
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import LogoFG from '@/assets/logo_fg';
import { cn } from '@/lib/utils';
import { getApiError, prettifyApiMessage } from '@/lib/apiError';
import { Label } from '../ui/label';
import { Input } from '../ui/input';

const SignUp = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const signupSchemaInstance = signupSchema(t);
  const signup = useSignup();
  const login = useLogin();
  const isLoading = signup.isPending || login.isPending;
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchemaInstance),
    defaultValues: { role: 'ROLE_USER' },
  });

  const handleGoogleLogin = async () => {
    try {
      const response = await authAPI.googleAuth();
      window.location.href = response.data.data.authorizationUrl;
    } catch {
      toast.error(t('signin.failedGoogleConnect'));
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    setError(null);

    try {
      await signup.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: 'ROLE_USER',
      });
    } catch (err: unknown) {
      const { code, message, status, isNetwork } = getApiError(err);
      const haystack = `${code ?? ''} ${message ?? ''}`;
      if (isNetwork) {
        setError(t('signup.networkError'));
      } else if (status === 409 || /EXIST|ALREADY|DUPLICATE/i.test(haystack)) {
        setFieldError('email', { message: t('signup.emailExists') });
      } else if (status === 400 && /email/i.test(haystack)) {
        setFieldError('email', { message: t('signup.invalidEmail') });
      } else {
        setError(prettifyApiMessage(message) ?? t('signup.failed'));
      }
      return;
    }

    toast.success('🎉 ' + t('signup.success'));

    // Account is created; auto-login is a convenience. If it fails (e.g. a
    // transient error), the account still exists — send them to the login page
    // rather than showing a misleading "signup failed" error.
    try {
      await login.mutateAsync({
        email: data.email,
        password: data.password,
      });
    } catch {
      navigate('/login');
      return;
    }

    navigate('/verify-email', {
      state: { email: data.email, after: 'signup' },
    });
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
    <div className='min-h-screen flex items-center justify-center text-[var(--pl-text)] px-6 py-10 relative overflow-hidden'>
      {/* Gradient orbs */}
      <div className='absolute -top-40 -right-10 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,var(--pl-accent-border)_0%,var(--pl-accent-soft)_50%,transparent_70%)] blur-[70px] pointer-events-none' />
      <div className='absolute -bottom-32 -left-20 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,var(--pl-accent-soft)_0%,var(--pl-accent-soft)_50%,transparent_70%)] blur-[60px] pointer-events-none' />
      <div className='absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,var(--pl-accent-soft)_0%,transparent_70%)] blur-[50px] pointer-events-none' />

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
      <div className='relative w-[460px] max-w-full bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] px-9 py-9 my-10'>
        {/* Header */}
        <div className='mb-7'>
          <div className='text-[10px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]'>
            {t('signup.createAccount')}
          </div>
          <h1
            className='text-[32px] tracking-[-0.02em] leading-[1.1] m-0 mb-2 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('signup.title')}
          </h1>
          <p
            className='text-[15px] italic m-0 text-[var(--pl-text-muted)]'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('signup.description')}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col gap-3.5'
        >
          {/* First + Last */}
          <div className='flex gap-3'>
            <div className='flex-1'>
              <Label className='block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-2'>
                {t('signup.firstName')}{' '}
                <span className='text-[var(--pl-accent-strong)]'>*</span>
              </Label>
              <div className='relative'>
                <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'>
                  <User size={14} />
                </span>
                <Input
                  type='text'
                  maxLength={20}
                  {...register('firstName')}
                  placeholder={t('signup.firstNamePlaceholder')}
                  className={inputClass(!!errors.firstName)}
                />
              </div>
              {errors.firstName && (
                <p className='text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[11.5px] mt-1.5'>
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className='flex-1'>
              <Label className='block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-2'>
                {t('signup.lastName')}{' '}
                <span className='text-[var(--pl-accent-strong)]'>*</span>
              </Label>
              <div className='relative'>
                <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'>
                  <User size={14} />
                </span>
                <Input
                  type='text'
                  maxLength={20}
                  {...register('lastName')}
                  placeholder={t('signup.lastNamePlaceholder')}
                  className={inputClass(!!errors.lastName)}
                />
              </div>
              {errors.lastName && (
                <p className='text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[11.5px] mt-1.5'>
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label className='block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-2'>
              {t('signup.email')}
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'>
                <Mail size={14} />
              </span>
              <Input
                type='email'
                maxLength={254}
                {...register('email')}
                placeholder={t('signup.emailPlaceholder')}
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
            <Label className='block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-2'>
              {t('signup.password')}{' '}
              <span className='text-[var(--pl-accent-strong)]'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'>
                <Lock size={14} />
              </span>
              <Input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                placeholder='••••••••'
                className={cn(inputClass(!!errors.password), 'pr-10')}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)] cursor-pointer hover:text-[var(--pl-text)] transition-colors'
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </span>
            </div>
            {errors.password ? (
              <p className='text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[11.5px] mt-1.5'>
                {errors.password.message}
              </p>
            ) : (
              <div className='flex items-center gap-1.5 mt-1.5 text-[11.5px] text-[var(--pl-text-faint)]'>
                <CircleDot size={11} />
                {t('signup.passwordRequirement')}
              </div>
            )}
          </div>

          {/* Confirm */}
          <div>
            <Label className='block text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-text-muted)] mb-2'>
              {t('signup.confirmPassword')}{' '}
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

          {/* API error */}
          {error && (
            <div className='flex items-center gap-2 px-3.5 py-2.5 rounded-[10px] border border-[var(--pl-danger,oklch(0.65_0.2_25))]/30 bg-[var(--pl-danger,oklch(0.65_0.2_25))]/10 text-[var(--pl-danger,oklch(0.65_0.2_25))] text-[12.5px]'>
              <AlertCircleIcon size={14} />
              <p className='m-0'>{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type='submit'
            disabled={isLoading}
            data-testid='create-btn'
            className='w-full mt-1 py-3 rounded-full text-[13.5px] font-semibold inline-flex items-center justify-center gap-2 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity cursor-pointer'
          >
            {isLoading && <RefreshCw size={13} className='animate-spin' />}
            {t('signup.createAccount')}
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

        <p className='mt-6 text-center text-[12.5px] text-[var(--pl-text-muted)]'>
          {t('signup.haveAccount')}
          <Link
            to='/login'
            className='ml-1 font-semibold text-[var(--pl-accent-strong)] hover:opacity-80 transition-opacity'
          >
            {t('signup.signIn')}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
