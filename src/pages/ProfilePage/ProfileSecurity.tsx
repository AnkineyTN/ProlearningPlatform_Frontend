import { useTranslation } from 'react-i18next';
import type { UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import PasswordField from './PasswordField';
import ProfileSection from './ProfileSection';
import type { ProfileFormData } from './constants';

interface ProfileSecurityProps {
  register: UseFormRegister<ProfileFormData>;
  loading: boolean;
  onSubmit: () => void;
}

export default function ProfileSecurity({
  register,
  loading,
  onSubmit,
}: ProfileSecurityProps) {
  const { t } = useTranslation();

  return (
    <>
      <ProfileSection
        title={t('profile.security.changePassword.title')}
        sub={t('profile.security.changePassword.sub')}
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-[18px] max-w-[720px]'>
          <PasswordField
            label={t('profile.security.changePassword.currentPassword')}
            disabled={loading}
            registration={register('currentPassword')}
          />
          <PasswordField
            label={t('profile.security.changePassword.newPassword')}
            disabled={loading}
            registration={register('newPassword')}
          />
        </div>

        <div className='flex gap-2.5 mt-5'>
          <Button
            type='button'
            disabled={loading}
            onClick={onSubmit}
            className='rounded-full text-[13px] font-medium'
          >
            {loading
              ? t('profile.actions.saving')
              : t('profile.security.changePassword.submit')}
          </Button>
        </div>
      </ProfileSection>

      <ProfileSection
        title={t('profile.security.dangerZone.title')}
        sub={t('profile.security.dangerZone.sub')}
      >
        <div className='flex justify-between items-center py-3.5 border-t border-[var(--pl-border)]'>
          <div>
            <div className='text-[14px] font-medium text-[var(--pl-danger,_oklch(0.65_0.2_25))]'>
              {t('profile.security.dangerZone.deleteAccount')}
            </div>
            <div className='text-[12.5px] mt-0.5 text-[var(--pl-text-muted)]'>
              {t('profile.security.dangerZone.deleteDesc')}
            </div>
          </div>
          <Button
            type='button'
            variant='outline'
            className='rounded-full text-[12px] border-[var(--pl-danger,_oklch(0.65_0.2_25))] text-[var(--pl-danger,_oklch(0.65_0.2_25))]'
          >
            {t('profile.security.dangerZone.deleteBtn')}
          </Button>
        </div>
      </ProfileSection>
    </>
  );
}
