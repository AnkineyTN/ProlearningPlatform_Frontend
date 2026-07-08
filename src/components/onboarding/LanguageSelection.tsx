import { Info } from 'lucide-react';
import SwitchButton from './SwitchButton';
import { useTranslation } from 'react-i18next';
import { OnboardingStep, SelectionCheck } from './shared';
import { optionCardClass } from './styles';

type Props = {
  selectedLanguage: string;
  onLanguageSelect: (lang: string) => void;
  onNext: () => void;
  onBack: () => void;
};

const LanguageSelection = ({
  selectedLanguage,
  onLanguageSelect,
  onNext,
  onBack,
}: Props) => {
  const { t } = useTranslation();
  const languages = [
    { id: 'en', flag: '🇺🇸', code: 'EN', name: 'English' },
    { id: 'vi', flag: '🇻🇳', code: 'VI', name: 'Tiếng Việt' },
  ] as const;

  return (
    <OnboardingStep
      title={t('onboarding.languageSelection.header')}
      description={t('onboarding.languageSelection.description')}
    >
      <div className='space-y-3 mb-6'>
        {languages.map((lang) => {
          const isSelected = selectedLanguage === lang.id;
          return (
            <button
              key={lang.id}
              onClick={() => onLanguageSelect(lang.id)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${optionCardClass(
                isSelected,
              )}`}
            >
              <div className='flex items-center gap-4'>
                <span className='text-2xl'>{lang.flag}</span>
                <div className='text-left'>
                  <div className='text-[11px] tracking-[0.12em] uppercase text-[var(--pl-text-faint)]'>
                    {lang.code}
                  </div>
                  <div className='font-semibold text-[var(--pl-text)]'>
                    {lang.name}
                  </div>
                </div>
              </div>
              {isSelected && <SelectionCheck />}
            </button>
          );
        })}
      </div>

      <div className='bg-[var(--pl-accent-soft-2)] border border-[var(--pl-border)] rounded-2xl p-4 flex items-start gap-3 mb-8'>
        <Info className='w-5 h-5 text-[var(--pl-text-muted)] flex-shrink-0 mt-0.5' />
        <p className='text-[13px] text-[var(--pl-text-muted)]'>
          {t('onboarding.languageSelection.info')}
        </p>
      </div>

      <SwitchButton
        onPre={onBack}
        onNext={onNext}
        disableNext={!selectedLanguage}
        hideBack
      />
    </OnboardingStep>
  );
};

export default LanguageSelection;
