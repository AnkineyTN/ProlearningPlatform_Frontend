import {
  BookOpen,
  Clock,
  FileText,
  Headphones,
  MoreVertical,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import SetNotificationSettingsDialog from '@/components/notifications/SetNotificationSettingsDialog';

import { Button } from '../ui/button';
import DropdownMenu from './DropdownMenu';

export type Set = {
  id: number;
  title: string;
  description: string;
  numNotes: number;
  code: string;
  duration: string;
  flashcards: number;
  tests: number;
  audio: number;
  video: string | number;
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
      className='group relative rounded-[14px] p-[18px] cursor-pointer transition-all duration-200'
      style={{
        background: 'var(--pl-bg-elev)',
        border: '1px solid var(--pl-border)',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          'var(--pl-accent-border)';
        (e.currentTarget as HTMLDivElement).style.transform =
          'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          'var(--pl-border)';
        (e.currentTarget as HTMLDivElement).style.transform = 'none';
      }}
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
            className='p-1 rounded cursor-pointer'
            style={{ color: 'var(--pl-text-faint)' }}
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

      {/* Description */}
      <div
        className='text-[12.5px] mb-[14px] line-clamp-2 cursor-default'
        style={{ color: 'var(--pl-text-muted)' }}
      >
        {set.description || t('modal.noDescription')}
      </div>

      {/* Progress bar */}
      {/* <div className='mb-[14px]'>
        <div
          className='flex justify-between text-[10.5px] mb-[5px]'
          style={{
            color: 'var(--pl-text-faint)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          <span>Progress</span>
          <span
            style={{
              fontFamily: 'var(--font-mono-pl)',
              color: 'var(--pl-text-muted)',
            }}
          >
            {progress}%
          </span>
        </div>
        <div
          className='h-1 rounded-full overflow-hidden'
          style={{ background: 'var(--pl-border)' }}
        >
          <div
            className='h-full rounded-full transition-all'
            style={{ width: `${progress}%`, background: progressColor }}
          />
        </div>
      </div> */}

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
          {set.flashcards > 0 && (
            <span className='flex items-center gap-1'>
              <FileText size={10} /> {set.flashcards}
            </span>
          )}
          {set.numNotes > 0 && (
            <span className='flex items-center gap-1'>
              <FileText size={10} /> {set.numNotes}
            </span>
          )}
          {set.tests > 0 && (
            <span className='flex items-center gap-1'>
              <FileText size={10} /> {set.tests}
            </span>
          )}
          {set.audio > 0 && (
            <span className='flex items-center gap-1'>
              <Headphones size={10} /> {set.audio}
            </span>
          )}
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
