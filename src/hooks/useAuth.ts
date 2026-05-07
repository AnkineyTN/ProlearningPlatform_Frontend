import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "@/services/endpoints/auth";
import type { LoginData, SignupData, UpdateMeRequest } from "@/services/types/auth.types";

export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  language: string;
  education: string;
  hearAppFrom: string;
  accountType?: string;
};

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export const refreshTokenStorage = {
  get: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  set: (t: string) => localStorage.setItem(REFRESH_TOKEN_KEY, t),
  clear: () => localStorage.removeItem(REFRESH_TOKEN_KEY),
};

const userStorage = {
  get: (): User | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },
  set: (u: User) => localStorage.setItem(USER_KEY, JSON.stringify(u)),
  clear: () => localStorage.removeItem(USER_KEY),
};

export const authQueryKey = ["auth", "me"] as const;

export function useAuth() {
  const token = tokenStorage.get();
  const query = useQuery<User | null>({
    queryKey: authQueryKey,
    queryFn: async () => {
      const res = await authAPI.getMe();
      const u = res.data.data as User;
      userStorage.set(u);
      return u;
    },
    enabled: !!token,
    initialData: () => userStorage.get(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    user: query.data ?? null,
    token,
    isAuthenticated: !!token,
    isLoading: query.isLoading,
  };
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: LoginData) => {
      const res = await authAPI.login(data);
      return res.data.data;
    },
    onSuccess: (data) => {
      tokenStorage.set(data.accessToken);
      if (data.refreshToken) refreshTokenStorage.set(data.refreshToken);
      userStorage.set(data.userResponseDto);
      qc.setQueryData(authQueryKey, data.userResponseDto);
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupData) => {
      const res = await authAPI.signup(data);
      return res.data;
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    tokenStorage.clear();
    refreshTokenStorage.clear();
    userStorage.clear();
    qc.removeQueries({ queryKey: authQueryKey });
    qc.clear();
  };
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateMeRequest) => {
      const res = await authAPI.updateMe(payload);
      return res.data;
    },
    onSuccess: (data) => {
      const u = data.data as User;
      userStorage.set(u);
      qc.setQueryData(authQueryKey, u);
    },
  });
}
