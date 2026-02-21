import type { User } from "@/store/authSlice";

export type AuthResponse = {
  status: string;
  message: string;
  data: {
    userResponseDto: User;
    accessToken: string;
  };
  metadata: Record<string, any>;
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
  metadata: Record<string, any>;
}

export type MeResponse = {
  user: User;
}
