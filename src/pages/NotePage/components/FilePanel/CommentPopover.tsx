import { createPortal } from 'react-dom';

import { Button } from '@/components/ui/button';
import {
  useFloatingCommentPosition,
  type RegionComment,
} from '@/pages/NotePage/components/FilePanel/regionCommentUtils';

interface CommentPopoverProps {
  comment: RegionComment;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function CommentPopover({
  comment,
  overlayRef,
  onClose,
  onDelete,
}: CommentPopoverProps) {
  const pos = useFloatingCommentPosition(overlayRef, comment.rect, true);
  return createPortal(
    <div
      className='w-64 rounded-lg shadow-lg border bg-popover text-popover-foreground p-3'
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        zIndex: 9999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className='flex items-center justify-between gap-2 mb-2'>
        <p className='text-[10px] text-muted-foreground'>
          {new Date(comment.createdAt).toLocaleString()}
        </p>
        <button
          type='button'
          onClick={onClose}
          className='text-muted-foreground hover:text-foreground text-lg leading-none'
        >
          ×
        </button>
      </div>
      {comment.imageUrl ? (
        <div className='mb-2 rounded-md overflow-hidden border bg-muted/30'>
          <img
            src={comment.imageUrl}
            alt='Comment attachment'
            className='w-full max-h-40 object-contain'
          />
        </div>
      ) : null}
      {comment.text ? (
        <p className='text-sm bg-muted/50 rounded-md px-3 py-2'>
          {comment.text}
        </p>
      ) : null}
      {!comment.text && !comment.imageUrl ? (
        <p className='text-xs text-muted-foreground'>(Empty)</p>
      ) : null}
      <div className='flex justify-end mt-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='text-destructive hover:text-destructive h-8 text-xs'
          onClick={() => onDelete(comment.id)}
        >
          Remove
        </Button>
      </div>
    </div>,
    document.body,
  );
}
