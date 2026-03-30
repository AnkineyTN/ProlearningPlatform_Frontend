import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import i18n from "@/i18n/config";
import { type OnboardingData } from "@/components/onboarding/type";
import LanguageSelection from "@/components/onboarding/LanguageSelection";
import EducationSelection from "@/components/onboarding/EducationSelection";
import RoleSelection from "@/components/onboarding/RoleSelection";
import SourceSelection from "@/components/onboarding/SourceSelection";
import PremiumSelection from "@/components/onboarding/PremiumSelection";
import CreateStudySet from "@/components/onboarding/CreateStudySet";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import {
  appendOnboardingSubmission,
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/onboardingStorage";
import type { RootState } from "@/store";

const initialData: OnboardingData = {
  language: "en",
  education: "",
  role: "",
  source: "",
  premium: false,
  studySet: {
    name: "",
    description: "",
    privacy: "public",
  },
};

const OnboardingApp: React.FC = () => {
  const { t } = useTranslation();
  const user = useSelector((s: RootState) => s.auth.user);
  const [hydrated, setHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const navigate = useNavigate();

  useEffect(() => {
    const draft = loadOnboardingDraft();
    if (draft) {
      setCurrentStep(
        Math.min(Math.max(draft.currentStep, 1), 6),
      );
      setData(draft.data);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void i18n.changeLanguage(data.language);
  }, [hydrated, data.language]);

  useEffect(() => {
    if (!hydrated) return;
    saveOnboardingDraft({ currentStep, data });
  }, [hydrated, currentStep, data]);

  const persistFinish = (completedVia: "complete" | "skip") => {
    appendOnboardingSubmission({
      userId: user?.id ?? null,
      email: user?.email ?? null,
      displayName: user
        ? `${user.firstName} ${user.lastName}`.trim() || null
        : null,
      data,
      completedVia,
    });
    clearOnboardingDraft();
  };

  const handleNext = () => {
    if (currentStep === 1) {
      void i18n.changeLanguage(data.language);
    }
    setCurrentStep((prev) => Math.min(prev + 1, 6));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleComplete = () => {
    persistFinish("complete");
    navigate("/dashboard");
  };

  const handleSkipStudySet = () => {
    persistFinish("skip");
    navigate("/dashboard");
  };

  const handleSkipPremium = () => {
    setData({ ...data, premium: false });
    handleNext();
  };

  const handleSelectPremium = () => {
    setData({ ...data, premium: true });
    handleNext();
  };

  const handleStudySetChange = (field: string, value: string) => {
    setData({
      ...data,
      studySet: {
        ...data.studySet!,
        [field]: value,
      },
    });
  };

  if (!hydrated) {
    return (
      <div className='min-h-screen flex items-center justify-center text-muted-foreground text-sm'>
        {t("onboarding.loading")}
      </div>
    );
  }

  return (
    <div className='pt-14'>
      <OnboardingProgress currentStep={currentStep} />
      {currentStep === 1 && (
        <LanguageSelection
          selectedLanguage={data.language}
          onLanguageSelect={(lang) => setData({ ...data, language: lang })}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 2 && (
        <EducationSelection
          selectedEducation={data.education}
          onEducationSelect={(edu) => setData({ ...data, education: edu })}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
        <RoleSelection
          selectedRole={data.role}
          onRoleSelect={(role) => setData({ ...data, role })}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 4 && (
        <SourceSelection
          selectedSource={data.source}
          onSourceSelect={(source) => setData({ ...data, source })}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 5 && (
        <PremiumSelection
          onSelectPremium={handleSelectPremium}
          onSkip={handleSkipPremium}
          onBack={handleBack}
        />
      )}
      {currentStep === 6 && (
        <CreateStudySet
          studySet={data.studySet!}
          onStudySetChange={handleStudySetChange}
          onComplete={handleComplete}
          onSkip={handleSkipStudySet}
          onBack={handleBack}
        />
      )}
    </div>
  );
};

export default OnboardingApp;
