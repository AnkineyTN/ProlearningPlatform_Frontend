import { useTranslation } from 'react-i18next';
import { Image, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type AdminSpaceDto } from '@/services/endpoints/adminPomodoro';
import type { EditingItem, UpdateMutation, DeleteMutation } from '../../types';

type Props = {
  item: AdminSpaceDto;
  isEditing: boolean;
  editingItem: EditingItem | null;
  setEditingItem: (v: EditingItem | null) => void;
  updateMutation: UpdateMutation;
  deleteTarget: number | null;
  setDeleteTarget: (v: number | null) => void;
  deleteMutation: DeleteMutation;
};

const SpaceCard = ({
  item,
  isEditing,
  editingItem,
  setEditingItem,
  updateMutation,
  deleteTarget,
  setDeleteTarget,
  deleteMutation,
}: Props) => {
  const { t } = useTranslation();
  return (
    <article className='rounded-[14px] border border-border overflow-hidden bg-[var(--pl-bg-elev)] flex flex-col'>
      <div className='aspect-video relative bg-[var(--pl-bg-sunken)]'>
        {item.assetType === 'IMAGE' && item.assetUrl ? (
          <img
            src={item.assetUrl}
            alt={item.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full grid place-items-center'>
            <Image className='w-8 h-8 text-muted-foreground/40' />
          </div>
        )}
        <div className='absolute left-3.5 bottom-3.5 font-[family-name:var(--font-mono-pl)] text-[10px] text-white/70 tracking-[0.14em] uppercase'>
          {item.assetType} · #{item.id}
        </div>
      </div>

      <div className='p-3.5 flex-1 flex flex-col'>
        {isEditing && editingItem ? (
          <div className='space-y-1.5'>
            <Input
              className='h-7 text-sm'
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, name: e.target.value })
              }
            />
            <Input
              className='h-7 text-sm'
              placeholder={t('adminDashboard.pomodoroDescription')}
              value={editingItem.description}
              onChange={(e) =>
                setEditingItem({ ...editingItem, description: e.target.value })
              }
            />
            <div className='flex gap-1 pt-1'>
              <Button
                variant='ghost'
                size='icon'
                className='h-7 w-7 text-[var(--pl-success)]'
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
            </div>
          </div>
        ) : (
          <>
            <div className='font-[family-name:var(--font-display)] text-[17px] font-medium tracking-tight'>
              {item.name}
            </div>
            {item.description && (
              <div className='text-xs text-muted-foreground mt-1 truncate'>
                {item.description}
              </div>
            )}
            <div className='flex-1' />
            <div className='mt-3.5 pt-3 border-t border-border flex items-center gap-1.5'>
              <div className='flex-1' />
              <button
                onClick={() =>
                  setEditingItem({
                    id: item.id,
                    name: item.name,
                    description: item.description ?? '',
                  })
                }
                className='w-[26px] h-[26px] rounded-md grid place-items-center text-muted-foreground border border-border hover:bg-[var(--pl-bg-hover)] transition-colors'
              >
                <Pencil className='w-3 h-3' />
              </button>
              {deleteTarget === item.id ? (
                <>
                  <button
                    onClick={() => deleteMutation.mutate(item.id)}
                    disabled={deleteMutation.isPending}
                    className='w-[26px] h-[26px] rounded-md grid place-items-center text-[var(--pl-danger)] border border-[var(--pl-danger)]/30 hover:bg-[var(--pl-danger)]/10 transition-colors'
                  >
                    <Check className='w-3 h-3' />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className='w-[26px] h-[26px] rounded-md grid place-items-center text-muted-foreground border border-border hover:bg-[var(--pl-bg-hover)] transition-colors'
                  >
                    <X className='w-3 h-3' />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setDeleteTarget(item.id)}
                  className='w-[26px] h-[26px] rounded-md grid place-items-center text-[var(--pl-danger)] border border-border hover:bg-[var(--pl-danger)]/10 transition-colors'
                >
                  <Trash2 className='w-3 h-3' />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </article>
  );
};

export default SpaceCard;
