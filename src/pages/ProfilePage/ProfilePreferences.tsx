import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  useGlobalNotificationPreferences,
  useUpdateGlobalNotificationPreferences,
} from '@/hooks/useNotifications';
import {
  useCalendarStatus,
  useConnectCalendar,
  useToggleCalendarSync,
  useDisconnectCalendar,
} from '@/hooks/useCalendar';
import type { GlobalNotificationPreferences } from '@/services/types/notification.types';
import ProfileSection from './ProfileSection';

function HourPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (h: number) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className='rounded-lg border border-[var(--pl-border)] bg-[var(--pl-bg)] text-[13px] px-2.5 py-1.5 text-[var(--pl-text)] outline-none focus:border-[var(--pl-accent)] disabled:opacity-50'
    >
      {Array.from({ length: 24 }, (_, h) => (
        <option key={h} value={h}>
          {String(h).padStart(2, '0')}:00
        </option>
      ))}
    </select>
  );
}

function ToggleRow({
  label,
  desc,
  checked,
  disabled,
  onChange,
  children,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className='py-3.5 border-t border-[var(--pl-border)]'>
      <div className='flex justify-between items-center'>
        <div>
          <div className='text-[14px] font-medium text-[var(--pl-text)]'>
            {label}
          </div>
          <div className='text-[12.5px] mt-0.5 text-[var(--pl-text-muted)]'>
            {desc}
          </div>
        </div>
        <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
      </div>
      {children}
    </div>
  );
}

function TimePickerRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  onChange: (h: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className='flex items-center justify-between mt-2.5 pl-1'>
      <span className='text-[12.5px] text-[var(--pl-text-muted)]'>{label}</span>
      <HourPicker value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function NotificationPreferencesSection() {
  const { t } = useTranslation();
  const { data: prefs } = useGlobalNotificationPreferences();
  const update = useUpdateGlobalNotificationPreferences();

  const p = (key: keyof GlobalNotificationPreferences) =>
    prefs?.[key] as never;

  const send = (partial: Partial<GlobalNotificationPreferences>) =>
    update.mutate(partial);

  const dueCardReminderEnabled = p('dueCardReminderEnabled') ?? true;
  const dailyTodoReminderEnabled = p('dailyTodoReminderEnabled') ?? true;
  const dailyTodoReminderHour = (prefs?.dailyTodoReminderHour ?? 20) as number;
  const weeklyTodoReminderEnabled = p('weeklyTodoReminderEnabled') ?? true;
  const weeklyTodoReminderHour = (prefs?.weeklyTodoReminderHour ?? 20) as number;
  const goalDeadlineReminderEnabled = p('goalDeadlineReminderEnabled') ?? true;
  const goalInactiveReminderEnabled = p('goalInactiveReminderEnabled') ?? true;
  const goalReminderHour = (prefs?.goalReminderHour ?? 9) as number;
  const systemAnnouncementEnabled = p('systemAnnouncementEnabled') ?? true;
  const accountActivityEnabled = p('accountActivityEnabled') ?? true;

  const busy = update.isPending;

  return (
    <ProfileSection
      title={t('profile.preferences.notifications.title')}
      sub={t('profile.preferences.notifications.sub')}
    >
      <div className='flex flex-col'>
        {/* Flashcard */}
        <div className='mb-1'>
          <div className='text-[10.5px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
            {t('notifPrefs.group.flashcard')}
          </div>
        </div>
        <ToggleRow
          label={t('notifPrefs.dueCard.label')}
          desc={t('notifPrefs.dueCard.desc')}
          checked={dueCardReminderEnabled}
          disabled={busy}
          onChange={(v) => send({ dueCardReminderEnabled: v })}
        />

        {/* Daily Tasks */}
        <div className='mt-4 mb-1'>
          <div className='text-[10.5px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
            {t('notifPrefs.group.dailyTasks')}
          </div>
        </div>
        <ToggleRow
          label={t('notifPrefs.dailyTodo.label')}
          desc={t('notifPrefs.dailyTodo.desc')}
          checked={dailyTodoReminderEnabled}
          disabled={busy}
          onChange={(v) => send({ dailyTodoReminderEnabled: v })}
        >
          {dailyTodoReminderEnabled && (
            <TimePickerRow
              label={t('notifPrefs.remindAt')}
              value={dailyTodoReminderHour}
              onChange={(h) => send({ dailyTodoReminderHour: h })}
              disabled={busy}
            />
          )}
        </ToggleRow>

        {/* Weekly Tasks */}
        <div className='mt-4 mb-1'>
          <div className='text-[10.5px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
            {t('notifPrefs.group.weeklyTasks')}
          </div>
        </div>
        <ToggleRow
          label={t('notifPrefs.weeklyTodo.label')}
          desc={t('notifPrefs.weeklyTodo.desc')}
          checked={weeklyTodoReminderEnabled}
          disabled={busy}
          onChange={(v) => send({ weeklyTodoReminderEnabled: v })}
        >
          {weeklyTodoReminderEnabled && (
            <TimePickerRow
              label={t('notifPrefs.remindAtSunday')}
              value={weeklyTodoReminderHour}
              onChange={(h) => send({ weeklyTodoReminderHour: h })}
              disabled={busy}
            />
          )}
        </ToggleRow>

        {/* Goals */}
        <div className='mt-4 mb-1'>
          <div className='text-[10.5px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
            {t('notifPrefs.group.goals')}
          </div>
        </div>
        <ToggleRow
          label={t('notifPrefs.goalDeadline.label')}
          desc={t('notifPrefs.goalDeadline.desc')}
          checked={goalDeadlineReminderEnabled}
          disabled={busy}
          onChange={(v) => send({ goalDeadlineReminderEnabled: v })}
        />
        <ToggleRow
          label={t('notifPrefs.goalInactive.label')}
          desc={t('notifPrefs.goalInactive.desc')}
          checked={goalInactiveReminderEnabled}
          disabled={busy}
          onChange={(v) => send({ goalInactiveReminderEnabled: v })}
        />
        {(goalDeadlineReminderEnabled || goalInactiveReminderEnabled) && (
          <TimePickerRow
            label={t('notifPrefs.remindAt')}
            value={goalReminderHour}
            onChange={(h) => send({ goalReminderHour: h })}
            disabled={busy}
          />
        )}

        {/* System */}
        <div className='mt-4 mb-1'>
          <div className='text-[10.5px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
            {t('notifPrefs.group.system')}
          </div>
        </div>
        <ToggleRow
          label={t('notifPrefs.systemAnnouncement.label')}
          desc={t('notifPrefs.systemAnnouncement.desc')}
          checked={systemAnnouncementEnabled}
          disabled={busy}
          onChange={(v) => send({ systemAnnouncementEnabled: v })}
        />
        <ToggleRow
          label={t('notifPrefs.accountActivity.label')}
          desc={t('notifPrefs.accountActivity.desc')}
          checked={accountActivityEnabled}
          disabled={busy}
          onChange={(v) => send({ accountActivityEnabled: v })}
        />
      </div>

      <Alert className='mt-5 border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'>
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

function GoogleCalendarSection() {
  const { t } = useTranslation();
  const { data: calendarStatus, isLoading } = useCalendarStatus();
  const connectCalendar = useConnectCalendar();
  const toggleSync = useToggleCalendarSync();
  const disconnectCalendar = useDisconnectCalendar();

  const connected = calendarStatus?.connected ?? false;
  const syncEnabled = calendarStatus?.syncEnabled ?? false;

  const handleConnect = async () => {
    try {
      const authUrl = await connectCalendar.mutateAsync();
      window.open(authUrl, 'google-calendar-auth', 'width=500,height=600');
    } catch {
      toast.error(t('googleCalendar.toast.connectFailed'));
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectCalendar.mutateAsync();
      toast.success(t('googleCalendar.toast.disconnected'));
    } catch {
      toast.error(t('googleCalendar.toast.disconnectFailed'));
    }
  };

  return (
    <ProfileSection
      title={t('googleCalendar.title')}
      sub={t('googleCalendar.sub')}
    >
      {isLoading ? (
        <div className='py-4 text-[12.5px] text-[var(--pl-text-faint)]'>
          {t('googleCalendar.loading')}
        </div>
      ) : connected ? (
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <span className='w-2 h-2 rounded-full bg-green-500' />
            <span className='text-[13px] text-[var(--pl-text)]'>
              {t('googleCalendar.statusConnected')}
            </span>
          </div>

          <div className='flex justify-between items-center py-3 border-t border-[var(--pl-border)]'>
            <div>
              <div className='text-[14px] font-medium text-[var(--pl-text)]'>
                {t('googleCalendar.syncLabel')}
              </div>
              <div className='text-[12.5px] mt-0.5 text-[var(--pl-text-muted)]'>
                {t('googleCalendar.syncDesc')}
              </div>
            </div>
            <Switch
              checked={syncEnabled}
              disabled={toggleSync.isPending}
              onCheckedChange={(checked) => toggleSync.mutate(checked)}
            />
          </div>

          <div className='pt-2 border-t border-[var(--pl-border)]'>
            <Button
              variant='outline'
              size='sm'
              className='text-destructive border-destructive/30 hover:bg-destructive/10'
              disabled={disconnectCalendar.isPending}
              onClick={handleDisconnect}
            >
              {t('googleCalendar.disconnect')}
            </Button>
          </div>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          <div className='flex items-center gap-2'>
            <span className='w-2 h-2 rounded-full bg-[var(--pl-text-faint)]' />
            <span className='text-[13px] text-[var(--pl-text-muted)]'>
              {t('googleCalendar.statusDisconnected')}
            </span>
          </div>

          <Button
            onClick={handleConnect}
            disabled={connectCalendar.isPending}
            className='w-fit'
          >
            {t('googleCalendar.connect')}
          </Button>
        </div>
      )}
    </ProfileSection>
  );
}

export default function ProfilePreferences() {
  return (
    <>
      <NotificationPreferencesSection />
      <GoogleCalendarSection />
    </>
  );
}
