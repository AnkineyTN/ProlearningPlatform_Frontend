import type { AxiosResponse } from "axios";
import api, { publicApi } from "../client";
import type {
  AuthResponse,
  SignupData,
  LoginData,
  MeResponse,
  GoogleAuthResponse,
  ApiResponse,
  ForgotPasswordData,
  ResetPasswordData,
  VerifyEmailData,
  VerifyResetOtpData,
  VerifyResetOtpResponseData,
  UpdateMeRequest,
  UpdateMeResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "../types/auth.types";

export const authAPI = {
  signup: (userData: SignupData): Promise<AxiosResponse<AuthResponse>> =>
    publicApi.post("/auth/register", userData),

  login: (userData: LoginData): Promise<AxiosResponse<AuthResponse>> =>
    publicApi.post("/auth/login", userData),

  refresh: (
    payload: RefreshTokenRequest,
  ): Promise<AxiosResponse<RefreshTokenResponse>> =>
    publicApi.post("/auth/refresh", payload),

  getMe: (): Promise<AxiosResponse<MeResponse>> => api.get("/users/me"),

  updateMe: (
    payload: UpdateMeRequest,
  ): Promise<AxiosResponse<UpdateMeResponse>> => api.patch("/users/me", payload),

  googleAuth: (): Promise<AxiosResponse<GoogleAuthResponse>> =>
    publicApi.get("/auth/google/login"),

  verifyEmail: (
    payload: VerifyEmailData,
  ): Promise<AxiosResponse<ApiResponse<null>>> =>
    publicApi.post("/auth/verify-email", payload),

  forgotPassword: (
    payload: ForgotPasswordData,
  ): Promise<AxiosResponse<ApiResponse<null>>> =>
    publicApi.post("/auth/forgot-password", payload),

  verifyResetOtp: (
    payload: VerifyResetOtpData,
  ): Promise<AxiosResponse<ApiResponse<VerifyResetOtpResponseData>>> =>
    publicApi.post("/auth/verify-reset-otp", payload),

  resetPassword: (
    payload: ResetPasswordData,
  ): Promise<AxiosResponse<ApiResponse<null>>> =>
    publicApi.post("/auth/reset-password", payload),

  resendVerifyOtp: (): Promise<AxiosResponse<ApiResponse<null>>> =>
    api.post("/users/me/resend-verify-otp"),
};
