import type { RefObject } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import PrivacyCards from './PrivacyCards';

export type ManualErrors = {
  titleEmpty?: boolean;
  titleTooLong?: boolean;
  descriptionTooShort?: boolean;
  descriptionTooLong?: boolean;
  privacy?: boolean;
};

type Props = {
  type: string;
  title: string;
  onTitleChange: (value: string) => void;
  titleInputRef?: RefObject<HTMLInputElement | null>;
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
  titleInputRef,
  description,
  onDescriptionChange,
  privacy,
  onPrivacyChange,
  errors,
}: Props) => {
  const { t } = useTranslation();
  const typeLower = type.toLowerCase();

  return (
    <div className='space-y-5 min-w-0'>
      <div className='min-w-0'>
        <div className='flex items-baseline justify-between gap-2'>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2 block'>
            {t('modal.title')}
            <span className='text-destructive ml-1'>*</span>
          </Label>
          <span className='text-xs text-muted-foreground shrink-0'>
            {t('modal.charCount', {
              current: title.length,
              max: 100,
              defaultValue: '{{current}}/{{max}}',
            })}
          </span>
        </div>
        <Input
          ref={titleInputRef}
          type='text'
          value={title}
          maxLength={100}
          onChange={(e) => onTitleChange(e.target.value)}
          className={cn(
            'w-full min-w-0 h-11 px-3.5 rounded-lg bg-[var(--pl-bg-sunken)] focus-visible:ring-2',
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
      </div>

      <div className='min-w-0'>
        <div className='flex items-baseline justify-between gap-2 mb-2'>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground'>
            {t('modal.description')}
          </Label>
          <div className='flex items-baseline gap-2 shrink-0'>
            <span className='text-xs text-muted-foreground'>
              {t('modal.charCount', {
                current: description.length,
                max: 500,
                defaultValue: '{{current}}/{{max}}',
              })}
            </span>
          </div>
        </div>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          maxLength={500}
          className={cn(
            'w-full min-w-0 px-3.5 py-3 rounded-lg bg-[var(--pl-bg-sunken)] focus-visible:ring-2 resize-none min-h-[110px] break-words',
            errors.descriptionTooShort || errors.descriptionTooLong
              ? 'border-destructive focus-visible:ring-destructive'
              : 'border-border focus-visible:ring-[var(--pl-accent-border)]',
          )}
          rows={4}
          placeholder={t(`modal.descriptionPlaceholder.${typeLower}`, {
            defaultValue: t('modal.enterDescription'),
          })}
        />
        {errors.descriptionTooShort && (
          <p className='text-destructive text-sm mt-1.5'>
            {t('modal.descriptionTooShort')}
          </p>
        )}
        {errors.descriptionTooLong && (
          <p className='text-destructive text-sm mt-1.5'>
            {t('modal.descriptionTooLong')}
          </p>
        )}
      </div>
      {type !== 'Set' && (
        <PrivacyCards
          value={privacy}
          onChange={onPrivacyChange}
          error={errors.privacy}
        />
      )}
    </div>
  );
};

export default CreateManualTab;
