import { useTranslation } from 'react-i18next';
import { Music2, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { type AdminSoundDto } from '@/services/endpoints/adminPomodoro';
import type { EditingItem, UpdateMutation, DeleteMutation } from '../../types';

type Props = {
  item: AdminSoundDto;
  isEditing: boolean;
  editingItem: EditingItem | null;
  setEditingItem: (v: EditingItem | null) => void;
  updateMutation: UpdateMutation;
  deleteTarget: number | null;
  setDeleteTarget: (v: number | null) => void;
  deleteMutation: DeleteMutation;
};

const SoundRow = ({
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
    <div className='p-4 flex items-start gap-3 hover:bg-[var(--pl-bg-hover)] transition-colors'>
      <div className='w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-[var(--pl-accent-soft)] grid place-items-center'>
        <Music2 className='w-5 h-5 text-muted-foreground' />
      </div>

      <div className='flex-1 min-w-0'>
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
          </div>
        ) : (
          <>
            <p className='text-[13.5px] font-medium truncate'>{item.name}</p>
            {item.description && (
              <p className='text-xs text-muted-foreground truncate'>
                {item.description}
              </p>
            )}
            <div className='text-[10.5px] text-muted-foreground font-[family-name:var(--font-mono-pl)] mt-1'>
              #{item.id}
            </div>
          </>
        )}
      </div>

      <div className='flex gap-1 shrink-0'>
        {isEditing && editingItem ? (
          <>
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
  );
};

export default SoundRow;
