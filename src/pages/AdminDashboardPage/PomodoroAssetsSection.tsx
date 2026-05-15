import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  Music2,
  Image,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  adminPomodoroAPI,
  type AdminCreateFromUrlRequest,
  type AdminCreateSpaceFromAssetRequest,
  type AdminCreateSoundFromAssetRequest,
  type AdminSpaceDto,
  type AdminSoundDto,
  type AdminUpdateAssetRequest,
} from '@/services/endpoints/adminPomodoro';
import { useUploadPomodoroAsset } from '@/hooks/usePomodoro';

type PomodoroSubTab = 'spaces' | 'sounds';

type EditingItem = { id: number; name: string; description: string };

const SPACE_ASSET_TYPES = ['IMAGE', 'VIDEO'] as const;
const SOUND_ASSET_TYPES = ['AUDIO'] as const;

const ACCEPT_MAP: Record<string, string> = {
  IMAGE: 'image/*',
  VIDEO: 'video/*',
  AUDIO: 'audio/*',
};

const CreateForm = ({
  onUrlSubmit,
  onFileSubmit,
  isUrlPending,
  isFilePending,
  assetTypes,
  onCancel,
}: {
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
}) => {
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

  const tabBtn = (label: string, active: boolean, onClick: () => void) => (
    <button
      type='button'
      onClick={onClick}
      className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-colors ${
        active
          ? 'bg-foreground text-background border-foreground'
          : 'border-border text-muted-foreground hover:border-foreground/40'
      }`}
    >
      {label}
    </button>
  );

  return (
    <form
      onSubmit={mode === 'url' ? handleUrlSubmit : handleFileSubmit}
      className='rounded-2xl border border-border bg-muted/20 p-4 space-y-3'
    >
      <div className='flex items-center gap-2'>
        {tabBtn(t('adminDashboard.pomodoroModeUrl'), mode === 'url', () =>
          setMode('url'),
        )}
        {tabBtn(t('adminDashboard.pomodoroModeFile'), mode === 'file', () =>
          setMode('file'),
        )}
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
                  ? 'bg-foreground text-background border-foreground'
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
        <label className='flex items-center gap-2 cursor-pointer rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:border-foreground/40 transition-colors'>
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

      <div className='flex gap-2 justify-end'>
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

const PomodoroAssetsSection = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [subTab, setSubTab] = useState<PomodoroSubTab>('spaces');
  const [showCreate, setShowCreate] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const spacesQuery = useQuery({
    queryKey: ['admin', 'pomodoro', 'spaces'],
    queryFn: async () => {
      const res = await adminPomodoroAPI.listSpaces();
      return (res.data.data ?? []) as AdminSpaceDto[];
    },
  });

  const soundsQuery = useQuery({
    queryKey: ['admin', 'pomodoro', 'sounds'],
    queryFn: async () => {
      const res = await adminPomodoroAPI.listSounds();
      return (res.data.data ?? []) as AdminSoundDto[];
    },
  });

  const createSpaceMutation = useMutation({
    mutationFn: (data: AdminCreateFromUrlRequest) =>
      adminPomodoroAPI.createSpaceFromUrl(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] });
      setShowCreate(false);
      toast.success(t('adminDashboard.pomodoroCreated'));
    },
    onError: () => toast.error(t('adminDashboard.pomodoroCreateError')),
  });

  const createSpaceFromFileMutation = useMutation({
    mutationFn: (data: AdminCreateSpaceFromAssetRequest) =>
      adminPomodoroAPI.createSpaceFromFile(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] });
      setShowCreate(false);
      toast.success(t('adminDashboard.pomodoroCreated'));
    },
    onError: () => toast.error(t('adminDashboard.pomodoroCreateError')),
  });

  const createSoundMutation = useMutation({
    mutationFn: (data: AdminCreateFromUrlRequest) =>
      adminPomodoroAPI.createSoundFromUrl(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] });
      setShowCreate(false);
      toast.success(t('adminDashboard.pomodoroCreated'));
    },
    onError: () => toast.error(t('adminDashboard.pomodoroCreateError')),
  });

  const createSoundFromFileMutation = useMutation({
    mutationFn: (data: AdminCreateSoundFromAssetRequest) =>
      adminPomodoroAPI.createSoundFromFile(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] });
      setShowCreate(false);
      toast.success(t('adminDashboard.pomodoroCreated'));
    },
    onError: () => toast.error(t('adminDashboard.pomodoroCreateError')),
  });

  const updateSpaceMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AdminUpdateAssetRequest }) =>
      adminPomodoroAPI.updateSpace(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] });
      setEditingItem(null);
      toast.success(t('adminDashboard.pomodoroUpdated'));
    },
    onError: () => toast.error(t('adminDashboard.pomodoroUpdateError')),
  });

  const updateSoundMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AdminUpdateAssetRequest }) =>
      adminPomodoroAPI.updateSound(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] });
      setEditingItem(null);
      toast.success(t('adminDashboard.pomodoroUpdated'));
    },
    onError: () => toast.error(t('adminDashboard.pomodoroUpdateError')),
  });

  const deleteSpaceMutation = useMutation({
    mutationFn: (id: number) => adminPomodoroAPI.deleteSpace(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] });
      setDeleteTarget(null);
      toast.success(t('adminDashboard.pomodoroDeleted'));
    },
    onError: () => toast.error(t('adminDashboard.pomodoroDeleteError')),
  });

  const deleteSoundMutation = useMutation({
    mutationFn: (id: number) => adminPomodoroAPI.deleteSound(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] });
      setDeleteTarget(null);
      toast.success(t('adminDashboard.pomodoroDeleted'));
    },
    onError: () => toast.error(t('adminDashboard.pomodoroDeleteError')),
  });

  const isSpaces = subTab === 'spaces';
  const query = isSpaces ? spacesQuery : soundsQuery;
  const items = (query.data ?? []) as (AdminSpaceDto | AdminSoundDto)[];
  const createUrlMutation = isSpaces
    ? createSpaceMutation
    : createSoundMutation;
  const updateMutation = isSpaces ? updateSpaceMutation : updateSoundMutation;
  const deleteMutation = isSpaces ? deleteSpaceMutation : deleteSoundMutation;
  const assetTypes = isSpaces ? SPACE_ASSET_TYPES : SOUND_ASSET_TYPES;

  return (
    <section className='space-y-3'>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center'>
          <Music2 className='w-4 h-4 text-violet-500' />
        </div>
        <div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
            MANAGEMENT
          </p>
          <h2 className='font-semibold leading-tight'>
            {t('adminDashboard.pomodoroAssetsTitle')}
          </h2>
        </div>
        <Button
          size='sm'
          variant='outline'
          className='ml-auto gap-1.5'
          onClick={() => {
            setShowCreate((v) => !v);
            setEditingItem(null);
          }}
        >
          <Plus className='w-3.5 h-3.5' />
          {t('adminDashboard.pomodoroAdd')}
        </Button>
      </div>

      <div className='flex gap-2'>
        {(['spaces', 'sounds'] as PomodoroSubTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setSubTab(tab);
              setShowCreate(false);
              setEditingItem(null);
            }}
            className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-colors ${
              subTab === tab
                ? 'bg-foreground text-background border-foreground'
                : 'border-border text-muted-foreground hover:border-foreground/40'
            }`}
          >
            {tab === 'spaces'
              ? t('adminDashboard.pomodoroSpaces')
              : t('adminDashboard.pomodoroSounds')}
          </button>
        ))}
      </div>

      {showCreate && (
        <CreateForm
          assetTypes={assetTypes}
          isUrlPending={createUrlMutation.isPending}
          isFilePending={createUrlMutation.isPending}
          onCancel={() => setShowCreate(false)}
          onUrlSubmit={(data) => createUrlMutation.mutate(data)}
          onFileSubmit={({ name, description, assetId, assetType }) =>
            isSpaces
              ? createSpaceFromFileMutation.mutate({
                  name,
                  description,
                  assetId,
                  assetType:
                    assetType as AdminCreateSpaceFromAssetRequest['assetType'],
                })
              : createSoundFromFileMutation.mutate({
                  name,
                  description,
                  assetId,
                })
          }
        />
      )}

      <div className='rounded-2xl border border-border bg-[var(--pl-bg)] overflow-hidden'>
        {query.isLoading ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>
            {t('onboarding.loading')}
          </div>
        ) : items.length === 0 ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>
            {t('adminDashboard.pomodoroEmpty')}
          </div>
        ) : (
          <div className='divide-y divide-border'>
            {items.map((item) => (
              <div
                key={item.id}
                className='p-4 flex items-start gap-3 hover:bg-[var(--pl-bg-hover)] transition-colors'
              >
                <div className='w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--pl-accent-soft)]'>
                  {isSpaces &&
                  'assetType' in item &&
                  item.assetType === 'IMAGE' ? (
                    <img
                      src={item.assetUrl}
                      alt=''
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <div className='w-full h-full grid place-items-center'>
                      {isSpaces ? (
                        <Image className='w-5 h-5 text-muted-foreground' />
                      ) : (
                        <Music2 className='w-5 h-5 text-muted-foreground' />
                      )}
                    </div>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  {editingItem?.id === item.id ? (
                    <div className='space-y-1.5'>
                      <Input
                        className='h-7 text-sm'
                        value={editingItem.name}
                        onChange={(e) =>
                          setEditingItem((prev) =>
                            prev ? { ...prev, name: e.target.value } : null,
                          )
                        }
                      />
                      <Input
                        className='h-7 text-sm'
                        placeholder={t('adminDashboard.pomodoroDescription')}
                        value={editingItem.description}
                        onChange={(e) =>
                          setEditingItem((prev) =>
                            prev
                              ? { ...prev, description: e.target.value }
                              : null,
                          )
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <p className='text-sm font-medium truncate'>
                        {item.name}
                      </p>
                      {item.description && (
                        <p className='text-xs text-muted-foreground truncate'>
                          {item.description}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <div className='flex gap-1 shrink-0'>
                  {editingItem?.id === item.id ? (
                    <>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 text-green-600'
                        disabled={updateMutation.isPending}
                        onClick={() =>
                          updateMutation.mutate({
                            id: item.id,
                            body: {
                              name: editingItem.name,
                              description: editingItem.description,
                            },
                          })
                        }
                      >
                        <Check className='w-3.5 h-3.5' />
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        onClick={() => setEditingItem(null)}
                      >
                        <X className='w-3.5 h-3.5' />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7'
                        onClick={() =>
                          setEditingItem({
                            id: item.id,
                            name: item.name,
                            description: item.description ?? '',
                          })
                        }
                      >
                        <Pencil className='w-3.5 h-3.5' />
                      </Button>
                      {deleteTarget === item.id ? (
                        <>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7 text-destructive'
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(item.id)}
                          >
                            <Check className='w-3.5 h-3.5' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='icon'
                            className='h-7 w-7'
                            onClick={() => setDeleteTarget(null)}
                          >
                            <X className='w-3.5 h-3.5' />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 text-destructive hover:text-destructive'
                          onClick={() => setDeleteTarget(item.id)}
                        >
                          <Trash2 className='w-3.5 h-3.5' />
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PomodoroAssetsSection;
