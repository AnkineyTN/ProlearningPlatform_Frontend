import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import PrivacyCards from './PrivacyCards';

export type ManualErrors = {
  titleEmpty?: boolean;
  titleTooLong?: boolean;
  privacy?: boolean;
};

type Props = {
  type: string;
  title: string;
  onTitleChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  privacy: string;
  onPrivacyChange: (value: string) => void;
  errors: ManualErrors;
};

const CreateManualTab = ({
  type,
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  privacy,
  onPrivacyChange,
  errors,
}: Props) => {
  const { t } = useTranslation();
  const typeLower = type.toLowerCase();

  return (
    <div className='space-y-5'>
      <div>
        <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2 block'>
          {t('modal.title')}
        </Label>
        <Input
          type='text'
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className={cn(
            'w-full h-11 px-3.5 rounded-lg bg-[var(--pl-bg-sunken)] focus-visible:ring-2',
            errors.titleEmpty || errors.titleTooLong
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-border focus-visible:ring-[var(--pl-accent-border)]',
          )}
          placeholder={t(`modal.titlePlaceholder.${typeLower}`, {
            defaultValue: t('modal.title'),
          })}
        />
        {errors.titleEmpty && (
          <p className='text-destructive text-sm mt-1.5'>
            {t('modal.titleEmpty')}
          </p>
        )}
        {errors.titleTooLong && (
          <p className='text-destructive text-sm mt-1.5'>
            {t('modal.titleTooLong')}
          </p>
        )}
        <p
          className='text-xs text-muted-foreground italic mt-1.5'
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          {t('modal.titleHint', {
            defaultValue: 'Keep it short — you’ll see it in the Library.',
          })}
        </p>
      </div>

      <div>
        <div className='flex items-baseline justify-between mb-2'>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground'>
            {t('modal.description')}
          </Label>
          <span
            className='text-xs text-muted-foreground italic'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('modal.optionalLabel', { defaultValue: 'optional' })}
          </span>
        </div>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className='w-full px-3.5 py-3 rounded-lg bg-[var(--pl-bg-sunken)] border-border focus-visible:ring-2 focus-visible:ring-[var(--pl-accent-border)] resize-none min-h-[110px]'
          rows={4}
          placeholder={t(`modal.descriptionPlaceholder.${typeLower}`, {
            defaultValue: t('modal.enterDescription'),
          })}
        />
      </div>

      <PrivacyCards
        value={privacy}
        onChange={onPrivacyChange}
        error={errors.privacy}
      />
    </div>
  );
};

export default CreateManualTab;
