import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type AdminCreateFromUrlRequest } from '@/services/endpoints/adminPomodoro';
import { useUploadPomodoroAsset } from '@/hooks/usePomodoro';
import { ACCEPT_MAP } from '../../constants';

type Props = {
  onUrlSubmit: (data: AdminCreateFromUrlRequest) => void;
  onFileSubmit: (data: {
    name: string;
    description?: string;
    assetId: number;
    assetType: string;
  }) => void;
  isUrlPending: boolean;
  isFilePending: boolean;
  assetTypes: readonly string[];
  onCancel: () => void;
};

const CreateForm = ({
  onUrlSubmit,
  onFileSubmit,
  isUrlPending,
  isFilePending,
  assetTypes,
  onCancel,
}: Props) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'url' | 'file'>('url');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [assetType, setAssetType] = useState(assetTypes[0]);
  const [file, setFile] = useState<File | null>(null);
  const uploadAsset = useUploadPomodoroAsset();

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onUrlSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      url: url.trim(),
      assetType: assetType as AdminCreateFromUrlRequest['assetType'],
    });
  };

  const handleFileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !file) return;
    try {
      const result = await uploadAsset.mutateAsync({
        file,
        type: assetType as 'IMAGE' | 'VIDEO' | 'AUDIO',
      });
      onFileSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        assetId: result.assetId,
        assetType: assetType as AdminCreateFromUrlRequest['assetType'],
      });
    } catch {
      toast.error(t('adminDashboard.pomodoroUploadError'));
    }
  };

  const isPending =
    mode === 'url' ? isUrlPending : isFilePending || uploadAsset.isPending;

  return (
    <form
      onSubmit={mode === 'url' ? handleUrlSubmit : handleFileSubmit}
      className='rounded-[14px] border border-border bg-[var(--pl-bg-elev)] p-5 space-y-3'
    >
      <div className='flex items-center gap-2'>
        {(['url', 'file'] as const).map((m) => (
          <button
            key={m}
            type='button'
            onClick={() => setMode(m)}
            className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-colors ${
              mode === m
                ? 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] border-[var(--pl-accent-border)]'
                : 'border-border text-muted-foreground'
            }`}
          >
            {m === 'url'
              ? t('adminDashboard.pomodoroModeUrl')
              : t('adminDashboard.pomodoroModeFile')}
          </button>
        ))}
      </div>

      <Input
        placeholder={t('adminDashboard.pomodoroName')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        placeholder={t('adminDashboard.pomodoroDescription')}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {assetTypes.length > 1 && (
        <div className='flex gap-2'>
          {assetTypes.map((type) => (
            <button
              key={type}
              type='button'
              onClick={() => {
                setAssetType(type);
                setFile(null);
              }}
              className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-colors ${
                assetType === type
                  ? 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] border-[var(--pl-accent-border)]'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      {mode === 'url' ? (
        <Input
          placeholder='URL'
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
      ) : (
        <label className='flex items-center gap-2 cursor-pointer rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:border-[var(--pl-accent)] hover:bg-[var(--pl-accent-soft)] transition-colors'>
          <Upload className='w-4 h-4 shrink-0' />
          <span className='truncate'>
            {file ? file.name : t('adminDashboard.pomodoroChooseFile')}
          </span>
          <input
            type='file'
            accept={ACCEPT_MAP[assetType]}
            className='hidden'
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      )}

      <div className='flex gap-2 justify-end pt-1 border-t border-border'>
        <Button type='button' variant='ghost' size='sm' onClick={onCancel}>
          {t('adminDashboard.cancel')}
        </Button>
        <Button
          type='submit'
          size='sm'
          disabled={isPending || (mode === 'file' && !file)}
        >
          {isPending
            ? t('adminDashboard.pomodoroUploading')
            : t('adminDashboard.save')}
        </Button>
      </div>
    </form>
  );
};

export default CreateForm;
