import { Earth, LockKeyhole } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type PrivacyOption = {
  value: string;
  label: string;
  description: string;
  icon: typeof LockKeyhole;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
};

const PrivacyCards = ({ value, onChange, error }: Props) => {
  const { t } = useTranslation();

  const options: PrivacyOption[] = [
    {
      value: 'Private',
      label: t('modal.private'),
      description: t('modal.privacyDesc.private', {
        defaultValue: 'Only you can see.',
      }),
      icon: LockKeyhole,
    },
    {
      value: 'Public',
      label: t('modal.public'),
      description: t('modal.privacyDesc.public', {
        defaultValue: 'Everyone can see.',
      }),
      icon: Earth,
    },
  ];

  return (
    <div>
      <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2.5 block'>
        {t('modal.privacy')}
      </Label>
      <div className='grid grid-cols-2 gap-3'>
        {options.map((opt) => {
          const Icon = opt.icon;
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type='button'
              onClick={() => onChange(opt.value)}
              className={cn(
                'group text-left rounded-lg border p-3 transition-all cursor-pointer',
                selected
                  ? 'border-[var(--pl-accent)] bg-[var(--pl-accent-soft)]'
                  : 'border-border bg-[var(--pl-bg-sunken)] hover:border-foreground/40',
              )}
            >
              <div className='flex items-center gap-2 mb-1'>
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0',
                    selected
                      ? 'text-[var(--pl-accent)]'
                      : 'text-muted-foreground',
                  )}
                />
                <span className='font-semibold text-sm'>{opt.label}</span>
              </div>
              <p className='text-xs text-muted-foreground leading-snug'>
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
      {error && (
        <p className='text-destructive text-sm mt-1.5'>
          {t('modal.privacyRequired')}
        </p>
      )}
    </div>
  );
};

export default PrivacyCards;
