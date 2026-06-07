import { Check, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Card as CardData } from '@/services/types/flashcard.types';
import type { UseCardEditReturn } from './useCardEdit';

interface CardEditFormProps {
  card: CardData;
  edit: UseCardEditReturn;
  isUpdating: boolean;
}

export default function CardEditForm({
  card,
  edit,
  isUpdating,
}: CardEditFormProps) {
  const { editData } = edit;
  const canSave =
    !isUpdating && editData.frontCard.trim() && editData.backCard.trim();

  return (
    <div className='p-5 space-y-4' onClick={(e) => e.stopPropagation()}>
      <div className='flex gap-6'>
        <div className='flex-1 max-w-55'>
          <label className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block font-medium'>
            Term
          </label>
          <Textarea
            value={editData.frontCard}
            onChange={(e) => edit.updateField('frontCard', e.target.value)}
            placeholder='Enter term'
            className='min-h-[80px] resize-none bg-[var(--pl-bg)] border-border focus:border-primary text-sm'
            autoFocus
          />
        </div>
        <div className='w-px bg-border self-stretch' />
        <div className='flex-1'>
          <label className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block font-medium'>
            Definition
          </label>
          <Textarea
            value={editData.backCard}
            onChange={(e) => edit.updateField('backCard', e.target.value)}
            placeholder='Enter definition'
            className='min-h-[80px] resize-none bg-[var(--pl-bg)] border-border focus:border-primary text-sm'
          />
        </div>
        <div className='flex flex-col justify-center'>
          {editData.imageUrl ? (
            <div className='relative group'>
              <img
                src={editData.imageUrl}
                alt='Card'
                className='w-20 h-20 mt-6 object-cover rounded-lg border border-border'
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  edit.removeImage();
                }}
                className='absolute top-4 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <X className='w-3 h-3' />
              </button>
            </div>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                edit.triggerFilePicker();
              }}
              disabled={edit.isUploading}
              className='w-16 h-16 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50 cursor-pointer'
            >
              {edit.isUploading ? (
                <Loader2 className='w-5 h-5 animate-spin' />
              ) : (
                <>
                  <ImageIcon className='w-5 h-5' />
                  <span className='text-[10px] uppercase tracking-wide'>
                    Image
                  </span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className='flex justify-end gap-2 pt-1'>
        <Button
          variant='ghost'
          size='sm'
          onClick={(e) => {
            e.stopPropagation();
            edit.cancelEdit();
          }}
          className='gap-1.5 text-xs'
        >
          <X className='w-3.5 h-3.5' />
          Cancel
        </Button>
        <Button
          size='sm'
          onClick={(e) => {
            e.stopPropagation();
            void edit.saveEdit(card);
          }}
          disabled={!canSave}
          className='gap-1.5 text-xs'
        >
          <Check className='w-3.5 h-3.5' />
          {isUpdating ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </div>
  );
}
