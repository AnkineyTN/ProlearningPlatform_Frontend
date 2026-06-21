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

const URL_REGEX = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

function renderTextWithLinks(text: string) {
  const parts = text.split(URL_REGEX);
  return parts.map((part, idx) => {
    if (!part) return null;
    const isUrl = /^(https?:\/\/|www\.)/i.test(part);
    if (!isUrl) return <span key={idx}>{part}</span>;
    const href = part.startsWith('http') ? part : `https://${part}`;
    return (
      <a
        key={idx}
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        onClick={(e) => e.stopPropagation()}
        className='text-[var(--pl-accent)] hover:text-[var(--pl-accent-strong)] underline break-words'
      >
        {part}
      </a>
    );
  });
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
      className='w-64 rounded-lg shadow-lg border border-[var(--pl-border)] bg-[var(--pl-bg-elev)] text-[var(--pl-text)] p-3'
      style={{
        position: 'fixed',
        left: pos.left,
        top: pos.top,
        zIndex: 9999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className='flex items-center justify-between gap-2 mb-2'>
        <p className='text-[10px] text-[var(--pl-text-muted)]'>
          {new Date(comment.createdAt).toLocaleString()}
        </p>
        <button
          type='button'
          onClick={onClose}
          className='text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] text-lg leading-none'
        >
          ×
        </button>
      </div>
      {comment.imageUrl ? (
        <div className='mb-2 rounded-md overflow-hidden border border-[var(--pl-border)] bg-[var(--pl-bg-sunken)]'>
          <img
            src={comment.imageUrl}
            alt='Comment attachment'
            className='w-full max-h-40 object-contain'
          />
        </div>
      ) : null}
      {comment.text ? (
        <p className='text-sm bg-[var(--pl-bg-sunken)] text-[var(--pl-text)] rounded-md px-3 py-2 whitespace-pre-wrap break-words'>
          {renderTextWithLinks(comment.text)}
        </p>
      ) : null}
      {!comment.text && !comment.imageUrl ? (
        <p className='text-xs text-[var(--pl-text-faint)]'>(Empty)</p>
      ) : null}
      <div className='flex justify-end mt-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='h-8 text-xs text-[var(--pl-danger,oklch(0.65_0.2_25))] hover:text-[var(--pl-danger,oklch(0.65_0.2_25))] hover:bg-[var(--pl-danger,oklch(0.65_0.2_25))]/10'
          onClick={() => onDelete(comment.id)}
        >
          Remove
        </Button>
      </div>
    </div>,
    document.body,
  );
}
