import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { OnboardingStep } from './shared';

type Props = {
  onSelectPremium: () => void;
  onSkip: () => void;
  onBack: () => void;
};

const PremiumSelection = ({ onSelectPremium, onSkip, onBack }: Props) => {
  const { t } = useTranslation();
  return (
    <OnboardingStep
      title={t('onboarding.premiumSelection.title')}
      description={t('onboarding.premiumSelection.description')}
      maxWidth='max-w-3xl'
    >
      <div className='grid md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-[var(--pl-bg-elev)] rounded-2xl border border-[var(--pl-border)] p-8'>
          <h3 className='text-xl font-semibold mb-4 text-[var(--pl-text)]'>
            {t('onboarding.premiumSelection.free')}
          </h3>
          <div className='font-[family-name:var(--font-display)] text-3xl font-medium mb-6 text-[var(--pl-text)]'>
            {t('onboarding.premiumSelection.priceFree')}
          </div>
          <ul className='space-y-3 mb-8'>
            <li className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-[var(--pl-success)] flex-shrink-0 mt-0.5' />
              <span className='text-foreground font-semibold'>
                {t('onboarding.premiumSelection.freeFeatures.aiLimited')}
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-[var(--pl-success)] flex-shrink-0 mt-0.5' />
              <span className='text-foreground'>
                {t(
                  'onboarding.premiumSelection.freeFeatures.unlimitedStudySets',
                )}
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-[var(--pl-success)] flex-shrink-0 mt-0.5' />
              <span className='text-foreground'>
                {t('onboarding.premiumSelection.freeFeatures.basicStudyModes')}
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-[var(--pl-success)] flex-shrink-0 mt-0.5' />
              <span className='text-foreground'>
                {t('onboarding.premiumSelection.freeFeatures.communityAccess')}
              </span>
            </li>
          </ul>
        </div>

        <div className='bg-gradient-to-br from-[var(--pl-accent)] to-[var(--pl-accent-strong)] rounded-2xl border border-transparent p-8 text-[var(--pl-accent-fg)] relative overflow-hidden'>
          <div className='absolute top-4 text-[var(--pl-accent)] right-4 bg-[var(--pl-bg)] px-3 py-1 rounded-full text-xs font-bold'>
            {t('onboarding.premiumSelection.badgePopular')}
          </div>
          <h3 className='text-xl font-semibold mb-4'>
            {t('onboarding.premiumSelection.premium')}
          </h3>
          <div className='font-[family-name:var(--font-display)] text-3xl font-medium mb-6'>
            {t('onboarding.premiumSelection.pricePremium')}
            <span className='text-lg font-normal'>
              {t('onboarding.premiumSelection.pricePremiumInterval')}
            </span>
          </div>
          <ul className='space-y-3 mb-8'>
            <li className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-[var(--pl-accent-fg)] flex-shrink-0 mt-0.5' />
              <span className='font-semibold'>
                {t('onboarding.premiumSelection.premiumFeatures.ai5x')}
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-[var(--pl-accent-fg)] flex-shrink-0 mt-0.5' />
              <span>
                {t(
                  'onboarding.premiumSelection.premiumFeatures.everythingInFree',
                )}
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-[var(--pl-accent-fg)] flex-shrink-0 mt-0.5' />
              <span>
                {t(
                  'onboarding.premiumSelection.premiumFeatures.advancedStudyModes',
                )}
              </span>
            </li>
            <li className='flex items-start gap-3'>
              <Check className='w-5 h-5 text-[var(--pl-accent-fg)] flex-shrink-0 mt-0.5' />
              <span>
                {t(
                  'onboarding.premiumSelection.premiumFeatures.adFreeExperience',
                )}
              </span>
            </li>
          </ul>
          <button
            onClick={onSelectPremium}
            className='cursor-pointer w-full py-3 bg-[var(--pl-bg)] text-[var(--pl-accent-strong)] rounded-full font-semibold hover:opacity-90 transition-opacity'
          >
            {t('onboarding.premiumSelection.selectPremium')}
          </button>
        </div>
      </div>

      <div className='flex items-center justify-between'>
        <button
          onClick={onBack}
          className='px-5 py-2.5 rounded-full border border-[var(--pl-border-strong)] bg-transparent text-[13.5px] font-medium text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] transition-colors flex items-center gap-2 cursor-pointer'
        >
          <ChevronLeft className='w-4 h-4' />
          <span>{t('onboarding.back')}</span>
        </button>
        <button
          onClick={onSkip}
          className='px-6 py-2.5 rounded-full bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] text-[13.5px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer'
        >
          <span>{t('onboarding.skipForNow')}</span>
          <ChevronRight className='w-4 h-4' />
        </button>
      </div>
    </OnboardingStep>
  );
};

export default PremiumSelection;
