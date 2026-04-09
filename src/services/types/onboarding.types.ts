export type OnboardingSubmissionPayload = {
  language: string;
  education: string;
  hearAppFrom: string;
  accountType: string;
};

export type OnboardingApiEnvelope<T> = {
  status: string;
  message: string;
  data: T;
  metadata?: Record<string, unknown> | null;
};

export type OnboardingAnalyticsBucket = {
  label: string;
  count: number;
  percent: number;
};

export type OnboardingAnalyticsPremium = {
  proCount: number;
  freeCount: number;
  proPercent: number;
};

export type OnboardingAnalytics = {
  totalRegisteredUsers: number;
  education: OnboardingAnalyticsBucket[];
  hearAppFrom: OnboardingAnalyticsBucket[];
  premium: OnboardingAnalyticsPremium;
};
