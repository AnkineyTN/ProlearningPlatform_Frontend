import type { AxiosResponse } from "axios";
import api from "../client";
import type {
  OnboardingAnalytics,
  OnboardingApiEnvelope,
  OnboardingSubmissionRecord,
  OnboardingSubmissionRequest,
} from "../types/onboarding.types";

function asArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (
    value &&
    typeof value === "object" &&
    "content" in value &&
    Array.isArray((value as { content: unknown }).content)
  ) {
    return (value as { content: T[] }).content;
  }
  return [];
}

export const onboardingAPI = {
  submit: (
    body: OnboardingSubmissionRequest,
  ): Promise<AxiosResponse<OnboardingApiEnvelope<OnboardingSubmissionRecord>>> =>
    api.post("/onboarding/submission", body),

  getAdminSubmissions: (params: {
    page?: number;
    size?: number;
    sort?: string;
  }): Promise<
    AxiosResponse<OnboardingApiEnvelope<OnboardingSubmissionRecord[]>>
  > =>
    api.get("/admin/onboarding/submissions", {
      params: {
        page: params.page ?? 0,
        size: params.size ?? 20,
        sort: params.sort ?? "updatedAt,DESC",
      },
    }),

  getAdminAnalytics: (): Promise<
    AxiosResponse<OnboardingApiEnvelope<OnboardingAnalytics>>
  > => api.get("/admin/onboarding/analytics"),
};

export function extractSubmissionsList(
  data: unknown,
): OnboardingSubmissionRecord[] {
  return asArray<OnboardingSubmissionRecord>(data);
}
