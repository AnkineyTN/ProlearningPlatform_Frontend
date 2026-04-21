import { SwatchBook, MoreVertical, Clock, Pencil, Trash2 } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { cn } from '@/lib/utils';

export interface Flashcard {
  id: number | string;
  title: string;
  description: string;
  time: string;
  created_at: string;
  privacy: 'PUBLIC' | 'PRIVATE';
}

type Props = {
  flashcard: Flashcard;
  onAccess: (id: number | string) => void;
  onUpdate: (flashcard: Flashcard) => void;
  onDelete: (flashcardId: number | string) => void;
};

const FlashCard = ({ flashcard, onAccess, onUpdate, onDelete }: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleClick = () => {
    if (!showMenu && !showDeleteDialog) onAccess(flashcard.id);
  };

  const mastery = 72;
  const masteryColor =
    mastery > 75
      ? 'oklch(0.72 0.15 155)'
      : mastery > 50
        ? 'var(--pl-accent)'
        : 'oklch(0.78 0.15 75)';

  return (
    <div
      onClick={handleClick}
      className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] hover:border-[var(--pl-accent-border)] rounded-[14px] p-[18px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_oklch(0_0_0/0.08)] relative flex flex-col'
    >
      {/* Top row */}
      <div className='flex justify-between items-start mb-[14px]'>
        <div className='w-9 h-9 rounded-[9px] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] grid place-items-center shrink-0'>
          <SwatchBook size={16} />
        </div>

        {/* More menu */}
        <div ref={menuRef} className='relative'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
            className={cn(
              'w-7 h-7 rounded-[6px] grid place-items-center border-0 text-[var(--pl-text-faint)] cursor-pointer transition-[background] duration-150 hover:bg-[var(--pl-bg-hover)]',
              showMenu ? 'bg-[var(--pl-bg-hover)]' : 'bg-transparent',
            )}
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <div className='absolute top-[calc(100%+4px)] right-0 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[10px] p-1 z-50 min-w-[130px] shadow-[0_8px_20px_oklch(0_0_0/0.12)]'>
              {[
                {
                  label: 'Edit',
                  icon: Pencil,
                  action: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onUpdate(flashcard);
                  },
                  danger: false,
                },
                {
                  label: 'Delete',
                  icon: Trash2,
                  action: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    setShowDeleteDialog(true);
                  },
                  danger: true,
                },
              ].map(({ label, icon: Icon, action, danger }) => (
                <button
                  key={label}
                  onClick={action}
                  className={cn(
                    'w-full flex items-center gap-2 px-[10px] py-[7px] rounded-[7px] text-[12.5px] bg-transparent border-0 cursor-pointer text-left',
                    danger
                      ? 'text-[oklch(0.65_0.2_25)] hover:bg-[oklch(0.65_0.2_25/0.08)]'
                      : 'text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)]',
                  )}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title & desc */}
      <div className='text-[15px] font-semibold text-[var(--pl-text)] tracking-[-0.01em] mb-1 overflow-hidden text-ellipsis whitespace-nowrap'>
        {flashcard.title}
      </div>
      <div className='text-[12.5px] text-[var(--pl-text-muted)] mb-[14px] overflow-hidden text-ellipsis whitespace-nowrap'>
        {flashcard.description}
      </div>

      {/* Mastery bar */}
      <div className='mb-[14px]'>
        <div className='flex justify-between text-[10px] text-[var(--pl-text-faint)] mb-[5px] tracking-[0.1em] uppercase'>
          <span>Mastery</span>
          <span className='tabular-nums text-[var(--pl-text-muted)]'>
            {mastery}%
          </span>
        </div>
        <div className='h-1 bg-[var(--pl-border)] rounded-full overflow-hidden'>
          <div
            className='h-full rounded-full'
            style={{ width: `${mastery}%`, background: masteryColor }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className='flex justify-between items-center pt-3 border-t border-t-[var(--pl-border)] text-[11px] text-[var(--pl-text-faint)] tabular-nums'>
        <span className='flex items-center gap-[5px]'>
          <Clock size={10} /> {flashcard.time}
        </span>
        <span>{flashcard.created_at}</span>
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete(flashcard.id);
          setShowDeleteDialog(false);
        }}
        title='Delete Flashcard'
        itemName={`"${flashcard.title}"`}
      />
    </div>
  );
};

export default FlashCard;
