type OnboardingData = {
  language: string;
  education: string;
  source: string;
  premium: boolean;
  studySet: {
    name: string;
    description: string;
    privacy: string;
  };
};

type OnboardingDraft = {
  currentStep: number;
  data: OnboardingData;
  updatedAt?: string;
};

type OnboardingSubmission = {
  id: string;
  submittedAt: string;
  userId: number | null;
  email: string | null;
  displayName: string | null;
  data: OnboardingData;
  completedVia: 'complete' | 'skip';
};

export type { OnboardingData, OnboardingDraft, OnboardingSubmission };
