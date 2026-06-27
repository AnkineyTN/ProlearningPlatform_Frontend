import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Check, Infinity, Loader2, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
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
import {
  useDeleteLlmConfig,
  useLlmConfigs,
  useSetActiveLlmConfig,
} from '@/hooks/useLlmConfigs';
import { useAiUsage } from '@/hooks/useAiUsage';
import type { LlmConfig } from '@/services/types/llm-config.types';
import type { AiUsageSlot } from '@/services/types/ai-usage.types';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import ProfileSection from './Section';
import LlmConfigDialog from './LlmConfigDialog';

function formatResetTime(seconds: number): string {
  if (seconds <= 0) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function UsageBar({
  label,
  slot,
}: {
  label: string;
  slot: AiUsageSlot;
}) {
  const { t } = useTranslation();
  const isUnlimited = slot.limit === -1;
  const pct = isUnlimited ? 0 : Math.min(100, (slot.used / slot.limit) * 100);
  const resetTime = formatResetTime(slot.resetTimeSeconds);

  return (
    <div className='mb-4 last:mb-0'>
      <div className='flex items-center justify-between mb-1.5'>
        <span className='text-[12.5px] font-medium text-[var(--pl-text)]'>
          {label}
        </span>
        <span className='text-[12px] text-[var(--pl-text-muted)]'>
          {isUnlimited
            ? t('aiUsage.unlimited')
            : t('aiUsage.used', { used: slot.used, limit: slot.limit })}
        </span>
      </div>
      {!isUnlimited && (
        <div className='h-1.5 rounded-full bg-[var(--pl-bg-hover)] overflow-hidden'>
          <div
            className='h-full rounded-full transition-all bg-[var(--pl-accent)]'
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
      {!isUnlimited && resetTime && (
        <p className='mt-1 text-[11px] text-[var(--pl-text-faint)]'>
          {t('aiUsage.resets', { time: resetTime })}
        </p>
      )}
    </div>
  );
}

function AiUsageSection() {
  const { t } = useTranslation();
  const { data, isLoading } = useAiUsage();

  return (
    <ProfileSection title={t('aiUsage.title')} sub={t('aiUsage.sub')}>
      {isLoading ? (
        <div className='flex items-center gap-2 py-4 text-[var(--pl-text-muted)]'>
          <Loader2 className='w-4 h-4 animate-spin' />
          <span className='text-sm'>{t('aiUsage.loading')}</span>
        </div>
      ) : data?.byokActive ? (
        <div className='flex items-center gap-2.5 rounded-[12px] border border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] px-4 py-3'>
          <Infinity className='w-4 h-4 shrink-0 text-[var(--pl-accent)]' />
          <span className='text-[13px] text-[var(--pl-accent-strong)]'>
            {t('aiUsage.byok')}
          </span>
        </div>
      ) : data ? (
        <>
          <UsageBar label={t('aiUsage.generation')} slot={data.generation} />
          <UsageBar label={t('aiUsage.interactive')} slot={data.interactive} />
        </>
      ) : null}
    </ProfileSection>
  );
}

function errMessage(err: unknown, fallback: string) {
  const payload: ApiErrorResponse | undefined = axios.isAxiosError(err)
    ? (err.response?.data as ApiErrorResponse | undefined)
    : undefined;
  return payload?.message ?? fallback;
}

function ConfigRow({
  config,
  onEdit,
}: {
  config: LlmConfig;
  onEdit: (config: LlmConfig) => void;
}) {
  const { t } = useTranslation();
  const setActive = useSetActiveLlmConfig();
  const remove = useDeleteLlmConfig();

  const handleSetActive = async () => {
    try {
      await setActive.mutateAsync(config.id);
      toast.success(t('llm.toast.activated'));
    } catch (err) {
      toast.error(errMessage(err, t('llm.toast.activateFailed')));
    }
  };

  const handleDelete = async () => {
    try {
      await remove.mutateAsync(config.id);
      toast.success(t('llm.toast.deleted'));
    } catch (err) {
      toast.error(errMessage(err, t('llm.toast.deleteFailed')));
    }
  };

  return (
    <div className='flex items-center gap-4 py-4 border-t border-[var(--pl-border)]'>
      <div className='w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-[var(--pl-accent-soft)]'>
        <Sparkles className='w-4 h-4 text-[var(--pl-accent)]' />
      </div>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-2 flex-wrap'>
          <span className='text-[14px] font-medium text-[var(--pl-text)] truncate'>
            {config.displayName || t(`llm.providers.${config.provider}`)}
          </span>
          {config.active && (
            <span className='inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full border border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] tracking-[0.06em] uppercase'>
              <Check className='w-3 h-3' />
              {t('llm.active')}
            </span>
          )}
        </div>
        <div className='text-[12.5px] mt-0.5 text-[var(--pl-text-muted)] truncate'>
          {t(`llm.providers.${config.provider}`)} · {config.model} ·{' '}
          <span className='font-[family-name:var(--font-mono-pl)]'>
            {config.apiKeyMasked}
          </span>
        </div>
      </div>

      <div className='flex items-center gap-1.5 flex-shrink-0'>
        {!config.active && (
          <Button
            type='button'
            variant='outline'
            size='sm'
            disabled={setActive.isPending}
            onClick={handleSetActive}
            className='rounded-full text-[12px]'
          >
            {setActive.isPending ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              t('llm.setActive')
            )}
          </Button>
        )}
        <Button
          type='button'
          variant='ghost'
          size='icon'
          onClick={() => onEdit(config)}
          title={t('llm.actions.edit')}
          className='h-8 w-8 text-[var(--pl-text-muted)]'
        >
          <Pencil className='w-4 h-4' />
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              disabled={remove.isPending}
              title={t('llm.actions.delete')}
              className='h-8 w-8 text-[var(--pl-danger-text)] hover:bg-[var(--pl-danger-soft)] hover:text-[var(--pl-danger-text)]'
            >
              <Trash2 className='w-4 h-4' />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('llm.delete.title')}</AlertDialogTitle>
              <AlertDialogDescription>
                {config.active
                  ? t('llm.delete.descActive')
                  : t('llm.delete.desc')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('llm.actions.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className='bg-[var(--pl-danger)] text-white hover:bg-[var(--pl-danger)]/90'
              >
                {t('llm.delete.confirm')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function ProfileAiProvider() {
  const { t } = useTranslation();
  const { data: configs, isLoading } = useLlmConfigs();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<LlmConfig | null>(null);

  const list = configs ?? [];
  const hasActive = list.some((c) => c.active);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };

  const openEdit = (config: LlmConfig) => {
    setEditing(config);
    setDialogOpen(true);
  };

  return (
    <>
      <AiUsageSection />
      <ProfileSection title={t('llm.title')} sub={t('llm.sub')}>
        {!hasActive && !isLoading && (
          <div className='flex items-start gap-2 mb-1 rounded-[12px] border border-[var(--pl-warning-border)] bg-[var(--pl-warning-soft)] px-3.5 py-2.5 text-[12.5px] text-[var(--pl-warning-text)]'>
            {t('llm.noActiveWarning')}
          </div>
        )}

        {isLoading ? (
          <div className='flex items-center gap-2 py-6 text-[var(--pl-text-muted)]'>
            <Loader2 className='w-4 h-4 animate-spin' />
            <span className='text-sm'>{t('llm.loading')}</span>
          </div>
        ) : list.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-12 text-center'>
            <div className='w-16 h-16 rounded-[18px] grid place-items-center mb-4 bg-[var(--pl-accent-soft)]'>
              <Sparkles size={28} className='text-[var(--pl-accent)]' />
            </div>
            <h3 className='text-[17px] font-medium mb-1.5 text-[var(--pl-text)]'>
              {t('llm.empty.title')}
            </h3>
            <p className='text-[13px] text-[var(--pl-text-muted)] mb-5 max-w-[360px]'>
              {t('llm.empty.desc')}
            </p>
            <Button
              type='button'
              onClick={openCreate}
              className='rounded-full text-[13px] font-medium'
            >
              <Plus className='w-4 h-4' />
              {t('llm.empty.cta')}
            </Button>
          </div>
        ) : (
          <>
            <div className='flex flex-col'>
              {list.map((config) => (
                <ConfigRow key={config.id} config={config} onEdit={openEdit} />
              ))}
            </div>
            <div className='pt-4 mt-1 border-t border-[var(--pl-border)]'>
              <Button
                type='button'
                variant='outline'
                onClick={openCreate}
                className='rounded-full text-[13px]'
              >
                <Plus className='w-4 h-4' />
                {t('llm.addConfig')}
              </Button>
            </div>
          </>
        )}
      </ProfileSection>

      <LlmConfigDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        config={editing}
        isFirst={list.length === 0}
      />
    </>
  );
}
