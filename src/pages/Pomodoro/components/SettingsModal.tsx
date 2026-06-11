import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { PomodoroSetting } from '@/services/types/pomodoro.types';
import { DURATION_LIMITS } from '../constants';
import type {
  PomodoroUiPrefs,
  ProgressStyle,
  StatsTimeFormat,
} from '../useUiPrefs';

interface Props {
  open: boolean;
  setting: PomodoroSetting;
  uiPrefs: PomodoroUiPrefs;
  onClose: () => void;
  onSave: (next: PomodoroSetting) => Promise<void> | void;
  onSaveUiPrefs: (next: PomodoroUiPrefs) => void;
  saving?: boolean;
}

const minutesField = (seconds: number) => Math.round(seconds / 60);

const SettingsModal = ({
  open,
  setting,
  uiPrefs,
  onClose,
  onSave,
  onSaveUiPrefs,
  saving,
}: Props) => {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<PomodoroSetting>(setting);
  const [uiDraft, setUiDraft] = useState<PomodoroUiPrefs>(uiPrefs);

  useEffect(() => {
    if (open) {
      setDraft(setting);
      setUiDraft(uiPrefs);
    }
  }, [open, setting, uiPrefs]);

  const setMinutes = (
    key: 'pomodoroDuration' | 'shortBreak' | 'longBreak',
    minutes: number,
  ) => {
    const seconds = Math.round(minutes * 60);
    setDraft({ ...draft, [key]: seconds });
  };

  const handleSave = async () => {
    const limits = DURATION_LIMITS;
    const checks: {
      key: keyof PomodoroSetting;
      value: number;
      min: number;
      max: number;
    }[] = [
      {
        key: 'pomodoroDuration',
        value: draft.pomodoroDuration,
        ...limits.pomodoroDuration,
      },
      { key: 'shortBreak', value: draft.shortBreak, ...limits.shortBreak },
      { key: 'longBreak', value: draft.longBreak, ...limits.longBreak },
      {
        key: 'longBreakInterval',
        value: draft.longBreakInterval,
        ...limits.longBreakInterval,
      },
    ];
    for (const c of checks) {
      if (c.value < c.min || c.value > c.max) {
        toast.error(t('pomodoro.settings.invalid'));
        return;
      }
    }
    onSaveUiPrefs(uiDraft);
    await onSave(draft);
    onClose();
  };

  const progressOptions: { value: ProgressStyle; label: string }[] = [
    { value: 'ring', label: t('pomodoro.settings.progressRing') },
    { value: 'bar', label: t('pomodoro.settings.progressBar') },
    { value: 'none', label: t('pomodoro.settings.progressNone') },
  ];

  const formatOptions: { value: StatsTimeFormat; label: string }[] = [
    { value: 'minutes', label: '125m' },
    { value: 'compact', label: '2h 5m' },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: 'var(--font-display)',
            }}
          >
            {t('pomodoro.settings.title')}
          </DialogTitle>
        </DialogHeader>

        <div className='grid grid-cols-3 gap-3'>
          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>{t('pomodoro.settings.focus')}</Label>
            <Input
              type='number'
              min={1}
              max={120}
              value={minutesField(draft.pomodoroDuration)}
              onChange={(e) =>
                setMinutes('pomodoroDuration', Number(e.target.value))
              }
            />
            <span className='text-[10px] text-[var(--pl-text-faint)]'>
              {t('pomodoro.settings.minutes')}
            </span>
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>{t('pomodoro.settings.short')}</Label>
            <Input
              type='number'
              min={1}
              max={60}
              value={minutesField(draft.shortBreak)}
              onChange={(e) => setMinutes('shortBreak', Number(e.target.value))}
            />
            <span className='text-[10px] text-[var(--pl-text-faint)]'>
              {t('pomodoro.settings.minutes')}
            </span>
          </div>
          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>{t('pomodoro.settings.long')}</Label>
            <Input
              type='number'
              min={1}
              max={60}
              value={minutesField(draft.longBreak)}
              onChange={(e) => setMinutes('longBreak', Number(e.target.value))}
            />
            <span className='text-[10px] text-[var(--pl-text-faint)]'>
              {t('pomodoro.settings.minutes')}
            </span>
          </div>
        </div>

        <div className='flex flex-col gap-1'>
          <Label className='text-xs'>
            {t('pomodoro.settings.longBreakInterval')}
          </Label>
          <Input
            type='number'
            min={1}
            max={10}
            value={draft.longBreakInterval}
            onChange={(e) =>
              setDraft({ ...draft, longBreakInterval: Number(e.target.value) })
            }
          />
          <span className='text-[10px] text-[var(--pl-text-faint)]'>
            {t('pomodoro.settings.intervalHint')}
          </span>
        </div>

        <div className='flex items-center justify-between'>
          <Label className='text-sm'>
            {t('pomodoro.settings.autoStartBreak')}
          </Label>
          <Switch
            checked={draft.autoStartBreak}
            onCheckedChange={(v) => setDraft({ ...draft, autoStartBreak: v })}
          />
        </div>

        <div className='flex items-center justify-between'>
          <Label className='text-sm'>
            {t('pomodoro.settings.autoStartPomodoro')}
          </Label>
          <Switch
            checked={draft.autoStartPomodoro}
            onCheckedChange={(v) =>
              setDraft({ ...draft, autoStartPomodoro: v })
            }
          />
        </div>

        <div className='border-t border-[var(--pl-border)] pt-4 flex flex-col gap-3'>
          <p className='text-xs font-medium uppercase tracking-wide text-[var(--pl-text-faint)]'>
            {t('pomodoro.settings.display')}
          </p>

          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>
              {t('pomodoro.settings.progressStyle')}
            </Label>
            <Segmented
              value={uiDraft.progressStyle}
              options={progressOptions}
              onChange={(v) => setUiDraft({ ...uiDraft, progressStyle: v })}
            />
          </div>

          <div className='flex flex-col gap-1'>
            <Label className='text-xs'>
              {t('pomodoro.settings.statsFormat')}
            </Label>
            <Segmented
              value={uiDraft.statsTimeFormat}
              options={formatOptions}
              onChange={(v) => setUiDraft({ ...uiDraft, statsTimeFormat: v })}
            />
          </div>
        </div>

        <div className='flex justify-end gap-2 pt-2'>
          <Button variant='ghost' onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const Segmented = <T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) => (
  <div className='flex gap-1 p-1 rounded-lg bg-[var(--pl-bg-hover)]'>
    {options.map((o) => (
      <button
        key={o.value}
        type='button'
        onClick={() => onChange(o.value)}
        className={cn(
          'flex-1 text-xs font-medium py-1.5 rounded-md transition-all cursor-pointer',
          value === o.value
            ? 'bg-[var(--pl-bg)] text-[var(--pl-text)] border border-[var(--pl-border)] shadow-sm'
            : 'text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]',
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export default SettingsModal;
