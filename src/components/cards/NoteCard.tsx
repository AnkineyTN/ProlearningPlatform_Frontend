import {
  Clock,
  FileText,
  Link2,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { cn } from '@/lib/utils';

export interface Note {
  id: number;
  title: string;
  description: string;
  privacy: string;
  timeAgo: string;
  created_at: string;
}

type Props = {
  note: Note;
  setId?: number;
  onAccess: (id: number) => void;
  onDelete?: (id: number) => void;
  onUpdate?: (note: Note) => void;
};

const NoteCard = ({ note, setId, onAccess, onDelete, onUpdate }: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleClick = () => {
    if (!showMenu && !showDeleteDialog) onAccess(note.id);
  };

  return (
    <div
      onClick={handleClick}
      className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] hover:border-[var(--pl-accent-border)] rounded-[14px] p-[18px] cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_oklch(0_0_0/0.08)] flex flex-col relative'
    >
      {/* Top row */}
      <div className='flex justify-between items-start mb-[14px]'>
        <div
          className='w-9 h-9 rounded-[9px] grid place-items-center shrink-0'
          style={{
            background:
              'oklch(var(--pl-accent-l) var(--pl-accent-c) var(--pl-accent-h) / 0.12)',
            color:
              'oklch(var(--pl-accent-l) var(--pl-accent-c) calc(var(--pl-accent-h) - 10))',
          }}
        >
          <FileText size={16} />
        </div>

        {/* More menu */}
        <div ref={menuRef} className='relative'>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
            className={cn(
              'w-7 h-7 rounded-[6px] grid place-items-center border-0 text-[var(--pl-text-faint)] cursor-pointer hover:bg-[var(--pl-bg-hover)]',
              showMenu ? 'bg-[var(--pl-bg-hover)]' : 'bg-transparent',
            )}
          >
            <MoreVertical size={14} />
          </button>

          {showMenu && (
            <div className='absolute top-[calc(100%+4px)] right-0 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[10px] p-1 z-50 min-w-[150px] shadow-[0_8px_20px_oklch(0_0_0/0.12)]'>
              {[
                {
                  label: t('common.edit'),
                  icon: Pencil,
                  action: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onUpdate?.(note);
                  },
                  danger: false,
                },
                {
                  label: t('common.copyLink'),
                  icon: Link2,
                  action: (e: React.MouseEvent) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    navigator.clipboard.writeText(
                      `${window.location.origin}/sets/${setId}/notes/${note.id}`,
                    );
                    toast.success(t('common.linkCopied'));
                  },
                  danger: false,
                },
                {
                  label: t('common.delete'),
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

      {/* Title */}
      <div
        style={{ fontFamily: 'var(--font-display)' }}
        className='text-[15px] font-semibold text-[var(--pl-text)] tracking-[-0.01em] mb-1 overflow-hidden text-ellipsis whitespace-nowrap'
      >
        {note.title}
      </div>

      {/* Description */}
      <div className='text-[12.5px] text-[var(--pl-text-muted)] flex-1 overflow-hidden line-clamp-2 leading-[1.5] mb-[14px]'>
        {note.description}
      </div>

      {/* Privacy badge */}
      <div className='mb-3'>
        <span
          className={cn(
            'text-[10px] font-semibold tracking-[0.1em] uppercase px-2 py-[3px] rounded-full',
            note.privacy === 'PUBLIC'
              ? 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
              : 'bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]',
          )}
        >
          {note.privacy === 'PUBLIC'
            ? t('list.filter.public')
            : t('list.filter.private')}
        </span>
      </div>

      {/* Footer */}
      <div className='flex justify-between items-center pt-3 border-t border-t-[var(--pl-border)] text-[11px] text-[var(--pl-text-faint)] tabular-nums'>
        <span className='flex items-center gap-[5px]'>
          <Clock size={10} /> {note.timeAgo}
        </span>
        <span>{note.created_at}</span>
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete?.(note.id);
          setShowDeleteDialog(false);
        }}
        title={t('modal.delete')}
        itemName={`"${note.title}"`}
      />
    </div>
  );
};

export default NoteCard;
