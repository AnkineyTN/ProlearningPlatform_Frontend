import type { ReactNode } from 'react';
import { Check } from 'lucide-react';

type OnboardingStepProps = {
  title: string;
  description?: string;
  /** Tailwind max-width class for the content column. */
  maxWidth?: string;
  children: ReactNode;
};

/** Shared page shell for every onboarding step: background, centered content
 * column and the title/description header. */
export const OnboardingStep = ({
  title,
  description,
  maxWidth = 'max-w-2xl',
  children,
}: OnboardingStepProps) => (
  <div className='min-h-screen flex items-center justify-center p-6 bg-[var(--pl-bg)]'>
    <div className={`w-full ${maxWidth}`}>
      <div className='text-center mb-10'>
        <h1 className='font-[family-name:var(--font-display)] text-[34px] font-normal tracking-tight text-[var(--pl-text)] mb-2'>
          {title}
        </h1>
        {description && (
          <p className='text-[14px] text-[var(--pl-text-muted)]'>{description}</p>
        )}
      </div>
      {children}
    </div>
  </div>
);

/** Trailing accent check badge shown on a selected option row. */
export const SelectionCheck = () => (
  <div className='w-6 h-6 rounded-full flex items-center justify-center bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'>
    <Check className='w-4 h-4' />
  </div>
);
