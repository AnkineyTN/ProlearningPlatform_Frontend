import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';

import { useAuth, useSetAvatar, useUpdateMe } from '@/hooks/useAuth';
import { useUploadImageFile } from '@/hooks/useImageUpload';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  profileSchema,
  type ProfileFormData,
  type ProfileTab,
} from './constants';
import ProfileBasicInfo from './ProfileBasicInfo';
import ProfileBilling from './ProfileBilling';
import ProfileLearningInfo from './ProfileLearningInfo';
import ProfilePreferences from './ProfilePreferences';
import ProfileSaveBar from './ProfileSaveBar';
import ProfileSecurity from './ProfileSecurity';

function buildDefaults(
  user: ReturnType<typeof useAuth>['user'],
): ProfileFormData {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    language: user?.language ?? 'VI',
    education: user?.education ?? 'HIGH_SCHOOL',
    hearAppFrom: user?.hearAppFrom ?? 'OTHER',
    accountType: user?.accountType ?? 'FREE',
    currentPassword: '',
    newPassword: '',
  };
}

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const updateMe = useUpdateMe();
  const setAvatar = useSetAvatar();
  const uploadImage = useUploadImageFile();
  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [bio, setBio] = useState('');

  const initial = useMemo(() => user, [user]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: buildDefaults(initial),
  });

  useEffect(() => {
    reset(buildDefaults(user));
  }, [reset, user]);

  const handleAvatarChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const uploaded = await uploadImage.mutateAsync(file);
      await setAvatar.mutateAsync(uploaded.assetId);
      toast.success(t('profile.avatar.success'));
    } catch {
      toast.error(t('profile.avatar.error'));
    } finally {
      setAvatarUploading(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    if (!initial) {
      toast.error(t('profile.toast.noUser'));
      return;
    }

    const payload: Record<string, string> = {};

    const maybeSet = (
      k: keyof ProfileFormData,
      v: string | undefined,
      oldV: string | undefined,
    ) => {
      if (typeof v !== 'string') return;
      const trimmed = v.trim();
      if (!trimmed) return;
      if ((oldV ?? '').trim() === trimmed) return;
      payload[k as string] = trimmed;
    };

    maybeSet('firstName', data.firstName, initial.firstName);
    maybeSet('lastName', data.lastName, initial.lastName);
    maybeSet('email', data.email, initial.email);
    maybeSet('language', data.language, initial.language);
    maybeSet('education', data.education, initial.education);
    maybeSet('hearAppFrom', data.hearAppFrom, initial.hearAppFrom);

    const newPassword = (data.newPassword ?? '').trim();
    const currentPassword = (data.currentPassword ?? '').trim();

    if (newPassword) {
      payload.newPassword = newPassword;
      if (currentPassword) payload.currentPassword = currentPassword;
    }

    if (Object.keys(payload).length === 0) {
      toast.info(t('profile.toast.noChanges'));
      return;
    }

    setLoading(true);
    try {
      const res = await updateMe.mutateAsync(payload);
      toast.success(res.message ?? t('profile.toast.updateSuccess'));
      setValue('currentPassword', '');
      setValue('newPassword', '');
    } catch (err: unknown) {
      const payloadErr: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;
      toast.error(payloadErr?.message ?? t('profile.toast.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => reset(buildDefaults(user));

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'profile', label: t('profile.tabs.profile') },
    { id: 'preferences', label: t('profile.tabs.preferences') },
    { id: 'security', label: t('profile.tabs.security') },
    { id: 'billing', label: t('profile.tabs.billing') },
  ];

  return (
    <div className='pt-8 pb-20 mx-auto'>
      <div className='mb-8'>
        <div className='text-[11px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]'>
          {t('profile.breadcrumb')}
        </div>
        <h1
          className='text-[44px] tracking-tight leading-[1.05] m-0 mb-1.5 text-[var(--pl-text)]'
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('profile.title')}
        </h1>
        <p className='text-[17px] italic m-0 font-[var(--font-serif)] text-[var(--pl-text-muted)]'>
          {t('profile.subtitle')}
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as ProfileTab)}
      >
        <TabsList className='h-auto w-full justify-start gap-1 bg-transparent p-0 mb-7 rounded-none border-b border-[var(--pl-border)]'>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className='px-4 py-3 text-[13px] rounded-none border-0 border-b-2 border-transparent bg-transparent shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-[var(--pl-accent)] data-[state=active]:text-[var(--pl-text)] data-[state=active]:font-medium text-[var(--pl-text-muted)] font-normal -mb-px'
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value='profile'>
          <ProfileBasicInfo
            user={user}
            register={register}
            watch={watch}
            errors={errors}
            loading={loading}
            avatarUploading={avatarUploading}
            bio={bio}
            onBioChange={setBio}
            onAvatarChange={handleAvatarChange}
          />
          <ProfileLearningInfo
            watch={watch}
            setValue={setValue}
            errors={errors}
            loading={loading}
          />
          <ProfileSaveBar
            loading={loading}
            isDirty={isDirty}
            onCancel={handleCancel}
            onSave={handleSubmit(onSubmit)}
          />
        </TabsContent>

        <TabsContent value='preferences'>
          <ProfilePreferences />
        </TabsContent>

        <TabsContent value='security'>
          <ProfileSecurity
            register={register}
            loading={loading}
            onSubmit={handleSubmit(onSubmit)}
          />
        </TabsContent>

        <TabsContent value='billing'>
          <ProfileBilling user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
