import { useEffect, useRef, useState } from 'react';
import { BookOpen, MoreVertical, Headphones, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { type Set } from '@/components/cards/SetCard';
import { Button } from '@/components/ui/button';
import DropdownMenu from '@/components/cards/DropdownMenu';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import SetNotificationSettingsDialog from '@/components/notifications/SetNotificationSettingsDialog';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

type RowProps = {
  set: Set;
  onAccess: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (set: Set) => void;
};

function SetTableRow({ set, onAccess, onDelete, onUpdate }: RowProps) {
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

  return (
    <tr
      className='group cursor-pointer transition-colors'
      style={{ borderBottom: '1px solid var(--pl-border)' }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.background =
          'var(--pl-bg-hover)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLTableRowElement).style.background =
          'transparent';
      }}
      onClick={() => {
        if (!showMenu && !showDeleteDialog && !showNotifDialog)
          onAccess(set.id);
      }}
    >
      {/* Title */}
      <td className='py-3 px-4'>
        <div className='flex items-center gap-3'>
          <div
            className='w-8 h-8 rounded-[8px] grid place-items-center flex-shrink-0'
            style={{
              background: 'var(--pl-accent-soft)',
              color: 'var(--pl-accent-strong)',
            }}
          >
            <BookOpen size={14} />
          </div>
          <div>
            <div
              className='text-[13.5px] font-[500]'
              style={{ color: 'var(--pl-text)' }}
            >
              {set.title}
            </div>
            {set.code && (
              <div
                className='text-[10.5px] mt-[1px]'
                style={{
                  fontFamily: 'var(--font-mono-pl)',
                  color: 'var(--pl-text-faint)',
                }}
              >
                {set.code}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Description */}
      <td className='py-3 px-4 max-w-[220px]'>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className='text-[12px] truncate cursor-default'
              style={{ color: 'var(--pl-text-muted)' }}
            >
              {set.description || t('modal.noDescription')}
            </div>
          </TooltipTrigger>
          {set.description && (
            <TooltipContent className='max-w-[280px] whitespace-normal'>
              {set.description}
            </TooltipContent>
          )}
        </Tooltip>
      </td>

      {/* Resources */}
      <td className='py-3 px-4'>
        <div
          className='flex items-center gap-3'
          style={{
            fontFamily: 'var(--font-mono-pl)',
            color: 'var(--pl-text-faint)',
            fontSize: '11px',
          }}
        >
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
      </td>

      {/* Created */}
      <td
        className='py-3 px-4 text-[11px]'
        style={{
          fontFamily: 'var(--font-mono-pl)',
          color: 'var(--pl-text-faint)',
          whiteSpace: 'nowrap',
        }}
      >
        {set.created_at}
      </td>

      {/* Updated */}
      <td
        className='py-3 px-4 text-[11px]'
        style={{
          fontFamily: 'var(--font-mono-pl)',
          color: 'var(--pl-text-faint)',
          whiteSpace: 'nowrap',
        }}
      >
        {set.updated_at}
      </td>

      {/* Actions */}
      <td className='py-3 px-4' onClick={(e) => e.stopPropagation()}>
        <div className='relative flex justify-end' ref={menuRef}>
          <Button
            variant='ghost'
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
            className='p-1 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity'
            style={{ color: 'var(--pl-text-faint)' }}
          >
            <MoreVertical size={14} />
          </Button>
          {showMenu && (
            <DropdownMenu
              onNotificationSettings={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                setTimeout(() => setShowNotifDialog(true), 0);
              }}
              onUpdate={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                onUpdate(set);
              }}
              onDelete={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                setShowDeleteDialog(true);
              }}
            />
          )}
        </div>
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={() => {
            onDelete(set.id);
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
      </td>
    </tr>
  );
}

type Props = {
  sets: Set[];
  onAccess: (id: number) => void;
  onDelete: (id: number) => void;
  onUpdate: (set: Set) => void;
};

export default function SetTableView({
  sets,
  onAccess,
  onDelete,
  onUpdate,
}: Props) {
  return (
    <div
      className='rounded-[12px] overflow-hidden mb-8'
      style={{
        border: '1px solid var(--pl-border)',
        background: 'var(--pl-bg-elev)',
      }}
    >
      <table className='w-full'>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--pl-border)' }}>
            {[
              'Title',
              'Description',
              'Resources',
              'Created',
              'Updated',
              '',
            ].map((col) => (
              <th
                key={col}
                className='py-2.5 px-4 text-left text-[10.5px] uppercase tracking-[0.1em]'
                style={{ color: 'var(--pl-text-faint)', fontWeight: 500 }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sets.map((set) => (
            <SetTableRow
              key={set.id}
              set={set}
              onAccess={onAccess}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
