import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import type { UseFormRegister } from 'react-hook-form';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useDeleteMe, useLogout } from '@/hooks/useAuth';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import PasswordField from './PasswordField';
import ProfileSection from './Section';
import type { ProfileFormData } from '../constants';

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
  const navigate = useNavigate();
  const deleteMe = useDeleteMe();
  const logout = useLogout();
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteMe.mutateAsync();
      toast.success(t('profile.security.dangerZone.deleteSuccess'));
      logout();
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const payloadErr: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;
      toast.error(
        payloadErr?.message ?? t('profile.security.dangerZone.deleteFailed'),
      );
    } finally {
      setDeleting(false);
    }
  };

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
            <div className='text-[14px] font-medium text-[var(--pl-danger)]'>
              {t('profile.security.dangerZone.deleteAccount')}
            </div>
            <div className='text-[12.5px] mt-0.5 text-[var(--pl-text-muted)]'>
              {t('profile.security.dangerZone.deleteDesc')}
            </div>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type='button'
                variant='outline'
                disabled={deleting}
                className='rounded-full text-[12px] border-[var(--pl-danger-border)] text-[var(--pl-danger-text)] hover:bg-[var(--pl-danger-soft)] hover:text-[var(--pl-danger-text)]'
              >
                {deleting
                  ? t('profile.security.dangerZone.deleting')
                  : t('profile.security.dangerZone.deleteBtn')}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t('profile.security.dangerZone.confirmTitle')}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t('profile.security.dangerZone.confirmDesc')}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>
                  {t('profile.security.dangerZone.confirmCancel')}
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteAccount}
                  className='bg-[var(--pl-danger)] text-white hover:bg-[var(--pl-danger)]/90'
                >
                  {t('profile.security.dangerZone.confirmAction')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </ProfileSection>
    </>
  );
}
