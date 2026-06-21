import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  useCreateLlmConfig,
  useUpdateLlmConfig,
} from '@/hooks/useLlmConfigs';
import {
  LLM_PROVIDERS,
  type LlmConfig,
  type LlmProvider,
} from '@/services/types/llm-config.types';
import type { ApiErrorResponse } from '@/services/types/auth.types';
import { FieldLabel } from './Section';
import { inputCls } from '../constants';

const PROVIDER_MODELS: Record<LlmProvider, string[]> = {
  openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
  anthropic: ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  google: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.0-flash'],
  groq: ['llama-3.3-70b-versatile', 'mixtral-8x7b-32768'],
};

interface LlmConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the dialog edits this config; otherwise it creates a new one. */
  config?: LlmConfig | null;
  /** True when there are no configs yet — first config is always activated. */
  isFirst?: boolean;
}

export default function LlmConfigDialog({
  open,
  onOpenChange,
  config,
  isFirst,
}: LlmConfigDialogProps) {
  const { t } = useTranslation();
  const create = useCreateLlmConfig();
  const update = useUpdateLlmConfig();
  const isEdit = Boolean(config);

  const [provider, setProvider] = useState<LlmProvider>('openai');
  const [model, setModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [setActive, setSetActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    setProvider(config?.provider ?? 'openai');
    setModel(config?.model ?? '');
    setApiKey('');
    setDisplayName(config?.displayName ?? '');
    setSetActive(config?.active ?? true);
  }, [open, config]);

  const saving = create.isPending || update.isPending;

  const handleSubmit = async () => {
    if (!model.trim()) {
      toast.error(t('llm.dialog.modelRequired'));
      return;
    }
    if (!isEdit && !apiKey.trim()) {
      toast.error(t('llm.dialog.apiKeyRequired'));
      return;
    }

    try {
      if (isEdit && config) {
        await update.mutateAsync({
          id: config.id,
          data: {
            provider,
            model: model.trim(),
            displayName: displayName.trim() || undefined,
            ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
          },
        });
        toast.success(t('llm.dialog.updateSuccess'));
      } else {
        await create.mutateAsync({
          provider,
          model: model.trim(),
          apiKey: apiKey.trim(),
          displayName: displayName.trim() || undefined,
          setActive,
        });
        toast.success(t('llm.dialog.createSuccess'));
      }
      onOpenChange(false);
    } catch (err: unknown) {
      const payloadErr: ApiErrorResponse | undefined = axios.isAxiosError(err)
        ? (err.response?.data as ApiErrorResponse | undefined)
        : undefined;
      toast.error(payloadErr?.message ?? t('llm.dialog.saveFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[460px]'>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t('llm.dialog.editTitle') : t('llm.dialog.addTitle')}
          </DialogTitle>
          <DialogDescription>{t('llm.dialog.sub')}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-4 py-1'>
          <label className='flex flex-col gap-1.5'>
            <FieldLabel>{t('llm.fields.provider')}</FieldLabel>
            <Select
              value={provider}
              onValueChange={(v) => setProvider(v as LlmProvider)}
              disabled={saving}
            >
              <SelectTrigger className={inputCls + ' cursor-pointer'}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LLM_PROVIDERS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {t(`llm.providers.${p}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className='flex flex-col gap-1.5'>
            <FieldLabel>{t('llm.fields.model')}</FieldLabel>
            <Input
              list='llm-model-options'
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={t('llm.fields.modelPlaceholder')}
              disabled={saving}
              maxLength={128}
              className={inputCls}
            />
            <datalist id='llm-model-options'>
              {PROVIDER_MODELS[provider].map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </label>

          <label className='flex flex-col gap-1.5'>
            <FieldLabel>{t('llm.fields.apiKey')}</FieldLabel>
            <Input
              type='password'
              autoComplete='off'
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                isEdit && config
                  ? `${config.apiKeyMasked} · ${t('llm.fields.apiKeyKeep')}`
                  : t('llm.fields.apiKeyPlaceholder')
              }
              disabled={saving}
              maxLength={512}
              className={inputCls}
            />
            {isEdit && (
              <span className='text-[11.5px] italic text-[var(--pl-text-faint)]'>
                {t('llm.fields.apiKeyEditHint')}
              </span>
            )}
          </label>

          <label className='flex flex-col gap-1.5'>
            <FieldLabel>{t('llm.fields.displayName')}</FieldLabel>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={t('llm.fields.displayNamePlaceholder')}
              disabled={saving}
              maxLength={64}
              className={inputCls}
            />
          </label>

          {!isEdit && !isFirst && (
            <div className='flex items-center justify-between pt-1'>
              <div>
                <div className='text-[13.5px] font-medium text-[var(--pl-text)]'>
                  {t('llm.fields.setActive')}
                </div>
                <div className='text-[12px] text-[var(--pl-text-muted)]'>
                  {t('llm.fields.setActiveDesc')}
                </div>
              </div>
              <Switch
                checked={setActive}
                disabled={saving}
                onCheckedChange={setSetActive}
              />
            </div>
          )}

          {!isEdit && isFirst && (
            <p className='text-[12px] italic text-[var(--pl-text-faint)]'>
              {t('llm.fields.firstHint')}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            disabled={saving}
            onClick={() => onOpenChange(false)}
            className='rounded-full text-[13px]'
          >
            {t('llm.actions.cancel')}
          </Button>
          <Button
            type='button'
            disabled={saving}
            onClick={handleSubmit}
            className='rounded-full text-[13px] font-medium'
          >
            {saving ? t('llm.actions.saving') : t('llm.actions.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
