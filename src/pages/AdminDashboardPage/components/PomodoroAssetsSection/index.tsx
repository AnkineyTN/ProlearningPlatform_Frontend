import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { Image, Music2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  adminPomodoroAPI,
  type AdminCreateFromUrlRequest,
  type AdminCreateSpaceFromAssetRequest,
  type AdminCreateSoundFromAssetRequest,
  type AdminSpaceDto,
  type AdminSoundDto,
  type AdminUpdateAssetRequest,
} from '@/services/endpoints/adminPomodoro';
import CreateForm from './CreateForm';
import SpaceCard from './SpaceCard';
import SoundRow from './SoundRow';
import { SPACE_ASSET_TYPES, SOUND_ASSET_TYPES } from '../../constants';
import type { PomodoroSubTab, EditingItem } from '../../types';

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
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.pomodoroCreateError'))),
  });

  const createSpaceFromFileMutation = useMutation({
    mutationFn: (data: AdminCreateSpaceFromAssetRequest) =>
      adminPomodoroAPI.createSpaceFromFile(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] });
      setShowCreate(false);
      toast.success(t('adminDashboard.pomodoroCreated'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.pomodoroCreateError'))),
  });

  const createSoundMutation = useMutation({
    mutationFn: (data: AdminCreateFromUrlRequest) =>
      adminPomodoroAPI.createSoundFromUrl(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] });
      setShowCreate(false);
      toast.success(t('adminDashboard.pomodoroCreated'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.pomodoroCreateError'))),
  });

  const createSoundFromFileMutation = useMutation({
    mutationFn: (data: AdminCreateSoundFromAssetRequest) =>
      adminPomodoroAPI.createSoundFromFile(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] });
      setShowCreate(false);
      toast.success(t('adminDashboard.pomodoroCreated'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.pomodoroCreateError'))),
  });

  const updateSpaceMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AdminUpdateAssetRequest }) =>
      adminPomodoroAPI.updateSpace(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] });
      setEditingItem(null);
      toast.success(t('adminDashboard.pomodoroUpdated'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.pomodoroUpdateError'))),
  });

  const updateSoundMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: AdminUpdateAssetRequest }) =>
      adminPomodoroAPI.updateSound(id, body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] });
      setEditingItem(null);
      toast.success(t('adminDashboard.pomodoroUpdated'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.pomodoroUpdateError'))),
  });

  const deleteSpaceMutation = useMutation({
    mutationFn: (id: number) => adminPomodoroAPI.deleteSpace(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'spaces'] });
      setDeleteTarget(null);
      toast.success(t('adminDashboard.pomodoroDeleted'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.pomodoroDeleteError'))),
  });

  const deleteSoundMutation = useMutation({
    mutationFn: (id: number) => adminPomodoroAPI.deleteSound(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'pomodoro', 'sounds'] });
      setDeleteTarget(null);
      toast.success(t('adminDashboard.pomodoroDeleted'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.pomodoroDeleteError'))),
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
    <section className='space-y-4'>
      <div className='flex items-center gap-4'>
        <div className='flex gap-1 border-b border-border flex-1'>
          {(['spaces', 'sounds'] as PomodoroSubTab[]).map((tab) => {
            const active = subTab === tab;
            return (
              <button
                key={tab}
                onClick={() => {
                  setSubTab(tab);
                  setShowCreate(false);
                  setEditingItem(null);
                }}
                className={`px-[18px] py-2.5 text-[13px] -mb-px inline-flex items-center gap-2 transition-colors ${
                  active
                    ? 'text-foreground font-medium border-b-2 border-[var(--pl-accent)]'
                    : 'text-muted-foreground border-b-2 border-transparent'
                }`}
              >
                {tab === 'spaces' ? (
                  <Image className='w-[13px] h-[13px]' />
                ) : (
                  <Music2 className='w-[13px] h-[13px]' />
                )}
                {tab === 'spaces'
                  ? t('adminDashboard.pomodoroSpaces')
                  : t('adminDashboard.pomodoroSounds')}
                <span className='font-[family-name:var(--font-mono-pl)] text-[10.5px] px-[7px] py-[2px] rounded-full bg-[var(--pl-bg-hover)] text-muted-foreground'>
                  {tab === 'spaces'
                    ? (spacesQuery.data?.length ?? 0)
                    : (soundsQuery.data?.length ?? 0)}
                </span>
              </button>
            );
          })}
        </div>
        <Button
          size='sm'
          className='gap-1.5 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:opacity-90'
          onClick={() => {
            setShowCreate((v) => !v);
            setEditingItem(null);
          }}
        >
          <Plus className='w-3.5 h-3.5' />
          {t('adminDashboard.pomodoroAdd')}
        </Button>
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

      {isSpaces ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          <button
            onClick={() => setShowCreate(true)}
            className='rounded-[14px] border-[1.5px] border-dashed border-border min-h-[200px] flex flex-col items-center justify-center gap-2.5 text-muted-foreground hover:border-[var(--pl-accent)] hover:text-[var(--pl-accent-strong)] hover:bg-[var(--pl-accent-soft)] transition-all'
          >
            <div className='w-11 h-11 rounded-xl border-[1.5px] border-dashed border-current grid place-items-center'>
              <Plus className='w-5 h-5' />
            </div>
            <div className='text-[13px] font-medium'>Upload backdrop</div>
          </button>

          {query.isLoading ? (
            <div className='col-span-full p-16 text-center text-muted-foreground text-sm'>
              {t('onboarding.loading')}
            </div>
          ) : (
            items.map((item) => (
              <SpaceCard
                key={item.id}
                item={item as AdminSpaceDto}
                isEditing={editingItem?.id === item.id}
                editingItem={editingItem}
                setEditingItem={setEditingItem}
                updateMutation={updateMutation}
                deleteTarget={deleteTarget}
                setDeleteTarget={setDeleteTarget}
                deleteMutation={deleteMutation}
              />
            ))
          )}
        </div>
      ) : (
        <div className='bg-[var(--pl-bg-elev)] border border-border rounded-[14px] overflow-hidden'>
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
                <SoundRow
                  key={item.id}
                  item={item as AdminSoundDto}
                  isEditing={editingItem?.id === item.id}
                  editingItem={editingItem}
                  setEditingItem={setEditingItem}
                  updateMutation={updateMutation}
                  deleteTarget={deleteTarget}
                  setDeleteTarget={setDeleteTarget}
                  deleteMutation={deleteMutation}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default PomodoroAssetsSection;
