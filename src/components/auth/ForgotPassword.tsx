import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import LogoFG from "@/assets/logo_fg";
import { authAPI } from "@/services/endpoints/auth";
import type { ApiErrorResponse } from "@/services/types/auth.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCountdown } from "@/hooks/useCountdown";

type LocationState = {
  email?: string;
  autoSubmit?: boolean;
};

type FormData = {
  email: string;
};

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [submitting, setSubmitting] = useState(false);
  const resendLock = useCountdown({ seconds: 60, autoStart: true });

  const defaultEmail = useMemo(() => state.email ?? "", [state.email]);

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
    if (state.email) setValue("email", state.email);
  }, [setValue, state.email]);

  const email = watch("email");

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await authAPI.forgotPassword({ email: data.email });
      toast.success("Nếu email tồn tại, bạn sẽ nhận được mã OTP.");
      resendLock.reset(60);
      navigate("/reset-otp", { state: { email: data.email } });
    } catch (err: unknown) {
      const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;

      const code = payload?.metadata?.code;
      const msg = payload?.message ?? "Không thể gửi OTP. Vui lòng thử lại.";

      if (code === "EMAIL_NOT_VERIFIED") {
        toast.info(msg);
        navigate("/verify-email", { state: { email: data.email, after: "forgot" } });
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

  return (
    <div className="min-h-screen w-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute -top-40 -right-10 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.3)_0%,rgba(168,85,247,0.15)_50%,transparent_70%)] blur-[70px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-20 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.35)_0%,rgba(59,130,246,0.15)_50%,transparent_70%)] blur-[60px] pointer-events-none" />

      <a href="/" className="absolute top-8 left-20">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.5)]">
          <LogoFG />
        </div>
      </a>

      <div className="relative z-10 w-[460px] my-10 bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-3xl px-10 py-11 shadow-[0_25px_60px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        <div className="mb-7">
          <h1 className="text-[28px] font-bold tracking-tight mb-2">
            Quên mật khẩu
          </h1>
          <p className="text-muted-foreground text-sm">
            Nhập email để nhận OTP đặt lại mật khẩu.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label className="block text-[13px] font-semibold text-foreground mb-2 tracking-wide">
              Email <span className="text-pink-400">*</span>
            </Label>
            <Input
              type="email"
              {...register("email")}
              placeholder="user@example.com"
              className={`w-full py-2.5 text-sm outline-none transition-all ${errors.email ? "border-red-400/60" : "border-ring"}`}
              disabled={submitting}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl cursor-pointer bg-gradient-to-r from-violet-500 via-indigo-500 to-pink-500 text-white text-sm font-bold tracking-wide"
          >
            Gửi OTP
          </Button>

          <div className="text-xs text-muted-foreground text-center">
            {resendLock.isDone ? (
              <span>Bạn có thể gửi lại OTP nếu chưa nhận được.</span>
            ) : (
              <span>Gửi lại sau {resendLock.format()}.</span>
            )}
          </div>

          <div className="text-center text-[13px] text-muted-foreground">
            <Link
              to="/login"
              className="text-violet-400/90 font-semibold hover:text-violet-300 transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </form>

        {email ? (
          <div className="mt-6 text-center text-xs text-muted-foreground">
            Email hiện tại: <span className="font-semibold text-foreground">{email}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

