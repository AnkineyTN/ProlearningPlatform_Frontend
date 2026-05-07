import { Pencil, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

export type CreateMode = 'manual' | 'ai';

type Props = {
  value: CreateMode;
  onChange: (value: CreateMode) => void;
  disabled?: boolean;
};

const CreateModeTabs = ({ value, onChange, disabled }: Props) => {
  const { t } = useTranslation();

  const tabs: { value: CreateMode; icon: typeof Pencil; label: string }[] = [
    {
      value: 'manual',
      icon: Pencil,
      label: t('modal.tabs.manual', { defaultValue: 'Create manually' }),
    },
    {
      value: 'ai',
      icon: Sparkles,
      label: t('modal.tabs.ai', { defaultValue: 'Generate by AI' }),
    },
  ];

  return (
    <div className='mb-6 p-1 rounded-full bg-[var(--pl-bg-sunken)] border border-border grid grid-cols-2 gap-1'>
      {tabs.map(({ value: tabValue, icon: Icon, label }) => {
        const active = value === tabValue;
        return (
          <button
            key={tabValue}
            type='button'
            onClick={() => onChange(tabValue)}
            disabled={disabled}
            className={cn(
              'flex items-center justify-center gap-2 py-2 rounded-full text-sm font-medium transition-all cursor-pointer disabled:cursor-not-allowed',
              active
                ? 'bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className='w-4 h-4' />
            {label}
          </button>
        );
      })}
    </div>
  );
};

export default CreateModeTabs;
