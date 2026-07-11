import {
  Copy,
  GripVertical,
  ImagePlus,
  Loader2,
  Trash2,
  X,
} from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useUploadImageFile } from '@/hooks/useImageUpload';

import type { FlashcardItemProps } from './type';

export default function FlashcardItemComponent({
  card,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  canDelete,
  isTermInvalid,
  isDefinitionInvalid,
}: FlashcardItemProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImageFile();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      onUpdate(card.id, 'imageUrl', result.url);
      onUpdate(card.id, 'assetId', result.assetId);
      fileInputRef.current!.value = '';
    } catch (error) {
      toast.error(
        apiErrorMessage(error, 'Failed to upload image. Please try again.'),
      );
    }
  };

  const handleRemoveImage = () => {
    onUpdate(card.id, 'assetId', undefined);
    fileInputRef.current!.value = '';
  };

  return (
    <div className='flex items-stretch rounded-2xl border border-[var(--pl-border)] bg-[var(--pl-bg)] overflow-hidden mb-3 hover:border-[var(--pl-border-strong)] transition-colors'>
      {/* Number + drag handle */}
      <div className='flex flex-col items-center justify-center gap-2 w-14 py-4 flex-shrink-0 bg-[var(--pl-bg-hover)] border-r border-[var(--pl-border)]'>
        <span className='font-[family-name:var(--font-mono-pl)] text-[11px] text-[var(--pl-text-faint)]'>
          {String(index + 1).padStart(2, '0')}
        </span>
        <button
          className='cursor-grab active:cursor-grabbing text-[var(--pl-text-faint)] hover:text-[var(--pl-text-muted)] transition-colors'
          title='Drag to reorder'
        >
          <GripVertical className='w-4 h-4' />
        </button>
      </div>

      {/* Term */}
      <div className='flex-[1] min-w-0 p-4 space-y-1.5 border-r border-[var(--pl-border)] bg-[var(--pl-bg-elev)]'>
        <Label className='font-[family-name:var(--font-mono-pl)] text-[11px] tracking-[0.2em] text-[var(--pl-text-faint)]'>
          TERM
        </Label>
        <Textarea
          value={card.term}
          onChange={(e) => onUpdate(card.id, 'term', e.target.value)}
          placeholder='Term'
          className={cn(
            'w-full px-3! py-1! min-h-[24px] resize-none border-0 bg-[var(--pl-bg)] p-0 shadow-none text-sm leading-relaxed focus-visible:ring-0',
            isTermInvalid &&
              'rounded-md border! border-[var(--pl-danger-border)]! bg-[var(--pl-danger-soft)]!',
          )}
        />
        {isTermInvalid && (
          <p className='text-xs text-[var(--pl-danger-text)]'>
            Term is required
          </p>
        )}

        <Input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          className='hidden'
        />
        {card.imageUrl && (
          <div className='relative inline-block group/img'>
            <img
              src={card.imageUrl}
              alt='Card'
              className='w-14 h-14 object-cover rounded-lg border border-[var(--pl-border)]'
            />
            <button
              onClick={handleRemoveImage}
              className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--pl-danger)] text-white rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer'
            >
              <X className='w-3 h-3' />
            </button>
          </div>
        )}
      </div>

      {/* Definition + actions */}
      <div className='flex-[2] min-w-0 p-4 flex items-start gap-3 bg-[var(--pl-bg-elev)]'>
        <div className='flex-1 min-w-0 space-y-1.5'>
          <Label className='font-[family-name:var(--font-mono-pl)] text-[11px] tracking-[0.2em] text-[var(--pl-text-faint)]'>
            DEFINITION
          </Label>
          <Textarea
            value={card.definition}
            onChange={(e) => onUpdate(card.id, 'definition', e.target.value)}
            placeholder='Definition'
            className={cn(
              'w-full px-3! py-1! min-h-[24px] resize-none bg-[var(--pl-bg)] border-0 p-0 shadow-none text-sm leading-relaxed text-[var(--pl-text-muted)] focus-visible:ring-0',
              isDefinitionInvalid &&
                'rounded-md border! border-[var(--pl-danger-border)]! bg-[var(--pl-danger-soft)]!',
            )}
          />
          {isDefinitionInvalid && (
            <p className='text-xs text-[var(--pl-danger-text)]'>
              Definition is required
            </p>
          )}
        </div>

        <div className='flex items-center gap-1 flex-shrink-0'>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadImageMutation.isPending}
            className='w-7 h-7 rounded-lg flex items-center justify-center text-[var(--pl-text-faint)] hover:text-[var(--pl-accent)] hover:bg-[var(--pl-accent-soft)] transition-colors cursor-pointer disabled:opacity-30'
            title='Add image'
          >
            {uploadImageMutation.isPending ? (
              <Loader2 className='w-3.5 h-3.5 animate-spin' />
            ) : (
              <ImagePlus className='w-3.5 h-3.5' />
            )}
          </button>
          <button
            onClick={() => onDuplicate(card.id)}
            className='w-7 h-7 rounded-lg flex items-center justify-center text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] transition-colors cursor-pointer'
            title='Duplicate card'
          >
            <Copy className='w-3.5 h-3.5' />
          </button>
          <button
            onClick={() => onDelete(card.id)}
            disabled={!canDelete}
            className='w-7 h-7 rounded-lg flex items-center justify-center text-[var(--pl-text-faint)] hover:text-[var(--pl-danger)] hover:bg-[var(--pl-danger-soft)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
            title='Delete card'
          >
            <Trash2 className='w-3.5 h-3.5' />
          </button>
        </div>
      </div>
    </div>
  );
}
