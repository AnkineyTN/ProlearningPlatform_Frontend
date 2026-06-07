import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  onSelectPremium: () => void;
  onSkip: () => void;
  onBack: () => void;
};

const PremiumSelection = ({ onSelectPremium, onSkip, onBack }: Props) => {
  const { t } = useTranslation();
  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='w-full max-w-3xl'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-foreground mb-3'>
            {t('onboarding.premiumSelection.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('onboarding.premiumSelection.description')}
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-6 mb-8'>
          <div className='bg-[var(--pl-bg)] rounded-2xl border-2 border-ring p-8'>
            <h3 className='text-xl font-bold mb-4'>
              {t('onboarding.premiumSelection.free')}
            </h3>
            <div className='text-3xl font-bold mb-6'>
              {t('onboarding.premiumSelection.priceFree')}
            </div>
            <ul className='space-y-3 mb-8'>
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
                  {t(
                    'onboarding.premiumSelection.freeFeatures.basicStudyModes',
                  )}
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-[var(--pl-success)] flex-shrink-0 mt-0.5' />
                <span className='text-foreground'>
                  {t(
                    'onboarding.premiumSelection.freeFeatures.communityAccess',
                  )}
                </span>
              </li>
            </ul>
          </div>

          <div className='bg-gradient-to-br from-[var(--pl-accent)] to-[var(--pl-accent-strong)] rounded-2xl border-2 border-transparent p-8 text-white relative overflow-hidden'>
            <div className='absolute top-4 right-4 bg-[var(--pl-warning)] text-white px-3 py-1 rounded-full text-xs font-bold'>
              {t('onboarding.premiumSelection.badgePopular')}
            </div>
            <h3 className='text-xl font-bold mb-4'>
              {t('onboarding.premiumSelection.premium')}
            </h3>
            <div className='text-3xl font-bold mb-6'>
              {t('onboarding.premiumSelection.pricePremium')}
              <span className='text-lg font-normal'>
                {t('onboarding.premiumSelection.pricePremiumInterval')}
              </span>
            </div>
            <ul className='space-y-3 mb-8'>
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
              <li className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-[var(--pl-accent-fg)] flex-shrink-0 mt-0.5' />
                <span>
                  {t(
                    'onboarding.premiumSelection.premiumFeatures.prioritySupport',
                  )}
                </span>
              </li>
              <li className='flex items-start gap-3'>
                <Check className='w-5 h-5 text-[var(--pl-accent-fg)] flex-shrink-0 mt-0.5' />
                <span>
                  {t(
                    'onboarding.premiumSelection.premiumFeatures.offlineAccess',
                  )}
                </span>
              </li>
            </ul>
            <button
              onClick={onSelectPremium}
              className='w-full py-3 bg-white text-[var(--pl-accent)] rounded-xl font-semibold hover:bg-[var(--pl-bg-hover)] transition-colors'
            >
              {t('onboarding.premiumSelection.selectPremium')}
            </button>
          </div>
        </div>

        <div className='flex items-center justify-between'>
          <button
            onClick={onBack}
            className='px-4 py-2 rounded-xl border border-ring bg-[var(--pl-bg)] text-foreground hover:bg-[var(--pl-bg-hover)] transition-colors flex items-center gap-2 cursor-pointer'
          >
            <ChevronLeft className='w-4 h-4' />
            <span>{t('onboarding.back')}</span>
          </button>
          <button
            onClick={onSkip}
            className='px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-90 transition-colors flex items-center gap-2 cursor-pointer'
          >
            <span>{t('onboarding.skipForNow')}</span>
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PremiumSelection;
