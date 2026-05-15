import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Camera, Eye, EyeOff, Info, Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAuth, useSetAvatar, useUpdateMe } from '@/hooks/useAuth';
import { useUploadImageFile } from '@/hooks/useImageUpload';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import {
  useGlobalNotificationPreferences,
  useUpdateGlobalNotificationPreferences,
} from '@/hooks/useNotifications';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const languages = ['VI', 'EN'] as const;
const educations = ['HIGH_SCHOOL', 'COLLEGE', 'UNIVERSITY', 'OTHER'] as const;
const hearAppFromOptions = [
  'YOUTUBE',
  'FACEBOOK',
  'TIKTOK',
  'FRIEND',
  'OTHER',
] as const;

const schema = z.object({
  firstName: z.string().min(1, 'Vui lòng nhập tên').max(50, 'Tối đa 50 ký tự'),
  lastName: z.string().min(1, 'Vui lòng nhập họ').max(50, 'Tối đa 50 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  language: z.string().min(1, 'Vui lòng chọn ngôn ngữ'),
  education: z.string().min(1, 'Vui lòng chọn học vấn'),
  hearAppFrom: z.string().min(1, 'Vui lòng chọn nguồn biết đến'),
  accountType: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
});

type FormData = z.infer<typeof schema>;
type ProfileTab = 'profile' | 'preferences' | 'security' | 'billing';

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <span className='text-[11.5px] tracking-[0.06em] uppercase text-[var(--pl-text-faint)]'>
    {children}
  </span>
);

const FieldHint = ({ children }: { children: React.ReactNode }) => (
  <span className='text-[11.5px] italic font-[var(--font-serif)] text-[var(--pl-text-faint)]'>
    {children}
  </span>
);

const Section = ({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children: React.ReactNode;
}) => (
  <section className='rounded-[16px] mb-5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] p-7'>
    <div className='mb-5'>
      <h3
        className='text-[22px] font-medium tracking-tight m-0 mb-1 text-[var(--pl-text)]'
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h3>
      {sub && (
        <p className='text-[13px] m-0 italic font-[var(--font-serif)] text-[var(--pl-text-muted)]'>
          {sub}
        </p>
      )}
    </div>
    {children}
  </section>
);

