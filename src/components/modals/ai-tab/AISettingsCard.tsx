import { CircleHelp, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  language: string;
  onLanguageChange: (value: string) => void;
  freeText: string;
  onFreeTextChange: (value: string) => void;
  disabled?: boolean;
};

const AISettingsCard = ({
  language,
  onLanguageChange,
  freeText,
  onFreeTextChange,
  disabled,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className='rounded-xl border border-border bg-[var(--pl-bg-sunken)] p-4 space-y-4'>
      <div className='flex items-center gap-2'>
        <Sparkles className='w-4 h-4 text-[var(--pl-accent)]' />
        <span className='text-[11px] font-semibold tracking-[0.12em] uppercase text-[var(--pl-accent)]'>
          {t('modal.ai.aiSettings', { defaultValue: 'AI settings' })}
        </span>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label className='text-xs font-medium text-muted-foreground mb-1.5 block'>
            {t('modal.ai.language', { defaultValue: 'Language' })}
          </Label>
          <Select
            value={language}
            onValueChange={onLanguageChange}
            disabled={disabled}
          >
            <SelectTrigger className='w-full h-10'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='English'>English</SelectItem>
              <SelectItem value='Vietnamese'>Vietnamese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className='text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5'>
          <CircleHelp className='w-3 h-3' />
          {t('modal.ai.specialRequirements', {
            defaultValue: 'Special requirements (optional)',
          })}
        </Label>
        <Textarea
          value={freeText}
          onChange={(e) => onFreeTextChange(e.target.value)}
          placeholder={t('modal.ai.specialRequirementsPlaceholder', {
            defaultValue:
              'E.g. focus on definitions, avoid obscure facts, align with chapter 3…',
          })}
          disabled={disabled}
          rows={3}
          className='resize-y min-h-[80px] text-sm'
        />
      </div>
    </div>
  );
};

export default AISettingsCard;
