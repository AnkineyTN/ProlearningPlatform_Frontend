import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import LogoFG from "@/assets/logo_fg";
import { authAPI } from "@/services/endpoints/auth";
import type { ApiErrorResponse } from "@/services/types/auth.types";
import { useCountdown } from "@/hooks/useCountdown";
import OtpInput from "./OtpInput";

type LocationState = {
  email?: string;
};

export default function ResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const email = useMemo(() => state.email ?? "", [state.email]);
  const [submitting, setSubmitting] = useState(false);

  const otpTtl = useCountdown({ seconds: 15 * 60, autoStart: true });

  const handleVerifyResetOtp = async (otp: string) => {
    if (!email) {
      toast.error("Thiếu email. Vui lòng bắt đầu lại flow.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authAPI.verifyResetOtp({ email, otp });
      const resetToken = res.data.data.resetToken;
      toast.success("Xác nhận OTP thành công.");
      navigate("/reset-password", { state: { email, resetToken } });
    } catch (err: unknown) {
      const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;
      const code = payload?.metadata?.code;
      const msg = payload?.message ?? "OTP không đúng hoặc đã hết hạn.";
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
        <div className="absolute top-0 left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

        <div className="mb-7">
          <h1 className="text-[28px] font-bold tracking-tight mb-2">
            Nhập OTP đặt lại mật khẩu
          </h1>
          <p className="text-muted-foreground text-sm">
            OTP có hiệu lực 15 phút. Khi đủ 6 số sẽ tự xác nhận.
          </p>
        </div>

        <div className="mb-5 text-sm">
          <div className="text-muted-foreground">Email</div>
          <div className="font-semibold">{email || "(thiếu email)"}</div>
        </div>

        <div className="flex flex-col gap-5">
          <OtpInput disabled={submitting} onComplete={handleVerifyResetOtp} />
          <div className="text-xs text-muted-foreground text-center">
            OTP hết hạn sau {otpTtl.format()}.
          </div>

          <div className="text-center text-[13px] text-muted-foreground">
            <Link
              to="/forgot-password"
              className="text-violet-400/90 font-semibold hover:text-violet-300 transition-colors"
              state={{ email }}
            >
              Gửi lại OTP
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

