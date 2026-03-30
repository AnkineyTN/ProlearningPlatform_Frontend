import {
  Check,
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  MoreHorizontal,
} from "lucide-react";
import SwitchButton from "./SwitchButton";
import { useTranslation } from "react-i18next";

type Props = {
  selectedEducation: string;
  onEducationSelect: (edu: string) => void;
  onNext: () => void;
  onBack: () => void;
};

const EducationSelection = ({
  selectedEducation,
  onEducationSelect,
  onNext,
  onBack,
}: Props) => {
  const { t } = useTranslation();
  const educationLevels = [
    {
      id: "High School",
      label: t("onboarding.educationSelection.highSchool"),
      description: t("onboarding.educationSelection.highSchoolDescription"),
      icon: GraduationCap,
    },
    {
      id: "College",
      label: t("onboarding.educationSelection.college"),
      description: t("onboarding.educationSelection.collegeDescription"),
      icon: BookOpen,
    },
    {
      id: "Grad School",
      label: t("onboarding.educationSelection.gradSchool"),
      description: t("onboarding.educationSelection.gradSchoolDescription"),
      icon: Award,
    },
    {
      id: "Med School",
      label: t("onboarding.educationSelection.medSchool"),
      description: t("onboarding.educationSelection.medSchoolDescription"),
      icon: Briefcase,
    },
    {
      id: "Other",
      label: t("onboarding.educationSelection.other"),
      description: t("onboarding.educationSelection.otherDescription"),
      icon: MoreHorizontal,
    },
  ];

  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='w-full max-w-2xl'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-foreground mb-3'>
            {t("onboarding.educationSelection.title")}
          </h1>
          <p className='text-muted-foreground'>
            {t("onboarding.educationSelection.description")}
          </p>
        </div>

        <div className='space-y-3 mb-8'>
          {educationLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = selectedEducation === level.id;

            return (
              <button
                key={level.id}
                onClick={() => onEducationSelect(level.id)}
                className={`w-full p-5 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-blue-500 bg-card-selected"
                    : "border-ring bg-card-secondary hover:border-gray-300"
                }`}
              >
                <div className='flex items-center gap-4'>
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-foreground text-background"
                        : "bg-card text-foreground"
                    }`}
                  >
                    <Icon className='w-5 h-5' />
                  </div>

                  <div className='flex-1'>
                    <div className='font-semibold text-foreground'>
                      {level.label}
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      {level.description}
                    </div>
                  </div>

                  {isSelected && (
                    <div className='w-6 h-6 bg-foreground rounded-full flex items-center justify-center'>
                      <Check className='w-4 h-4 text-background' />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <SwitchButton
          onPre={onBack}
          onNext={onNext}
          disableNext={!selectedEducation}
        />
      </div>
    </div>
  );
};

export default EducationSelection;
