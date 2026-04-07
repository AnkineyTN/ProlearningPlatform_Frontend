import { useMemo, useState } from "react";
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

type LocationState = {
  email?: string;
  resetToken?: string;
};

type FormData = {
  newPassword: string;
  confirmPassword: string;
};

const schema = z
  .object({
    newPassword: z.string().min(8, "Mật khẩu phải tối thiểu 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng nhập lại mật khẩu"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"],
  });

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const email = useMemo(() => state.email ?? "", [state.email]);
  const resetToken = useMemo(() => state.resetToken ?? "", [state.resetToken]);

  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!resetToken) {
      toast.error("Thiếu reset token. Vui lòng bắt đầu lại flow.");
      return;
    }
    setSubmitting(true);
    try {
      await authAPI.resetPassword({ resetToken, newPassword: data.newPassword });
      toast.success("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.");
      navigate("/login");
    } catch (err: unknown) {
      const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;

      const code = payload?.metadata?.code;
      const msg =
        payload?.message ??
        "Token không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.";

      if (code === "OTP_ERROR") {
        toast.error(msg);
        return;
      }
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
        <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent" />

        <div className="mb-7">
          <h1 className="text-[28px] font-bold tracking-tight mb-2">
            Đặt lại mật khẩu
          </h1>
          <p className="text-muted-foreground text-sm">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>
        </div>

        <div className="mb-5 text-sm">
          <div className="text-muted-foreground">Email</div>
          <div className="font-semibold">{email || "(không lưu email)"}</div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <Label className="block text-[13px] font-semibold text-foreground mb-2 tracking-wide">
              Mật khẩu mới <span className="text-pink-400">*</span>
            </Label>
            <Input
              type="password"
              {...register("newPassword")}
              placeholder="••••••••"
              disabled={submitting}
              className={`w-full py-2.5 text-sm outline-none transition-all ${errors.newPassword ? "border-red-400/60" : "border-ring"}`}
            />
            {errors.newPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <Label className="block text-[13px] font-semibold text-foreground mb-2 tracking-wide">
              Nhập lại mật khẩu <span className="text-pink-400">*</span>
            </Label>
            <Input
              type="password"
              {...register("confirmPassword")}
              placeholder="••••••••"
              disabled={submitting}
              className={`w-full py-2.5 text-sm outline-none transition-all ${errors.confirmPassword ? "border-red-400/60" : "border-ring"}`}
            />
            {errors.confirmPassword && (
              <p className="text-red-400 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl cursor-pointer bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white text-sm font-bold tracking-wide"
          >
            Đặt lại mật khẩu
          </Button>

          <div className="text-center text-[13px] text-muted-foreground">
            <Link
              to="/login"
              className="text-violet-400/90 font-semibold hover:text-violet-300 transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