const inputCls =
  'w-full rounded-[8px] text-sm outline-none transition-colors bg-[var(--pl-bg)] border border-[var(--pl-border)] text-[var(--pl-text)] focus:border-[var(--pl-accent)] px-3.5 py-[11px]';

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
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // const [weekStart, setWeekStart] = useState<'mon' | 'sun'>('mon');

  // Real global notification preferences (per spec section 3.2.1).
  const { data: globalPrefs } = useGlobalNotificationPreferences();
  const updateGlobalPrefs = useUpdateGlobalNotificationPreferences();

  // UI-side defaults: all three flags default to `true` if missing (per spec).
  const dueCardReminderEnabled = globalPrefs?.dueCardReminderEnabled ?? true;
  const systemAnnouncementEnabled =
    globalPrefs?.systemAnnouncementEnabled ?? true;
  const accountActivityEnabled = globalPrefs?.accountActivityEnabled ?? true;

  const TABS: { id: ProfileTab; label: string }[] = [
    { id: 'profile', label: t('profile.tabs.profile') },
    { id: 'preferences', label: t('profile.tabs.preferences') },
    { id: 'security', label: t('profile.tabs.security') },
    { id: 'billing', label: t('profile.tabs.billing') },
  ];

  type GlobalPrefKey =
    | 'dueCardReminderEnabled'
    | 'systemAnnouncementEnabled'
    | 'accountActivityEnabled';

  const notifOptions: {
    k: GlobalPrefKey;
    value: boolean;
    label: string;
    desc: string;
  }[] = [
    {
      k: 'dueCardReminderEnabled',
      value: dueCardReminderEnabled,
      label: t('profile.preferences.notifications.dueCardReminder', {
        defaultValue: 'Due-card reminders',
      }),
      desc: t('profile.preferences.notifications.dueCardReminderDesc', {
        defaultValue:
          'Get notified when flashcards become due for spaced-repetition review.',
      }),
    },
    {
      k: 'systemAnnouncementEnabled',
      value: systemAnnouncementEnabled,
      label: t('profile.preferences.notifications.systemAnnouncement', {
        defaultValue: 'System announcements',
      }),
      desc: t('profile.preferences.notifications.systemAnnouncementDesc', {
        defaultValue:
          'Updates about new features, maintenance, and important app news.',
      }),
    },
    {
      k: 'accountActivityEnabled',
      value: accountActivityEnabled,
      label: t('profile.preferences.notifications.accountActivity', {
        defaultValue: 'Account activity',
      }),
      desc: t('profile.preferences.notifications.accountActivityDesc', {
        defaultValue:
          'Alerts about new sign-ins, password changes, and security events.',
      }),
    },
  ];

  const billingFeatures = [
    t('profile.billing.features.unlimited'),
    t('profile.billing.features.ai'),
    t('profile.billing.features.sr'),
    t('profile.billing.features.export'),
    t('profile.billing.features.support'),
  ];

  const initial = useMemo(() => user, [user]);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initial?.firstName ?? '',
      lastName: initial?.lastName ?? '',
      email: initial?.email ?? '',
      language: initial?.language ?? 'VI',
      education: initial?.education ?? 'HIGH_SCHOOL',
      hearAppFrom: initial?.hearAppFrom ?? 'OTHER',
      accountType: initial?.accountType ?? 'FREE',
      currentPassword: '',
      newPassword: '',
    },
  });

  const language = watch('language');
  const education = watch('education');
  const hearAppFrom = watch('hearAppFrom');

  useEffect(() => {
    reset({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      language: user?.language ?? 'VI',
      education: user?.education ?? 'HIGH_SCHOOL',
      hearAppFrom: user?.hearAppFrom ?? 'OTHER',
      accountType: user?.accountType ?? 'FREE',
      currentPassword: '',
      newPassword: '',
    });
  }, [reset, user]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const onSubmit = async (data: FormData) => {
    if (!initial) {
      toast.error(t('profile.toast.noUser'));
      return;
    }

    const payload: Record<string, string> = {};

    const maybeSet = (
      k: keyof FormData,
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

  const handleCancel = () => {
    reset({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      language: user?.language ?? 'VI',
      education: user?.education ?? 'HIGH_SCHOOL',
      hearAppFrom: user?.hearAppFrom ?? 'OTHER',
      accountType: user?.accountType ?? 'FREE',
      currentPassword: '',
      newPassword: '',
    });
  };

  const avatarLetters =
    `${(user?.firstName ?? '').charAt(0)}${(user?.lastName ?? '').charAt(0)}`.toUpperCase() ||
    '?';

  return (
    <div className='pt-8 pb-20 mx-auto'>
      {/* Page header */}
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

      {/* Tab bar */}
      <div className='flex gap-1 mb-7 border-b border-[var(--pl-border)]'>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-[13px] transition-all -mb-px border-b-2 ${
              activeTab === tab.id
                ? 'text-[var(--pl-text)] font-medium border-[var(--pl-accent)]'
                : 'text-[var(--pl-text-muted)] font-normal border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Profile tab ── */}
      {activeTab === 'profile' && (
        <>
          <Section
            title={t('profile.basicInfo.title')}
            sub={t('profile.basicInfo.sub')}
          >
            {/* Avatar + identity */}
            <div className='flex gap-7 items-start mb-6 pb-6 border-b border-dashed border-[var(--pl-border)]'>
              <div className='relative flex-shrink-0 group'>
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt='avatar'
                    className='w-24 h-24 rounded-full object-cover'
                  />
                ) : (
                  <div
                    className='w-24 h-24 rounded-full grid place-items-center text-[36px] font-medium bg-[linear-gradient(135deg,_var(--pl-accent),_var(--pl-accent-strong))] text-[var(--pl-accent-fg)]'
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {avatarLetters}
                  </div>
                )}
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
                    onChange={handleAvatarChange}
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

            {/* Form fields */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-[18px]'>
              <label className='flex flex-col gap-1.5'>
                <FieldLabel>{t('profile.basicInfo.firstName')}</FieldLabel>
                <Input
                  disabled={loading}
                  {...register('firstName')}
                  className={inputCls}
                />
                {errors.firstName && (
                  <p className='text-xs text-destructive'>
                    {errors.firstName.message}
                  </p>
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
                  <p className='text-xs text-destructive'>
                    {errors.lastName.message}
                  </p>
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
                  <p className='text-xs text-destructive'>
                    {errors.email.message}
                  </p>
                )}
                <FieldHint>{t('profile.basicInfo.emailHint')}</FieldHint>
              </label>

              <label className='flex flex-col gap-1.5'>
                <FieldLabel>{t('profile.basicInfo.accountType')}</FieldLabel>
                <Input
                  disabled
                  value={watch('accountType') ?? ''}
                  className={
                    inputCls +
                    ' text-[var(--pl-text-faint)] bg-[var(--pl-bg-hover)]'
                  }
                />
                <FieldHint>{t('profile.basicInfo.accountTypeHint')}</FieldHint>
              </label>

              <div className='sm:col-span-2 flex flex-col gap-1.5'>
                <FieldLabel>{t('profile.basicInfo.bio')}</FieldLabel>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  placeholder={t('profile.basicInfo.bioPlaceholder')}
                  className={
                    inputCls +
                    ' resize-y font-[var(--font-serif)] text-[15px] leading-[1.55]'
                  }
                />
              </div>
            </div>
          </Section>

          <Section
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
                      placeholder={t(
                        'profile.learningProfile.languagePlaceholder',
                      )}
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
                <FieldLabel>
                  {t('profile.learningProfile.education')}
                </FieldLabel>
                <Select
                  value={education}
                  onValueChange={(v) =>
                    setValue('education', v, { shouldDirty: true })
                  }
                  disabled={loading}
                >
                  <SelectTrigger className={inputCls + ' cursor-pointer'}>
                    <SelectValue
                      placeholder={t(
                        'profile.learningProfile.educationPlaceholder',
                      )}
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
                <FieldLabel>
                  {t('profile.learningProfile.hearAppFrom')}
                </FieldLabel>
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
          </Section>

          {/* Sticky save bar */}
          <div className='flex justify-end gap-2.5 py-5 sticky bottom-20'>
            <button
              type='button'
              disabled={loading}
              onClick={handleCancel}
              className='inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-full text-[13px] transition-colors border border-[var(--pl-border)] text-[var(--pl-text-muted)]'
            >
              <X className='w-3.5 h-3.5' />
              {t('profile.actions.cancel')}
            </button>
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={loading || !isDirty}
              className='inline-flex items-center gap-1.5 px-[22px] py-2.5 rounded-full text-[13px] font-medium transition-opacity disabled:opacity-50 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'
            >
              <Save className='w-3.5 h-3.5' />
              {loading
                ? t('profile.actions.saving')
                : t('profile.actions.save')}
            </button>
          </div>
        </>
      )}

      {/* ── Preferences tab ── */}
      {activeTab === 'preferences' && (
        <>
          <Section
            title={t('profile.preferences.notifications.title')}
            sub={t('profile.preferences.notifications.sub')}
          >
            <div className='flex flex-col'>
              {notifOptions.map((o) => (
                <label
                  key={o.k}
                  className='flex justify-between items-center py-3.5 cursor-pointer border-t border-[var(--pl-border)]'
                >
                  <div>
                    <div className='text-[14px] font-medium text-[var(--pl-text)]'>
                      {o.label}
                    </div>
                    <div className='text-[12.5px] mt-0.5 text-[var(--pl-text-muted)]'>
                      {o.desc}
                    </div>
                  </div>
                  <button
                    type='button'
                    disabled={updateGlobalPrefs.isPending}
                    onClick={() =>
                      updateGlobalPrefs.mutate({ [o.k]: !o.value })
                    }
                    className={`relative flex-shrink-0 w-[38px] h-[22px] rounded-full transition-all border disabled:opacity-50 ${
                      o.value
                        ? 'bg-[var(--pl-accent)] border-[var(--pl-accent)]'
                        : 'bg-[var(--pl-bg-hover)] border-[var(--pl-border)]'
                    }`}
                  >
                    <span
                      className={`absolute top-[2px] w-4 h-4 rounded-full transition-all ${
                        o.value
                          ? 'left-[17px] bg-[var(--pl-accent-fg)]'
                          : 'left-[2px] bg-[var(--pl-text-faint)]'
                      }`}
                    />
                  </button>
                </label>
              ))}
            </div>

            {/* Per-set hint banner (mobile shows the same teal info) */}
            <div
              className='mt-5 flex items-start gap-2 rounded-[10px] border px-3.5 py-3 text-[12.5px]'
              style={{
                background: 'var(--pl-accent-soft)',
                borderColor: 'var(--pl-accent-border)',
                color: 'var(--pl-accent-strong)',
              }}
            >
              <Info className='w-4 h-4 mt-0.5 shrink-0' />
              <span>
                {t('profile.preferences.notifications.perSetHint', {
                  defaultValue:
                    "Weekly review reminders can be configured per Set in each Set's notification settings.",
                })}
              </span>
            </div>
          </Section>
        </>
      )}

      {/* ── Security tab ── */}
      {activeTab === 'security' && (
        <>
          <Section
            title={t('profile.security.changePassword.title')}
            sub={t('profile.security.changePassword.sub')}
          >
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-[18px] max-w-[720px]'>
              <label className='flex flex-col gap-1.5'>
                <FieldLabel>
                  {t('profile.security.changePassword.currentPassword')}
                </FieldLabel>
                <div className='relative'>
                  <Input
                    disabled={loading}
                    type={showOldPw ? 'text' : 'password'}
                    {...register('currentPassword')}
                    className={inputCls + ' pr-10'}
                  />
                  <button
                    type='button'
                    onClick={() => setShowOldPw((v) => !v)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'
                  >
                    {showOldPw ? (
                      <EyeOff className='w-3.5 h-3.5' />
                    ) : (
                      <Eye className='w-3.5 h-3.5' />
                    )}
                  </button>
                </div>
              </label>

              <label className='flex flex-col gap-1.5'>
                <FieldLabel>
                  {t('profile.security.changePassword.newPassword')}
                </FieldLabel>
                <div className='relative'>
                  <Input
                    disabled={loading}
                    type={showNewPw ? 'text' : 'password'}
                    {...register('newPassword')}
                    className={inputCls + ' pr-10'}
                  />
                  <button
                    type='button'
                    onClick={() => setShowNewPw((v) => !v)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 text-[var(--pl-text-faint)]'
                  >
                    {showNewPw ? (
                      <EyeOff className='w-3.5 h-3.5' />
                    ) : (
                      <Eye className='w-3.5 h-3.5' />
                    )}
                  </button>
                </div>
              </label>
            </div>

            <div className='flex gap-2.5 mt-5'>
              <button
                onClick={handleSubmit(onSubmit)}
                disabled={loading}
                className='px-[22px] py-2.5 rounded-full text-[13px] font-medium transition-opacity disabled:opacity-50 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'
              >
                {loading
                  ? t('profile.actions.saving')
                  : t('profile.security.changePassword.submit')}
              </button>
            </div>
          </Section>

          <Section
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
              <button className='px-3.5 py-2 rounded-full text-[12px] transition-colors border border-[var(--pl-danger,_oklch(0.65_0.2_25))] text-[var(--pl-danger,_oklch(0.65_0.2_25))]'>
                {t('profile.security.dangerZone.deleteBtn')}
              </button>
            </div>
          </Section>
        </>
      )}

      {/* ── Billing tab ── */}
      {activeTab === 'billing' && (
        <Section
          title={t('profile.billing.title')}
          sub={t('profile.billing.sub', { plan: user?.accountType ?? 'FREE' })}
        >
          <div className='rounded-[14px] mb-6 flex justify-between items-start p-6 bg-[linear-gradient(135deg,_var(--pl-accent-soft),_color-mix(in_oklch,_var(--pl-accent)_6%,_transparent))] border border-[var(--pl-accent-border)]'>
            <div>
              <div className='text-[11px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-accent-strong)]'>
                {user?.accountType ?? 'FREE'} Plan
              </div>
              <div
                className='text-[44px] font-normal tracking-tight leading-none mb-1.5 text-[var(--pl-text)]'
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {user?.accountType === 'FREE'
                  ? t('profile.billing.planFree')
                  : t('profile.billing.planPro')}
              </div>
              <div className='text-[13px] text-[var(--pl-text-muted)]'>
                {user?.accountType === 'FREE'
                  ? t('profile.billing.freeDesc')
                  : t('profile.billing.proDesc')}
              </div>
            </div>
            {user?.accountType === 'FREE' && (
              <button className='px-3.5 py-2.5 rounded-full text-[12.5px] font-medium bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]'>
                {t('profile.billing.upgrade')}
              </button>
            )}
          </div>

          <ul className='m-0 p-0 list-none flex flex-col gap-2.5'>
            {billingFeatures.map((f) => (
              <li
                key={f}
                className='flex items-center gap-2.5 text-[14px] text-[var(--pl-text)]'
              >
                <svg
                  viewBox='0 0 24 24'
                  width={14}
                  height={14}
                  stroke='oklch(0.72 0.15 155)'
                  fill='none'
                  strokeWidth={2.4}
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M20 6L9 17l-5-5' />
                </svg>
                {f}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}
