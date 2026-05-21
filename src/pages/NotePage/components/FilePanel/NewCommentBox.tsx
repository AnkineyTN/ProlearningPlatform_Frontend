import { ImagePlus } from 'lucide-react';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import { useUploadImageFile } from '@/hooks/useImageUpload';
import {
  useFloatingCommentPosition,
  type Rect,
  type RegionCommentSavePayload,
} from '@/pages/NotePage/components/FilePanel/regionCommentUtils';

interface NewCommentBoxProps {
  rect: Rect;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onSave: (payload: RegionCommentSavePayload) => void;
  onCancel: () => void;
}

export function NewCommentBox({
  rect,
  overlayRef,
  onSave,
  onCancel,
}: NewCommentBoxProps) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState<{
    assetId: number;
    url: string;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImageFile();

  const pos = useFloatingCommentPosition(overlayRef, rect, true);

  const handleImageFile = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const r = await uploadImageMutation.mutateAsync(file);
      setAttachment({ assetId: r.assetId, url: r.url });
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.kind === 'file' && it.type.startsWith('image/')) {
        e.preventDefault();
        const f = it.getAsFile();
        if (f) void handleImageFile(f);
        break;
      }
    }
  };

  const canSave = !uploading && (text.trim().length > 0 || attachment != null);

  const submit = () => {
    if (!canSave) return;
    onSave({
      text: text.trim(),
      attachmentAssetId: attachment?.assetId,
      imageUrl: attachment?.url,
    });
  };

  return createPortal(
    <div
      className='w-72 max-w-[min(100vw-24px,288px)] rounded-lg shadow-lg border border-[var(--pl-border)] bg-[var(--pl-bg-elev)] text-[var(--pl-text)] p-3 max-h-[min(90vh,420px)] overflow-y-auto'
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        zIndex: 9999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className='text-xs font-medium text-[var(--pl-text-muted)] mb-2'>
        New comment
      </p>
      {attachment ? (
        <div className='relative mb-2 rounded-md overflow-hidden border border-[var(--pl-border)] bg-[var(--pl-bg-sunken)]'>
          <img
            src={attachment.url}
            alt='Attachment preview'
            className='w-full max-h-36 object-contain'
          />
          <button
            type='button'
            className='absolute top-1 right-1 rounded bg-[var(--pl-bg-elev)]/90 text-[var(--pl-text)] px-1.5 text-xs border border-[var(--pl-border)] hover:bg-[var(--pl-bg-hover)]'
            onClick={() => setAttachment(null)}
          >
            Remove image
          </button>
        </div>
      ) : null}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={(e) => {
          const f = e.target.files?.[0];
          void handleImageFile(f ?? null);
          e.target.value = '';
        }}
      />
      <div className='flex gap-1 mb-2'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-1 h-8 text-xs border-[var(--pl-border)] bg-[var(--pl-bg-elev)] text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)]'
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <ImagePlus className='w-3.5 h-3.5' />
          {uploading ? 'Uploading…' : 'Image'}
        </Button>
        <span className='text-[10px] text-[var(--pl-text-faint)] self-center'>
          or paste screenshot
        </span>
      </div>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onPaste={onPaste}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSave)
            submit();
          if (e.key === 'Escape') onCancel();
        }}
        placeholder='Comment… (optional if image). Ctrl+Enter to save'
        rows={3}
        className='w-full text-sm border border-[var(--pl-border)] rounded-md p-2 resize-none bg-[var(--pl-bg)] text-[var(--pl-text)] placeholder:text-[var(--pl-text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--pl-accent)] focus:border-[var(--pl-accent-border)]'
      />
      <div className='flex gap-2 mt-2 justify-end'>
        <Button
          type='button'
          variant='outline'
          size='sm'
          className='border-[var(--pl-border)] bg-[var(--pl-bg-elev)] text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)]'
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type='button' size='sm' disabled={!canSave} onClick={submit}>
          Save
        </Button>
      </div>
    </div>,
    document.body,
  );
}
