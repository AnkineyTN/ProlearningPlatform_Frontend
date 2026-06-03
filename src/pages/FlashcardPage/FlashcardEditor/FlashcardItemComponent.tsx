import { GripVertical, ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { useRef } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUploadImageFile } from '@/hooks/useImageUpload';

import type { FlashcardItemProps } from './type';

export default function FlashcardItemComponent({
  card,
  index,
  onUpdate,
  onDelete,
  canDelete,
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
    } catch {
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleRemoveImage = () => {
    onUpdate(card.id, 'assetId', undefined);
    fileInputRef.current!.value = '';
  };

  return (
    <div className='flex items-start gap-3 bg-[var(--pl-bg)] border border-border rounded-xl p-5 mb-3 hover:shadow-sm transition-shadow group'>
      {/* Number + drag handle */}
      <div className='flex flex-col items-center gap-2 pt-1 flex-shrink-0'>
        <span className='font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground/60 w-5 text-center'>
          {index + 1}
        </span>
        <button className='cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors'>
          <GripVertical className='w-4 h-4' />
        </button>
      </div>

      {/* Term + Definition */}
      <div className='flex-1 grid grid-cols-2 gap-5'>
        <div className='space-y-1.5'>
          <Textarea
            value={card.term}
            onChange={(e) => onUpdate(card.id, 'term', e.target.value)}
            placeholder='Term'
            className='w-full rounded-lg px-3 py-2.5 border-b-2 border-border focus:border-primary focus:outline-none resize-none min-h-[90px] text-sm leading-relaxed transition-colors'
          />
          <label className='text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium px-1'>
            TERM
          </label>
        </div>
        <div className='space-y-1.5'>
          <Textarea
            value={card.definition}
            onChange={(e) => onUpdate(card.id, 'definition', e.target.value)}
            placeholder='Definition'
            className='w-full rounded-lg px-3 py-2.5 border-b-2 border-border focus:border-primary focus:outline-none resize-none min-h-[90px] text-sm leading-relaxed transition-colors'
          />
          <label className='text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium px-1'>
            DEFINITION
          </label>
        </div>
      </div>

      {/* Image + delete */}
      <div className='flex flex-col items-center gap-2 flex-shrink-0 pt-1'>
        <Input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          className='hidden'
        />

        {card.imageUrl ? (
          <div className='relative group/img'>
            <img
              src={card.imageUrl}
              alt='Card'
              className='w-14 h-14 object-cover rounded-lg border border-border'
            />
            <button
              onClick={handleRemoveImage}
              className='absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer'
            >
              <X className='w-3 h-3' />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadImageMutation.isPending}
            className='w-14 h-14 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-0.5 text-muted-foreground/50 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer disabled:opacity-50'
            title='Add image'
          >
            {uploadImageMutation.isPending ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <>
                <ImagePlus className='w-4 h-4' />
                <span className='text-[9px] uppercase tracking-wide'>
                  Image
                </span>
              </>
            )}
          </button>
        )}

        <button
          onClick={() => onDelete(card.id)}
          disabled={!canDelete}
          className='w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed'
          title='Delete card'
        >
          <Trash2 className='w-3.5 h-3.5' />
        </button>
      </div>
    </div>
  );
}
