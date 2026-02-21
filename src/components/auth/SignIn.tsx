import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormData } from "@/schemas/auth";
import { authAPI } from "@/services/endpoints/auth";
import { loginStart, loginFailure, loginSuccess } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  AlertCircleIcon,
  Eye,
  EyeOff,
  LockIcon,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import LogoFG from "@/assets/logo_fg";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const SignIn = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const loginSchemaInstance = loginSchema(t);
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

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
    } catch (error: any) {
      toast.error(t("signin.failedGoogleConnect"));
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());
    try {
      const response = await authAPI.login(data);
      dispatch(
        loginSuccess({
          user: response.data.data.userResponseDto,
          token: response.data.data.accessToken,
        }),
      );
      navigate("/dashboard");
    } catch (error: any) {
      dispatch(loginFailure(t("signin.wrongCredentials")));
    }
  };

  return (
    <div className='min-h-screen w-screen flex items-center justify-center relative overflow-hidden'>
      {/* Gradient orbs */}
      <div className='absolute -top-32 -left-20 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.35)_0%,rgba(79,70,229,0.15)_50%,transparent_70%)] blur-[60px] pointer-events-none' />
      <div className='absolute -bottom-40 -right-20 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.3)_0%,rgba(168,85,247,0.15)_50%,transparent_70%)] blur-[70px] pointer-events-none' />
      <div className='absolute top-1/2 right-1/4 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.2)_0%,transparent_70%)] blur-[50px] pointer-events-none' />
      <div className='absolute bottom-10 left-1/4 w-[350px] h-[350px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.2)_0%,transparent_70%)] blur-[50px] pointer-events-none' />

      {/* Logo */}
      <a href='/dashboard' className='absolute top-8 left-20 -translate-x-1/2'>
        <div className='w-10 h-10 rounded-xl flex items-center justify-center'>
          <LogoFG />
        </div>
      </a>

      {/* Card */}
      <div className='relative z-10 w-[420px] bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl px-10 py-12 shadow-[0_25px_60px_rgba(0,0,0,0.5)]'>
        {/* Top shimmer line */}
        <div className='absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent' />

        <div className='mb-8'>
          <h1 className='text-[28px] font-bold tracking-tight mb-2'>
            {t("signin.title")}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t("signin.description")}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4'>
          {/* Email */}
          <div>
            <Label className='block text-[13px] font-semibold text-foreground mb-2 tracking-wide'>
              {t("signin.email")} <span className='text-pink-400'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'>
                <Mail size={15} />
              </span>
              <Input
                type='text'
                {...register("email")}
                placeholder={t("signup.emailPlaceholder")}
                required
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm outline-none transition-all ${errors.email ? "border-red-400/60" : "border-ring"}`}
              />
            </div>
            {errors.email && (
              <p className='text-red-400 text-xs mt-1'>
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className='flex items-center mb-2'>
              <Label className='text-[13px] font-semibold text-foreground tracking-wide'>
                {t("signin.password")} <span className='text-pink-400'>*</span>
              </Label>
              <a
                href='#'
                className='ml-auto text-xs text-violet-400/80 hover:text-violet-300 transition-colors'
              >
                {t("signin.forgotPassword")}
              </a>
            </div>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'>
                <LockIcon size={15} />
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder='••••••••'
                required
                {...register("password")}
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm outline-none transition-all ${errors.email ? "border-red-400/60" : "border-ring"}`}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors'
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </span>
            </div>
            {errors.password && (
              <p className='text-red-400 text-xs mt-1'>
                {errors.password.message}
              </p>
            )}
          </div>

          {/* API error */}
          {error && (
            <div className='flex items-center gap-2 px-3.5 py-2.5 bg-red-400/10 border border-red-400/20 rounded-xl text-red-400 text-[13px]'>
              <AlertCircleIcon size={14} />
              <p>{error}</p>
            </div>
          )}

          {/* Submit button */}
          <Button
            type='submit'
            disabled={isLoading}
            data-testid='login-btn'
            className='w-full py-3 rounded-xl cursor-pointer bg-gradient-to-r from-violet-500 via-indigo-500 to-pink-500 text-white text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.6)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
          >
            {isLoading && <RefreshCw size={14} className='animate-spin' />}
            {t("signin.subtitle")}
          </Button>

          {/* Divider */}
          <div className='flex items-center gap-3 my-1'>
            <div className='flex-1 h-px bg-ring' />
            <span className='text-xs text-muted-foreground'>
              {t("signin.orContinueWith")}
            </span>
            <div className='flex-1 h-px bg-ring' />
          </div>

          {/* Google button */}
          <Button
            type='button'
            onClick={handleGoogleLogin}
            variant={"default"}
            className='w-full py-2.5 rounded-xl cursor-pointer border  text-sm font-medium flex items-center justify-center gap-2.5 transition-all'
          >
            <svg width='16' height='16' viewBox='0 0 24 24'>
              <path
                d='M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z'
                fill='currentColor'
              />
            </svg>
            Google
          </Button>
        </form>

        <p className='mt-6 text-center text-[13px] text-muted-foreground'>
          {t("signin.noAccount")}{" "}
          <Link
            to='/signup'
            className='text-violet-400/90 font-semibold hover:text-violet-300 transition-colors'
          >
            {t("signin.createAccount")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;