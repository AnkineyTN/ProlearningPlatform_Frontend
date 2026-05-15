import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

import LogoFG from '@/assets/logo_fg';
import { authAPI } from '@/services/endpoints/auth';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import { Button } from '@/components/ui/button';
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

  const [submitting, setSubmitting] = useState(false);
  const resendLock = useCountdown({ seconds: 60, autoStart: true });
  const otpTtl = useCountdown({ seconds: 60, autoStart: true });

  const handleVerify = async (otp: string) => {
    if (!email) {
      toast.error('Thiếu email. Vui lòng bắt đầu lại flow.');
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.verifyEmail({ email, otp });
      toast.success('Xác nhận email thành công.');

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
      const msg = payload?.message ?? 'OTP không đúng hoặc đã hết hạn.';

      if (code === 'OTP_ERROR') {
        toast.error(msg);
        return;
      }

      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!resendLock.isDone) return;
    if (!email) {
      toast.error('Thiếu email. Vui lòng bắt đầu lại flow.');
      return;
    }

    setSubmitting(true);
    try {
      if (after === 'forgot') {
        // Spec: resend OTP via calling forgot-password again (no JWT required)
        await authAPI.forgotPassword({ email });
        toast.success('Mã OTP đã được gửi lại.');
      } else {
        // Signup flow: resend verify OTP requires JWT
        await authAPI.resendVerifyOtp();
        toast.success('Mã OTP đã được gửi lại.');
      }
      resendLock.reset(60);
      otpTtl.reset(60);
    } catch (err: unknown) {
      const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;
      toast.error(
        payload?.message ?? 'Không thể gửi lại OTP. Vui lòng thử lại.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen w-screen flex items-center justify-center relative overflow-hidden'>
      <div className='absolute -top-40 -right-10 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.3)_0%,rgba(168,85,247,0.15)_50%,transparent_70%)] blur-[70px] pointer-events-none' />
      <div className='absolute -bottom-32 -left-20 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.35)_0%,rgba(59,130,246,0.15)_50%,transparent_70%)] blur-[60px] pointer-events-none' />

      <a href='/' className='absolute top-8 left-20'>
        <div className='w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]'>
          <LogoFG />
        </div>
      </a>

      <div className='relative z-10 w-[460px] my-10 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl px-10 py-11 shadow-[0_25px_60px_rgba(0,0,0,0.5)]'>
        <div className='absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent' />

        <div className='mb-7'>
          <h1 className='text-[28px] font-bold tracking-tight mb-2'>
            Xác nhận email
          </h1>
          <p className='text-muted-foreground text-sm'>
            Nhập mã OTP 6 số đã gửi về email.
          </p>
        </div>

        <div className='mb-5 text-sm'>
          <div className='text-muted-foreground'>Email</div>
          <div className='font-semibold'>{email || '(thiếu email)'}</div>
        </div>

        <div className='flex flex-col gap-5'>
          <OtpInput disabled={submitting} onComplete={handleVerify} />

          <div className='flex items-center justify-between text-xs text-muted-foreground'>
            <span>OTP hết hạn sau {otpTtl.format()}.</span>
            {resendLock.isDone ? (
              <button
                type='button'
                onClick={handleResend}
                disabled={submitting}
                className='underline underline-offset-4 hover:text-foreground disabled:opacity-60'
              >
                Gửi lại mã
              </button>
            ) : (
              <span>Gửi lại sau {resendLock.format()}.</span>
            )}
          </div>

          <Button
            type='button'
            variant='default'
            className='w-full py-3 rounded-xl cursor-pointer'
            disabled
            title='Mã OTP đủ 6 số sẽ tự verify'
          >
            Tự động xác nhận khi đủ 6 số
          </Button>

          <div className='text-center text-[13px] text-muted-foreground'>
            <Link
              to='/login'
              className='text-violet-400/90 font-semibold hover:text-violet-300 transition-colors'
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
