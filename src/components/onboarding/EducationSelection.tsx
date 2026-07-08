import {
  GraduationCap,
  BookOpen,
  Award,
  Briefcase,
  MoreHorizontal,
} from 'lucide-react';
import SwitchButton from './SwitchButton';
import { useTranslation } from 'react-i18next';
import { OnboardingStep, SelectionCheck } from './shared';
import { optionCardClass } from './styles';

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
      id: 'High School',
      label: t('onboarding.educationSelection.highSchool'),
      description: t('onboarding.educationSelection.highSchoolDescription'),
      icon: GraduationCap,
    },
    {
      id: 'College',
      label: t('onboarding.educationSelection.college'),
      description: t('onboarding.educationSelection.collegeDescription'),
      icon: BookOpen,
    },
    {
      id: 'Grad School',
      label: t('onboarding.educationSelection.gradSchool'),
      description: t('onboarding.educationSelection.gradSchoolDescription'),
      icon: Award,
    },
    {
      id: 'Med School',
      label: t('onboarding.educationSelection.medSchool'),
      description: t('onboarding.educationSelection.medSchoolDescription'),
      icon: Briefcase,
    },
    {
      id: 'Other',
      label: t('onboarding.educationSelection.other'),
      description: t('onboarding.educationSelection.otherDescription'),
      icon: MoreHorizontal,
    },
  ];

  return (
    <OnboardingStep
      title={t('onboarding.educationSelection.title')}
      description={t('onboarding.educationSelection.description')}
    >
      <div className='space-y-3 mb-8'>
        {educationLevels.map((level) => {
          const Icon = level.icon;
          const isSelected = selectedEducation === level.id;

          return (
            <button
              key={level.id}
              onClick={() => onEducationSelect(level.id)}
              className={`w-full p-5 rounded-2xl border transition-all text-left cursor-pointer ${optionCardClass(
                isSelected,
              )}`}
            >
              <div className='flex items-center gap-4'>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected
                      ? 'bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'
                      : 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]'
                  }`}
                >
                  <Icon className='w-5 h-5' />
                </div>

                <div className='flex-1'>
                  <div className='font-semibold text-[var(--pl-text)]'>
                    {level.label}
                  </div>
                  <div className='text-[13px] text-[var(--pl-text-muted)]'>
                    {level.description}
                  </div>
                </div>

                {isSelected && <SelectionCheck />}
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
    </OnboardingStep>
  );
};

export default EducationSelection;
