import {
  BookOpen,
  Clock,
  FileText,
  FilePen,
  MoreVertical,
  SwatchBook,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import SetNotificationSettingsDialog from '@/components/notifications/SetNotificationSettingsDialog';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import DropdownMenu from './DropdownMenu';

export type Set = {
  id: number;
  title: string;
  description: string;
  numNotes: number;
  numFlashcards: number;
  numExams: number;
  privacy?: 'PUBLIC' | 'PRIVATE';
  code: string;
  duration: string;
  progress: number;
  updated_at: string;
  created_at: string;
};

type Props = {
  set: Set;
  onAccess: (id: number) => void;
  onDelete?: (id: number) => void;
  onUpdate?: (set: Set) => void;
};

const SetCard = ({ set, onAccess, onDelete, onUpdate }: Props) => {
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNotifDialog, setShowNotifDialog] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // const progress = Math.min(100, Math.max(0, set.progress ?? 0));
  // const progressColor =
  //   progress >= 75
  //     ? 'var(--pl-success)'
  //     : progress >= 40
  //       ? 'var(--pl-accent)'
  //       : 'var(--pl-warning)';

  return (
    <div
      className='group relative cursor-pointer rounded-[14px] p-[18px] transition-all duration-200 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] hover:border-[var(--pl-accent-border)] hover:-translate-y-0.5'
      onClick={() => {
        if (!showMenu && !showDeleteDialog && !showNotifDialog)
          onAccess(set.id);
      }}
    >
      {/* Top row */}
      <div className='flex justify-between items-start mb-[14px]'>
        <div
          className='w-9 h-9 rounded-[9px] grid place-items-center'
          style={{
            background: 'var(--pl-accent-soft)',
            color: 'var(--pl-accent-strong)',
          }}
        >
          <BookOpen size={16} />
        </div>

        <div className='relative' ref={menuRef}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
            variant='ghost'
            size='xs'
            className='text-[var(--pl-text-muted)] hover:text-[var(--pl-accent)] w-7 rounded-md'
          >
            <MoreVertical size={14} />
          </Button>
          {showMenu && (
            <DropdownMenu
              onNotificationSettings={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                // Wait one tick so the menu close doesn't swallow the open.
                setTimeout(() => setShowNotifDialog(true), 0);
              }}
              onUpdate={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onUpdate?.(set);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                setShowDeleteDialog(true);
              }}
              onCopyLink={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                navigator.clipboard.writeText(
                  `${window.location.origin}/sets/${set.id}`,
                );
                toast.success(t('common.linkCopied'));
              }}
            />
          )}
        </div>
      </div>

      {/* Title */}
      <div
        className='text-[19px] font-[400] leading-snug mb-1 overflow-hidden text-ellipsis whitespace-nowrap'
        style={{
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.015em',
          color: 'var(--pl-text)',
        }}
      >
        {set.title}
      </div>

      {/* Privacy badge */}
      {set.privacy && (
        <div className='mb-3'>
          <span
            className={cn(
              'text-[10px] font-semibold tracking-[0.1em] uppercase px-2 py-[3px] rounded-full',
              set.privacy === 'PUBLIC'
                ? 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
                : 'bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]',
            )}
          >
            {set.privacy === 'PUBLIC'
              ? t('list.filter.public')
              : t('list.filter.private')}
          </span>
        </div>
      )}

      {/* Description */}
      <div
        className='text-[12.5px] mb-[14px] line-clamp-2 cursor-default h-9 break-words'
        style={{ color: 'var(--pl-text-muted)' }}
      >
        {set.description || t('modal.noDescription')}
      </div>

      {/* Stats + Footer */}
      <div
        className='flex justify-between items-center pt-3 text-[11px]'
        style={{
          borderTop: '1px solid var(--pl-border)',
          fontFamily: 'var(--font-mono-pl)',
          color: 'var(--pl-text-faint)',
        }}
      >
        <div className='flex items-center gap-4'>
          <span className='flex items-center gap-1'>
            <FileText size={10} /> {set.numNotes}
          </span>
          <span className='flex items-center gap-1'>
            <SwatchBook size={10} /> {set.numFlashcards}
          </span>
          <span className='flex items-center gap-1'>
            <FilePen size={10} /> {set.numExams}
          </span>
        </div>
        <span className='flex items-center gap-1'>
          <Clock size={10} /> {set.updated_at}
        </span>
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDelete?.(set.id);
          setShowDeleteDialog(false);
        }}
        title={t('modal.deleteConfirmationTitle')}
        itemName={`"${set.title}"`}
      />

      <SetNotificationSettingsDialog
        open={showNotifDialog}
        setId={set.id}
        setTitle={set.title}
        onOpenChange={setShowNotifDialog}
      />
    </div>
  );
};

export default SetCard;
