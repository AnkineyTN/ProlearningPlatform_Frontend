import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import { type OnboardingData } from "@/components/onboarding/type";
import LanguageSelection from "@/components/onboarding/LanguageSelection";
import EducationSelection from "@/components/onboarding/EducationSelection";
import SourceSelection from "@/components/onboarding/SourceSelection";
import PremiumSelection from "@/components/onboarding/PremiumSelection";
import CreateStudySet from "@/components/onboarding/CreateStudySet";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import { mapOnboardingDataToSubmissionPayload } from "@/lib/onboardingApiMapping";
import {
  clearOnboardingDraft,
  loadOnboardingDraft,
  saveOnboardingDraft,
} from "@/lib/onboardingStorage";
import { authAPI } from "@/services/endpoints/auth";
import { useAuth } from "@/hooks/useAuth";

const TOTAL_STEPS = 5;

/** Drafts from the old 6-step flow (with Role) map onto the new step index. */
function migrateOnboardingStep(savedStep: number): number {
  if (savedStep <= 3) return savedStep;
  return savedStep - 1;
}

const initialData: OnboardingData = {
  language: "en",
  education: "",
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
  const { user } = useAuth();
  const [hydrated, setHydrated] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [finishing, setFinishing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const draft = loadOnboardingDraft();
    if (draft) {
      const migrated = migrateOnboardingStep(draft.currentStep);
      setCurrentStep(Math.min(Math.max(migrated, 1), TOTAL_STEPS));
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

  const persistFinish = async () => {
    if (user?.id == null) {
      toast.error(t("onboarding.submitMissingUser"));
      return;
    }
    setFinishing(true);
    try {
      await authAPI.updateMe(mapOnboardingDataToSubmissionPayload(data));
      clearOnboardingDraft();
      navigate("/dashboard");
    } catch {
      toast.error(t("onboarding.submitError"));
    } finally {
      setFinishing(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      void i18n.changeLanguage(data.language);
    }
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSkipStudySet = () => {
    void persistFinish();
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
      <OnboardingProgress
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
      />
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
        <SourceSelection
          selectedSource={data.source}
          onSourceSelect={(source) => setData({ ...data, source })}
          onNext={handleNext}
          onBack={handleBack}
        />
      )}
      {currentStep === 4 && (
        <PremiumSelection
          onSelectPremium={handleSelectPremium}
          onSkip={handleSkipPremium}
          onBack={handleBack}
        />
      )}
      {currentStep === 5 && (
        <CreateStudySet
          studySet={data.studySet!}
          onStudySetChange={handleStudySetChange}
          onComplete={persistFinish}
          onSkip={handleSkipStudySet}
          onBack={handleBack}
          isSubmitting={finishing}
        />
      )}
    </div>
  );
};

export default OnboardingApp;
