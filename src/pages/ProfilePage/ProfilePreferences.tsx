import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import {
  useGlobalNotificationPreferences,
  useUpdateGlobalNotificationPreferences,
} from '@/hooks/useNotifications';
import ProfileSection from './ProfileSection';

type GlobalPrefKey =
  | 'dueCardReminderEnabled'
  | 'systemAnnouncementEnabled'
  | 'accountActivityEnabled';

export default function ProfilePreferences() {
  const { t } = useTranslation();
  const { data: globalPrefs } = useGlobalNotificationPreferences();
  const updateGlobalPrefs = useUpdateGlobalNotificationPreferences();

  // UI-side defaults: all three flags default to `true` if missing (per spec).
  const dueCardReminderEnabled = globalPrefs?.dueCardReminderEnabled ?? true;
  const systemAnnouncementEnabled =
    globalPrefs?.systemAnnouncementEnabled ?? true;
  const accountActivityEnabled = globalPrefs?.accountActivityEnabled ?? true;

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

  return (
    <ProfileSection
      title={t('profile.preferences.notifications.title')}
      sub={t('profile.preferences.notifications.sub')}
    >
      <div className='flex flex-col'>
        {notifOptions.map((o) => (
          <div
            key={o.k}
            className='flex justify-between items-center py-3.5 border-t border-[var(--pl-border)]'
          >
            <div>
              <div className='text-[14px] font-medium text-[var(--pl-text)]'>
                {o.label}
              </div>
              <div className='text-[12.5px] mt-0.5 text-[var(--pl-text-muted)]'>
                {o.desc}
              </div>
            </div>
            <Switch
              checked={o.value}
              disabled={updateGlobalPrefs.isPending}
              onCheckedChange={(checked) =>
                updateGlobalPrefs.mutate({ [o.k]: checked })
              }
            />
          </div>
        ))}
      </div>

      <Alert
        className='mt-5 border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
      >
        <Info className='w-4 h-4' />
        <AlertDescription className='text-[12.5px] text-[var(--pl-accent-strong)]'>
          {t('profile.preferences.notifications.perSetHint', {
            defaultValue:
              "Weekly review reminders can be configured per Set in each Set's notification settings.",
          })}
        </AlertDescription>
      </Alert>
    </ProfileSection>
  );
}
