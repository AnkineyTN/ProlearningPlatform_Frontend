import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { User } from '@/hooks/useAuth';
import ProfileSection, { FieldHint, FieldLabel } from './ProfileSection';
import { inputCls, type ProfileFormData } from './constants';

interface ProfileBasicInfoProps {
  user: User | null | undefined;
  register: UseFormRegister<ProfileFormData>;
  watch: UseFormWatch<ProfileFormData>;
  errors: FieldErrors<ProfileFormData>;
  loading: boolean;
  avatarUploading: boolean;
  bio: string;
  onBioChange: (v: string) => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ProfileBasicInfo({
  user,
  register,
  watch,
  errors,
  loading,
  avatarUploading,
  bio,
  onBioChange,
  onAvatarChange,
}: ProfileBasicInfoProps) {
  const { t } = useTranslation();

  const avatarLetters =
    `${(user?.firstName ?? '').charAt(0)}${(user?.lastName ?? '').charAt(0)}`.toUpperCase() ||
    '?';

  return (
    <ProfileSection
      title={t('profile.basicInfo.title')}
      sub={t('profile.basicInfo.sub')}
    >
      <div className='flex gap-7 items-start mb-6 pb-6 border-b border-dashed border-[var(--pl-border)]'>
        <div className='relative flex-shrink-0 group'>
          <Avatar className='w-24 h-24'>
            {user?.avatarUrl && (
              <AvatarImage
                src={user.avatarUrl}
                alt='avatar'
                className='object-cover'
              />
            )}
            <AvatarFallback
              className='text-[36px] font-medium bg-[linear-gradient(135deg,_var(--pl-accent),_var(--pl-accent-strong))] text-[var(--pl-accent-fg)]'
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {avatarLetters}
            </AvatarFallback>
          </Avatar>
          <label
            className='absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'
            title={t('profile.avatar.change')}
          >
            {avatarUploading ? (
              <div className='w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin' />
            ) : (
              <Camera size={20} className='text-white' />
            )}
            <input
              type='file'
              accept='image/*'
              className='sr-only'
              disabled={avatarUploading}
              onChange={onAvatarChange}
            />
          </label>
        </div>
        <div className='flex-1 pt-1.5'>
          <div
            className='text-[24px] font-medium tracking-tight mb-1 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {user?.firstName} {user?.lastName}
          </div>
          <div className='text-[13.5px] mb-2 flex items-center gap-2.5 flex-wrap text-[var(--pl-text-muted)]'>
            <span>{user?.email}</span>
            <span className='w-1 h-1 rounded-full bg-[var(--pl-text-faint)]' />
            <span className='px-[9px] py-0.5 rounded-full text-[10.5px] tracking-[0.1em] uppercase font-medium bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'>
              {user?.accountType ?? 'FREE'}
            </span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 gap-[18px]'>
        <label className='flex flex-col gap-1.5'>
          <FieldLabel>{t('profile.basicInfo.firstName')}</FieldLabel>
          <Input
            disabled={loading}
            {...register('firstName')}
            className={inputCls}
          />
          {errors.firstName && (
            <p className='text-xs text-destructive'>{errors.firstName.message}</p>
          )}
        </label>

        <label className='flex flex-col gap-1.5'>
          <FieldLabel>{t('profile.basicInfo.lastName')}</FieldLabel>
          <Input
            disabled={loading}
            {...register('lastName')}
            className={inputCls}
          />
          {errors.lastName && (
            <p className='text-xs text-destructive'>{errors.lastName.message}</p>
          )}
        </label>

        <label className='flex flex-col gap-1.5'>
          <FieldLabel>{t('profile.basicInfo.email')}</FieldLabel>
          <Input
            disabled={loading}
            type='email'
            {...register('email')}
            className={inputCls}
          />
          {errors.email && (
            <p className='text-xs text-destructive'>{errors.email.message}</p>
          )}
          <FieldHint>{t('profile.basicInfo.emailHint')}</FieldHint>
        </label>

        <label className='flex flex-col gap-1.5'>
          <FieldLabel>{t('profile.basicInfo.accountType')}</FieldLabel>
          <Input
            disabled
            value={watch('accountType') ?? ''}
            className={
              inputCls + ' text-[var(--pl-text-faint)] bg-[var(--pl-bg-hover)]'
            }
          />
          <FieldHint>{t('profile.basicInfo.accountTypeHint')}</FieldHint>
        </label>

        <div className='sm:col-span-2 flex flex-col gap-1.5'>
          <FieldLabel>{t('profile.basicInfo.bio')}</FieldLabel>
          <Textarea
            value={bio}
            onChange={(e) => onBioChange(e.target.value)}
            rows={3}
            placeholder={t('profile.basicInfo.bioPlaceholder')}
            className={
              inputCls +
              ' resize-y font-[var(--font-serif)] text-[15px] leading-[1.55]'
            }
          />
        </div>
      </div>
    </ProfileSection>
  );
}
