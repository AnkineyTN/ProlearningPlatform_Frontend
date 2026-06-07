import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Heart, RotateCcw, Trash2, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  useCreateSpace,
  useDeleteSpace,
  useSpacesSearch,
  useToggleFavoriteSpace,
  useUploadPomodoroAsset,
} from '@/hooks/usePomodoro';
import type { PomodoroTab, SpaceDto } from '@/services/types/pomodoro.types';

interface Props {
  open: boolean;
  selectedId: number | null;
  onClose: () => void;
  onSelect: (space: SpaceDto) => void;
  onReset: () => void;
}

const SpacePicker = ({
  open,
  selectedId,
  onClose,
  onSelect,
  onReset,
}: Props) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<PomodoroTab>('ALL');
  const [keyword, setKeyword] = useState('');
  const [uploadName, setUploadName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useSpacesSearch({
    tab,
    keyword: keyword.trim() || undefined,
    page: 0,
    size: 50,
  });

  const upload = useUploadPomodoroAsset();
  const createSpace = useCreateSpace();
  const deleteSpace = useDeleteSpace();
  const toggleFav = useToggleFavoriteSpace();

  const items: SpaceDto[] = data?.data ?? [];

  const handleUpload = async (file: File) => {
    if (!uploadName.trim()) {
      toast.error(t('pomodoro.toast.nameRequired'));
      return;
    }
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      toast.error(t('pomodoro.toast.invalidSpaceFile'));
      return;
    }
    try {
      const asset = await upload.mutateAsync({
        file,
        type: isVideo ? 'VIDEO' : 'IMAGE',
      });
      await createSpace.mutateAsync({
        name: uploadName.trim(),
        assetId: asset.assetId,
      });
      setUploadName('');
      if (fileRef.current) fileRef.current.value = '';
      toast.success(t('pomodoro.toast.spaceCreated'));
    } catch {
      toast.error(t('pomodoro.toast.uploadFailed'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className='sm:max-w-3xl max-h-[80vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle
            style={{
              fontFamily: 'var(--font-display)',
            }}
          >
            {t('pomodoro.spaces.title')}
          </DialogTitle>
        </DialogHeader>

        <div className='flex flex-col gap-3'>
          <div className='flex gap-2'>
            <Input
              placeholder={t('pomodoro.spaces.searchPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as PomodoroTab)}>
            <TabsList>
              <TabsTrigger value='ALL'>{t('pomodoro.tabs.all')}</TabsTrigger>
              <TabsTrigger value='MY_UPLOADS'>
                {t('pomodoro.tabs.myUploads')}
              </TabsTrigger>
              <TabsTrigger value='FAVORITES'>
                {t('pomodoro.tabs.favorites')}
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='flex flex-wrap gap-2 items-center border rounded-lg p-2 bg-[var(--pl-bg-sunken)]'>
            <Input
              placeholder={t('pomodoro.spaces.uploadName')}
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              className='flex-1 min-w-[180px]'
            />
            <input
              ref={fileRef}
              type='file'
              accept='image/*,video/*'
              className='hidden'
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
            <Button
              variant='outline'
              size='sm'
              disabled={upload.isPending || createSpace.isPending}
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={14} />
              {upload.isPending || createSpace.isPending
                ? t('pomodoro.spaces.uploading')
                : t('pomodoro.spaces.upload')}
            </Button>
          </div>
        </div>

        <div className='overflow-y-auto flex-1 -mx-2 px-2'>
          {isLoading && (
            <div className='text-center py-12 text-[var(--pl-text-faint)]'>
              {t('common.loading')}
            </div>
          )}
          {!isLoading && items.length === 0 && (
            <div className='text-center py-12 text-[var(--pl-text-faint)]'>
              {t('pomodoro.spaces.empty')}
            </div>
          )}
          <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
            <div
              className={cn(
                'relative rounded-lg overflow-hidden border cursor-pointer transition-all aspect-video bg-[var(--pl-bg)]',
                selectedId === null
                  ? 'border-[var(--pl-accent)] ring-2 ring-[var(--pl-accent)]'
                  : 'border-[var(--pl-border)] hover:border-[var(--pl-text-muted)]',
              )}
              onClick={onReset}
              title={t('pomodoro.spaces.reset')}
            >
              <div className='absolute inset-0 grid place-items-center text-[var(--pl-text-muted)]'>
                <div className='flex flex-col items-center gap-1.5'>
                  <RotateCcw size={20} />
                  <span className='text-xs font-medium'>
                    {t('pomodoro.spaces.reset')}
                  </span>
                </div>
              </div>
            </div>
            {items.map((s) => {
              const isSelected = s.id === selectedId;
              return (
                <div
                  key={s.id}
                  className={cn(
                    'relative group rounded-lg overflow-hidden border cursor-pointer transition-all',
                    isSelected
                      ? 'border-[var(--pl-accent)] ring-2 ring-[var(--pl-accent)]'
                      : 'border-[var(--pl-border)] hover:border-[var(--pl-text-muted)]',
                  )}
                  onClick={() => {
                    onSelect(s);
                    onClose();
                  }}
                >
                  <div className='aspect-video bg-black'>
                    {s.assetType === 'VIDEO' ? (
                      <video
                        src={s.assetUrl}
                        className='w-full h-full object-cover'
                        muted
                        playsInline
                        preload='metadata'
                        crossOrigin='anonymous'
                      />
                    ) : (
                      <img
                        src={s.assetUrl}
                        alt={s.name}
                        className='w-full h-full object-cover'
                      />
                    )}
                  </div>
                  <div className='absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-xs font-medium'>
                    {s.name}
                  </div>
                  <button
                    type='button'
                    title={
                      s.isFavorite
                        ? t('pomodoro.unfavorite')
                        : t('pomodoro.favorite')
                    }
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFav.mutate(s.id);
                    }}
                    className='absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur grid place-items-center text-white hover:bg-black/60'
                  >
                    <Heart
                      size={14}
                      fill={s.isFavorite ? 'currentColor' : 'none'}
                    />
                  </button>
                  {s.source === 'USER' && (
                    <button
                      type='button'
                      title={t('common.delete')}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (
                          window.confirm(t('pomodoro.spaces.confirmDelete'))
                        ) {
                          deleteSpace.mutate(s.id);
                        }
                      }}
                      className='absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur grid place-items-center text-white hover:bg-[var(--pl-danger)]/80'
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className='flex justify-end pt-2'>
          <Button variant='ghost' onClick={onClose}>
            <X size={14} />
            {t('common.close')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpacePicker;
