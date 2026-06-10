import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

export type Step = 'goal' | 'preview' | 'done';

export const StepIndicator = ({ step }: { step: Step }) => {
  const { t } = useTranslation();
  const steps: { key: Step; label: string }[] = [
    { key: 'goal', label: t('roadmap.create.step1') },
    { key: 'preview', label: t('roadmap.create.step2') },
    { key: 'done', label: t('roadmap.create.step3') },
  ];
  const idx = steps.findIndex((s) => s.key === step);

  return (
    <div className='flex items-center gap-2 mb-6'>
      {steps.map((s, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <div key={s.key} className='flex items-center gap-2'>
            <div
              className={`flex items-center gap-2 px-3 py-[6px] rounded-full text-[11.5px] border border-[var(--pl-border)] ${
                active
                  ? 'bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'
                  : done
                    ? 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
                    : 'bg-[var(--pl-bg-elev)] text-[var(--pl-text-faint)]'
              }`}
            >
              <span className='font-mono-pl'>{i + 1}</span>
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={12} className='text-[var(--pl-text-faint)]' />
            )}
          </div>
        );
      })}
    </div>
  );
};
