import type { User } from "@/store/authSlice";

export type ApiMetadata = {
  code?: string;
  path?: string;
  [k: string]: unknown;
};

export type ApiResponse<TData> = {
  status: string;
  message: string;
  data: TData;
  metadata: ApiMetadata | null;
};

export type ApiErrorResponse = {
  status: "error" | string;
  message: string;
  data: null;
  metadata: ApiMetadata | null;
};

export type AuthResponse = {
  status: string;
  message: string;
  data: {
    userResponseDto: User;
    accessToken: string;
  };
  metadata: Record<string, unknown>;
}

export type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: string;
}

export type LoginData = {
  email: string;
  password: string;
}

export type GoogleAuthResponse = {
  status: string;
  message: string;
  data: {
    authorizationUrl: string;
  };
  metadata: Record<string, unknown>;
}

export type MeResponse = {
  user: User;
}

export type VerifyEmailData = {
  email: string;
  otp: string;
};

export type ForgotPasswordData = {
  email: string;
};

export type VerifyResetOtpData = {
  email: string;
  otp: string;
};

export type VerifyResetOtpResponseData = {
  resetToken: string;
};

export type ResetPasswordData = {
  resetToken: string;
  newPassword: string;
};
