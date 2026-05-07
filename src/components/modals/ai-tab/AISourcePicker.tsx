import { Check, FileText, FileUp, Link2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import type { AISource } from './types';

type Props = {
  value: AISource;
  onChange: (value: AISource) => void;
  disabled?: boolean;
};

const AISourcePicker = ({ value, onChange, disabled }: Props) => {
  const { t } = useTranslation();

  const cards = [
    {
      value: 'notes' as const,
      icon: FileText,
      label: t('modal.ai.fromNotes', { defaultValue: 'From Note' }),
      description: t('modal.ai.fromNotesDesc', {
        defaultValue: 'Pick existing notes from this set.',
      }),
    },
    {
      value: 'files' as const,
      icon: FileUp,
      label: t('modal.ai.uploadFiles', { defaultValue: 'Upload File' }),
      description: t('modal.ai.uploadFilesDesc', {
        defaultValue: 'PDF, DOCX, PPTX, TXT — AI reads and summarizes.',
      }),
    },
    {
      value: 'web' as const,
      icon: Link2,
      label: t('modal.ai.fromWeb', { defaultValue: 'Web URL' }),
      description: t('modal.ai.fromWebDesc', {
        defaultValue: 'Articles, Wikipedia, MDN — AI crawls them.',
      }),
    },
  ];

  return (
    <div>
      <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2.5 block'>
        {t('modal.ai.sourceLabel', { defaultValue: 'Content source' })}
      </Label>
      <div className='grid grid-cols-3 gap-3'>
        {cards.map((card) => {
          const Icon = card.icon;
          const selected = value === card.value;
          return (
            <button
              key={card.value}
              type='button'
              onClick={() => onChange(card.value)}
              disabled={disabled}
              className={cn(
                'group relative flex gap-2 text-left rounded-xl border p-4 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? 'border-[var(--pl-accent)] bg-[var(--pl-accent-soft)]'
                  : 'border-border bg-[var(--pl-bg-sunken)] hover:border-foreground/40',
              )}
            >
              {selected && (
                <span className='absolute top-3 right-3 w-5 h-5 rounded-full bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] flex items-center justify-center'>
                  <Check className='w-3 h-3' strokeWidth={3} />
                </span>
              )}
              <span
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-lg shrink-0',
                  selected
                    ? 'bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'
                    : 'bg-[var(--pl-bg-elevated)] text-muted-foreground',
                )}
              >
                <Icon className='w-5 h-5' />
              </span>
              <div>
                <div className='font-semibold text-sm mb-1'>{card.label}</div>
                <p className='text-xs text-muted-foreground leading-snug'>
                  {card.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AISourcePicker;
