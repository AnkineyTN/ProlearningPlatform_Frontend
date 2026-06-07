import type { RegionComment } from '@/pages/NotePage/components/FilePanel/regionCommentUtils';

interface CommentPinProps {
  comment: RegionComment;
  isActive: boolean;
  onClick: () => void;
}

export function CommentPin({ comment, isActive, onClick }: CommentPinProps) {
  return (
    <>
      <div
        role='button'
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={`absolute rounded cursor-pointer transition-all z-10 border-2 pointer-events-auto ${
          isActive
            ? 'border-[var(--pl-warning)] bg-[var(--pl-warning)]/30'
            : 'border-[var(--pl-warning)]/60 bg-[var(--pl-warning)]/25 hover:bg-[var(--pl-warning)]/40'
        }`}
        style={{
          left: `${comment.rect.x}%`,
          top: `${comment.rect.y}%`,
          width: `${comment.rect.width}%`,
          height: `${comment.rect.height}%`,
        }}
      />
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`absolute z-20 w-6 h-6 rounded-full text-xs shadow-md transition-transform hover:scale-110 flex items-center justify-center text-white pointer-events-auto ${
          isActive ? 'bg-[var(--pl-warning)] scale-110' : 'bg-[var(--pl-warning)]/85'
        }`}
        style={{
          left: `calc(${comment.rect.x + comment.rect.width}% + 4px)`,
          top: `${comment.rect.y}%`,
        }}
      >
        💬
      </button>
    </>
  );
}
