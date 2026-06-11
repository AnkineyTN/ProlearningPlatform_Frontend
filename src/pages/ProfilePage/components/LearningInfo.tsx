import { useTranslation } from 'react-i18next';
import type {
  FieldErrors,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ProfileSection, { FieldLabel } from './Section';
import {
  educations,
  hearAppFromOptions,
  inputCls,
  languages,
  type ProfileFormData,
} from '../constants';

interface ProfileLearningInfoProps {
  watch: UseFormWatch<ProfileFormData>;
  setValue: UseFormSetValue<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  loading: boolean;
}

export default function ProfileLearningInfo({
  watch,
  setValue,
  errors,
  loading,
}: ProfileLearningInfoProps) {
  const { t } = useTranslation();
  const language = watch('language');
  const education = watch('education');
  const hearAppFrom = watch('hearAppFrom');

  return (
    <ProfileSection
      title={t('profile.learningProfile.title')}
      sub={t('profile.learningProfile.sub')}
    >
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-[18px]'>
        <label className='flex flex-col gap-1.5'>
          <FieldLabel>{t('profile.learningProfile.language')}</FieldLabel>
          <Select
            value={language}
            onValueChange={(v) =>
              setValue('language', v, { shouldDirty: true })
            }
            disabled={loading}
          >
            <SelectTrigger className={inputCls + ' cursor-pointer'}>
              <SelectValue
                placeholder={t('profile.learningProfile.languagePlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              {languages.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.language && (
            <p className='text-xs text-destructive'>
              {errors.language.message}
            </p>
          )}
        </label>

        <label className='flex flex-col gap-1.5'>
          <FieldLabel>{t('profile.learningProfile.education')}</FieldLabel>
          <Select
            value={education}
            onValueChange={(v) =>
              setValue('education', v, { shouldDirty: true })
            }
            disabled={loading}
          >
            <SelectTrigger className={inputCls + ' cursor-pointer'}>
              <SelectValue
                placeholder={t('profile.learningProfile.educationPlaceholder')}
              />
            </SelectTrigger>
            <SelectContent>
              {educations.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.education && (
            <p className='text-xs text-destructive'>
              {errors.education.message}
            </p>
          )}
        </label>

        <label className='flex flex-col gap-1.5'>
          <FieldLabel>{t('profile.learningProfile.hearAppFrom')}</FieldLabel>
          <Select
            value={hearAppFrom}
            onValueChange={(v) =>
              setValue('hearAppFrom', v, { shouldDirty: true })
            }
            disabled={loading}
          >
            <SelectTrigger className={inputCls + ' cursor-pointer'}>
              <SelectValue
                placeholder={t(
                  'profile.learningProfile.hearAppFromPlaceholder',
                )}
              />
            </SelectTrigger>
            <SelectContent>
              {hearAppFromOptions.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.hearAppFrom && (
            <p className='text-xs text-destructive'>
              {errors.hearAppFrom.message}
            </p>
          )}
        </label>
      </div>
    </ProfileSection>
  );
}
