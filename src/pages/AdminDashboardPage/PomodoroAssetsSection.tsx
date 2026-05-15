import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { Music2, Image, Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  adminPomodoroAPI,
  type AdminCreateFromUrlRequest,
  type AdminSpaceDto,
  type AdminSoundDto,
  type AdminUpdateAssetRequest,
} from '@/services/endpoints/adminPomodoro';

type PomodoroSubTab = 'spaces' | 'sounds';

type EditingItem = { id: number; name: string; description: string };

const SPACE_ASSET_TYPES = ['IMAGE', 'VIDEO'] as const;
const SOUND_ASSET_TYPES = ['AUDIO'] as const;

const CreateForm = ({
  onSubmit,
  isPending,
  assetTypes,
  onCancel,
}: {
  onSubmit: (data: AdminCreateFromUrlRequest) => void;
  isPending: boolean;
  assetTypes: readonly string[];
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [assetType, setAssetType] = useState(assetTypes[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() || undefined, url: url.trim(), assetType: assetType as AdminCreateFromUrlRequest['assetType'] });
  };

  return (
    <form onSubmit={handleSubmit} className='rounded-2xl border border-border bg-muted/20 p-4 space-y-3'>
      <p className='text-sm font-medium'>{t('adminDashboard.pomodoroCreateTitle')}</p>
      <Input placeholder={t('adminDashboard.pomodoroName')} value={name} onChange={e => setName(e.target.value)} required />
      <Input placeholder={t('adminDashboard.pomodoroDescription')} value={description} onChange={e => setDescription(e.target.value)} />
      <Input placeholder='URL' value={url} onChange={e => setUrl(e.target.value)} required />
      <div className='flex gap-2'>
        {assetTypes.map(t => (
          <button key={t} type='button' onClick={() => setAssetType(t)}
            className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-colors ${
              assetType === t ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground'
            }`}>
            {t}
          </button>
        ))}
      </div>
      <div className='flex gap-2 justify-end'>
        <Button type='button' variant='ghost' size='sm' onClick={onCancel}>{t('adminDashboard.cancel')}</Button>
        <Button type='submit' size='sm' disabled={isPending}>{t('adminDashboard.save')}</Button>
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
    mutationFn: (data: AdminCreateFromUrlRequest) => adminPomodoroAPI.createSpaceFromUrl(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] }); setShowCreate(false); toast.success(t('adminDashboard.pomodoroCreated')); },
    onError: () => toast.error(t('adminDashboard.pomodoroCreateError')),
  });

  const createSoundMutation = useMutation({
    mutationFn: (data: AdminCreateFromUrlRequest) => adminPomodoroAPI.createSoundFromUrl(data),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] }); setShowCreate(false); toast.success(t('adminDashboard.pomodoroCreated')); },
    onError: () => toast.error(t('adminDashboard.pomodoroCreateError')),
  });

  const updateSpaceMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AdminUpdateAssetRequest }) => adminPomodoroAPI.updateSpace(id, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] }); setEditingItem(null); toast.success(t('adminDashboard.pomodoroUpdated')); },
    onError: () => toast.error(t('adminDashboard.pomodoroUpdateError')),
  });

  const updateSoundMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AdminUpdateAssetRequest }) => adminPomodoroAPI.updateSound(id, body),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] }); setEditingItem(null); toast.success(t('adminDashboard.pomodoroUpdated')); },
    onError: () => toast.error(t('adminDashboard.pomodoroUpdateError')),
  });

  const deleteSpaceMutation = useMutation({
    mutationFn: (id: number) => adminPomodoroAPI.deleteSpace(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] }); setDeleteTarget(null); toast.success(t('adminDashboard.pomodoroDeleted')); },
    onError: () => toast.error(t('adminDashboard.pomodoroDeleteError')),
  });

  const deleteSoundMutation = useMutation({
    mutationFn: (id: number) => adminPomodoroAPI.deleteSound(id),
    onSuccess: () => { void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] }); setDeleteTarget(null); toast.success(t('adminDashboard.pomodoroDeleted')); },
    onError: () => toast.error(t('adminDashboard.pomodoroDeleteError')),
  });

  const isSpaces = subTab === 'spaces';
  const query = isSpaces ? spacesQuery : soundsQuery;
  const items = (query.data ?? []) as (AdminSpaceDto | AdminSoundDto)[];
  const createMutation = isSpaces ? createSpaceMutation : createSoundMutation;
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
          <h2 className='font-semibold leading-tight'>{t('adminDashboard.pomodoroAssetsTitle')}</h2>
        </div>
        <Button size='sm' variant='outline' className='ml-auto gap-1.5' onClick={() => { setShowCreate(v => !v); setEditingItem(null); }}>
          <Plus className='w-3.5 h-3.5' />
          {t('adminDashboard.pomodoroAdd')}
        </Button>
      </div>

      <div className='flex gap-2'>
        {(['spaces', 'sounds'] as PomodoroSubTab[]).map(tab => (
          <button key={tab} onClick={() => { setSubTab(tab); setShowCreate(false); setEditingItem(null); }}
            className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-colors ${
              subTab === tab ? 'bg-foreground text-background border-foreground' : 'border-border text-muted-foreground hover:border-foreground/40'
            }`}>
            {tab === 'spaces' ? t('adminDashboard.pomodoroSpaces') : t('adminDashboard.pomodoroSounds')}
          </button>
        ))}
      </div>

      {showCreate && (
        <CreateForm
          assetTypes={assetTypes}
          isPending={createMutation.isPending}
          onCancel={() => setShowCreate(false)}
          onSubmit={(data) => createMutation.mutate(data)}
        />
      )}

      <div className='rounded-2xl border border-border bg-[var(--pl-bg)] overflow-hidden'>
        {query.isLoading ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>{t('onboarding.loading')}</div>
        ) : items.length === 0 ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>{t('adminDashboard.pomodoroEmpty')}</div>
        ) : (
          <div className='divide-y divide-border'>
            {items.map((item) => (
              <div key={item.id} className='p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors'>
                <div className='w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-muted'>
                  {isSpaces && 'assetType' in item && item.assetType === 'IMAGE' ? (
                    <img src={item.assetUrl} alt='' className='w-full h-full object-cover' />
                  ) : (
                    <div className='w-full h-full grid place-items-center'>
                      {isSpaces ? <Image className='w-5 h-5 text-muted-foreground' /> : <Music2 className='w-5 h-5 text-muted-foreground' />}
                    </div>
                  )}
                </div>

                <div className='flex-1 min-w-0'>
                  {editingItem?.id === item.id ? (
                    <div className='space-y-1.5'>
                      <Input
                        className='h-7 text-sm'
                        value={editingItem.name}
                        onChange={e => setEditingItem(prev => prev ? { ...prev, name: e.target.value } : null)}
                      />
                      <Input
                        className='h-7 text-sm'
                        placeholder={t('adminDashboard.pomodoroDescription')}
                        value={editingItem.description}
                        onChange={e => setEditingItem(prev => prev ? { ...prev, description: e.target.value } : null)}
                      />
                    </div>
                  ) : (
                    <>
                      <p className='text-sm font-medium truncate'>{item.name}</p>
                      {item.description && <p className='text-xs text-muted-foreground truncate'>{item.description}</p>}
                    </>
                  )}
                </div>

                <div className='flex gap-1 shrink-0'>
                  {editingItem?.id === item.id ? (
                    <>
                      <Button variant='ghost' size='icon' className='h-7 w-7 text-green-600'
                        disabled={updateMutation.isPending}
                        onClick={() => updateMutation.mutate({ id: item.id, body: { name: editingItem.name, description: editingItem.description } })}>
                        <Check className='w-3.5 h-3.5' />
                      </Button>
                      <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setEditingItem(null)}>
                        <X className='w-3.5 h-3.5' />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant='ghost' size='icon' className='h-7 w-7'
                        onClick={() => setEditingItem({ id: item.id, name: item.name, description: item.description ?? '' })}>
                        <Pencil className='w-3.5 h-3.5' />
                      </Button>
                      {deleteTarget === item.id ? (
                        <>
                          <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive'
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate(item.id)}>
                            <Check className='w-3.5 h-3.5' />
                          </Button>
                          <Button variant='ghost' size='icon' className='h-7 w-7' onClick={() => setDeleteTarget(null)}>
                            <X className='w-3.5 h-3.5' />
                          </Button>
                        </>
                      ) : (
                        <Button variant='ghost' size='icon' className='h-7 w-7 text-destructive hover:text-destructive'
                          onClick={() => setDeleteTarget(item.id)}>
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
