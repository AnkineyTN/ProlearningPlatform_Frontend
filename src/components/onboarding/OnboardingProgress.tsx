import { useTranslation } from 'react-i18next';

type Props = {
  currentStep: number;
  totalSteps?: number;
};

const TOTAL = 5;

const OnboardingProgress = ({ currentStep, totalSteps = TOTAL }: Props) => {
  const { t } = useTranslation();
  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className='fixed top-0 left-0 right-0 z-50 px-4 pt-4 pointer-events-none'>
      <div className='max-w-2xl mx-auto pointer-events-auto'>
        <div className='flex items-center justify-between text-xs text-muted-foreground mb-1.5'>
          <span>
            {t('onboarding.progress.step', {
              current: currentStep,
              total: totalSteps,
            })}
          </span>
          <span>
            {t('onboarding.progress.percent', {
              pct,
            })}
          </span>
        </div>
        <div
          className='h-1.5 rounded-full bg-[var(--pl-bg-hover)] border border-ring overflow-hidden'
          role='progressbar'
          aria-valuenow={currentStep}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
        >
          <div
            className='h-full bg-foreground transition-[width] duration-300 ease-out rounded-full'
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default OnboardingProgress;
