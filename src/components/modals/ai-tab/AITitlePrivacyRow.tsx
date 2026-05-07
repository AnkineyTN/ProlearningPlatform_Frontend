import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import type { AIPrivacy } from './types';

type Props = {
  title: string;
  onTitleChange: (value: string) => void;
  privacy: AIPrivacy;
  onPrivacyChange: (value: AIPrivacy) => void;
  disabled?: boolean;
};

const AITitlePrivacyRow = ({
  title,
  onTitleChange,
  privacy,
  onPrivacyChange,
  disabled,
}: Props) => {
  const { t } = useTranslation();

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <div>
        <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2 block'>
          {t('modal.title')}
        </Label>
        <Input
          type='text'
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={disabled}
          placeholder={t('modal.ai.titleAutoPlaceholder', {
            defaultValue: 'Auto-generate',
          })}
          className='h-11 px-3.5 rounded-lg bg-[var(--pl-bg-sunken)]'
        />
        <p
          className='text-xs text-muted-foreground italic mt-1.5'
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {t('modal.ai.titleAutoHint', {
            defaultValue: 'Leave empty for AI to name it.',
          })}
        </p>
      </div>
      <div>
        <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2 block'>
          {t('modal.privacy')}
        </Label>
        <Select
          value={privacy}
          onValueChange={(v) => onPrivacyChange(v as AIPrivacy)}
          disabled={disabled}
        >
          <SelectTrigger className='w-full h-11 bg-[var(--pl-bg-sunken)]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='PRIVATE'>{t('modal.private')}</SelectItem>
            <SelectItem value='UNLISTED'>{t('modal.unlisted')}</SelectItem>
            <SelectItem value='PUBLIC'>{t('modal.public')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default AITitlePrivacyRow;
