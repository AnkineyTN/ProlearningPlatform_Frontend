type OnboardingData = {
  language: string;
  education: string;
  role: string;
  source: string;
  premium: boolean;
  studySet: {
    name: string;
    description: string;
    privacy: string;
  };
};

export { OnboardingData };
