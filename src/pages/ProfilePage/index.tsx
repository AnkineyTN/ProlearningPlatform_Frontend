import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { useTranslation } from 'react-i18next';

import { useAuth, useSetAvatar, useUpdateMe } from '@/hooks/useAuth';
import { useUploadImageFile } from '@/hooks/useImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  isProfileTab,
  profileSchema,
  type ProfileFormData,
  type ProfileTab,
} from './constants';
import ProfileAiProvider from './components/AiProvider';
import ProfileBasicInfo from './components/BasicInfo';
import ProfileBilling from './components/Billing';
import ProfileLearningInfo from './components/LearningInfo';
import ProfilePreferences from './components/Preferences';
import ProfileSaveBar from './components/SaveBar';
import ProfileSecurity from './components/Security';

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
  const [searchParams, setSearchParams] = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab: ProfileTab = isProfileTab(tabParam) ? tabParam : 'profile';
  const setActiveTab = (tab: ProfileTab) =>
    setSearchParams(tab === 'profile' ? {} : { tab }, { replace: true });

  const initialRef = useRef(user);
  if (!initialRef.current && user) initialRef.current = user;
  const initial = initialRef.current;

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const uploaded = await uploadImage.mutateAsync(file);
      await setAvatar.mutateAsync(uploaded.assetId);
      toast.success(t('profile.avatar.success'));
    } catch (error) {
      toast.error(apiErrorMessage(error, t('profile.avatar.error')));
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
      toast.error(apiErrorMessage(err, t('profile.toast.updateFailed')));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => reset(buildDefaults(user));

  const tabs: { id: ProfileTab; label: string }[] = [
    { id: 'profile', label: t('profile.tabs.profile') },
    { id: 'preferences', label: t('profile.tabs.preferences') },
    { id: 'ai', label: t('profile.tabs.ai') },
    { id: 'security', label: t('profile.tabs.security') },
    { id: 'billing', label: t('profile.tabs.billing') },
  ];

  return (
    <div className='w-2xl pt-8 pb-20 mx-auto'>
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
        <p className='text-[17px] italic m-0 font-serif text-[var(--pl-text-muted)]'>
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
            errors={errors}
            loading={loading}
            avatarUploading={avatarUploading}
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

        <TabsContent value='ai'>
          <ProfileAiProvider />
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
