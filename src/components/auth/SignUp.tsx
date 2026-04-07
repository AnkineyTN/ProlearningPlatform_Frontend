import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { signupSchema, type SignupFormData } from "@/schemas/auth";
import { authAPI } from "@/services/endpoints/auth";
import { loginStart, loginFailure, loginSuccess } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  AlertCircleIcon,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  RefreshCw,
  CircleDot,
} from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import LogoFG from "@/assets/logo_fg";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

const SignUp = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const signupSchemaInstance = signupSchema(t);
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchemaInstance),
    defaultValues: { role: "ROLE_USER" },
  });

  const handleGoogleLogin = async () => {
    try {
      const response = await authAPI.googleAuth();
      window.location.href = response.data.data.authorizationUrl;
    } catch {
      toast.error(t("signin.failedGoogleConnect"));
    }
  };

  const onSubmit = async (data: SignupFormData) => {
    dispatch(loginStart());
    try {
      await authAPI.signup({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: "ROLE_USER",
      });
      toast.success("🎉 " + t("signup.success"), {
        position: "top-right",
        autoClose: 2000,
      });
      const loginResponse = await authAPI.login({
        email: data.email,
        password: data.password,
      });
      dispatch(
        loginSuccess({
          user: loginResponse.data.data.userResponseDto,
          token: loginResponse.data.data.accessToken,
        }),
      );
      navigate("/verify-email", { state: { email: data.email, after: "signup" } });
    } catch {
      dispatch(loginFailure(t("signup.failed")));
    }
  };

  const InpuClass = (hasError: boolean) =>
    `w-full bg-white/5 border pl-10 pr-3.5 py-2.5 text-sm placeholder:text-muted-foreground outline-none transition-all focus:border-violet-500/60 focus:bg-white/[0.07] ${hasError ? "border-red-400/60" : "border-ring"}`;

  return (
    <div className='min-h-screen w-screen flex items-center justify-center relative overflow-hidden'>
      {/* Gradient orbs */}
      <div className='absolute -top-40 -right-10 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.3)_0%,rgba(168,85,247,0.15)_50%,transparent_70%)] blur-[70px] pointer-events-none' />
      <div className='absolute -bottom-32 -left-20 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.35)_0%,rgba(59,130,246,0.15)_50%,transparent_70%)] blur-[60px] pointer-events-none' />
      <div className='absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.15)_0%,transparent_70%)] blur-[50px] pointer-events-none' />

      {/* Logo */}
      <a href='/dashboard' className='absolute top-8 left-20'>
        <div className='w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]'>
          <LogoFG />
        </div>
      </a>

      {/* Card */}
      <div className='relative z-10 w-[460px] my-10 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl px-10 py-11 shadow-[0_25px_60px_rgba(0,0,0,0.5)]'>
        {/* Top shimmer line */}
        <div className='absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent' />

        <div className='mb-7'>
          <h1 className='text-[28px] font-bold tracking-tight mb-2'>
            {t("signup.title")}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t("signup.description")}
          </p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='flex flex-col gap-3.5'
        >
          {/* First + Last name */}
          <div className='flex gap-3'>
            <div className='flex-1'>
              <Label className='block text-[13px] font-semibold text-foreground mb-2 tracking-wide'>
                {t("signup.firstName")} <span className='text-pink-400'>*</span>
              </Label>
              <div className='relative'>
                <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'>
                  <User size={15} />
                </span>
                <Input
                  type='text'
                  {...register("firstName")}
                  placeholder={t("signup.firstNamePlaceholder")}
                  className={InpuClass(!!errors.firstName)}
                />
              </div>
              {errors.firstName && (
                <p className='text-red-400 text-xs mt-1'>
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className='flex-1'>
              <Label className='block text-[13px] font-semibold text-foreground mb-2 tracking-wide'>
                {t("signup.lastName")} <span className='text-pink-400'>*</span>
              </Label>
              <div className='relative'>
                <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'>
                  <User size={15} />
                </span>
                <Input
                  type='text'
                  {...register("lastName")}
                  placeholder={t("signup.lastNamePlaceholder")}
                  className={InpuClass(!!errors.lastName)}
                />
              </div>
              {errors.lastName && (
                <p className='text-red-400 text-xs mt-1'>
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <Label className='block text-[13px] font-semibold text-foreground mb-2 tracking-wide'>
              {t("signup.email")}
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'>
                <Mail size={15} />
              </span>
              <Input
                type='email'
                {...register("email")}
                placeholder={t("signup.emailPlaceholder")}
                className={InpuClass(!!errors.email)}
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
            <Label className='block text-[13px] font-semibold text-foreground mb-2 tracking-wide'>
              {t("signup.password")} <span className='text-pink-400'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'>
                <Lock size={15} />
              </span>
              <Input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                placeholder='••••••••'
                className={`${InpuClass(!!errors.password)} pr-10`}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors'
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </span>
            </div>
            {errors.password ? (
              <p className='text-red-400 text-xs mt-1'>
                {errors.password.message}
              </p>
            ) : (
              <div className='flex items-center gap-1.5 mt-1.5 text-muted-foreground text-xs'>
                <CircleDot size={12} />
                {t("signup.passwordRequirement")}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <Label className='block text-[13px] font-semibold text-foreground mb-2 tracking-wide'>
              {t("signup.confirmPassword")}{" "}
              <span className='text-pink-400'>*</span>
            </Label>
            <div className='relative'>
              <span className='absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground'>
                <Lock size={15} />
              </span>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                {...register("confirmPassword")}
                placeholder='••••••••'
                className={`${InpuClass(!!errors.confirmPassword)} pr-10`}
              />
              <span
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className='absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground cursor-pointer hover:text-foreground transition-colors'
              >
                {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </span>
            </div>
            {errors.confirmPassword && (
              <p className='text-red-400 text-xs mt-1'>
                {errors.confirmPassword.message}
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

          {/* Submit */}
          <Button
            type='submit'
            disabled={isLoading}
            data-testid='create-btn'
            className='w-full mt-1 py-3 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-sm font-bold tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_4px_30px_rgba(168,85,247,0.6)] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer'
          >
            {isLoading && <RefreshCw size={14} className='animate-spin' />}
            {t("signup.createAccount")}
          </Button>

          {/* Divider */}
          <div className='flex items-center gap-3 my-1'>
            <div className='flex-1 h-px bg-ring' />
            <span className='text-xs text-muted-foreground'>
              {t("signin.orContinueWith")}
            </span>
            <div className='flex-1 h-px bg-ring' />
          </div>

          {/* Google */}
          <Button
            type='button'
            variant={"default"}
            onClick={handleGoogleLogin}
            className='w-full py-2.5 text-sm font-medium flex items-center justify-center gap-2.5 cursor-pointer transition-all'
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

        <p className='mt-5 text-center text-[13px] text-muted-foreground'>
          {t("signup.haveAccount")}
          <Link
            to='/login'
            className='ml-1 text-violet-400/90 font-semibold hover:text-violet-300 transition-colors'
          >
            {t("signup.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;