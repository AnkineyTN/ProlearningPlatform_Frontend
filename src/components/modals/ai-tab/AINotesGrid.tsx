import { FileX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import NoteCardSelect from '@/components/cards/NoteCardSelect';
import { useNotesBySet } from '@/hooks/useNotes';

import { getTimeAgo } from './utils';

type Props = {
  setId: number;
  selectedIds: number[];
  onToggle: (id: number) => void;
  disabled?: boolean;
};

const AINotesGrid = ({ setId, selectedIds, onToggle, disabled }: Props) => {
  const { t } = useTranslation();
  const { data: notesData } = useNotesBySet(setId, { page: 0, size: 12 });
  const notes = notesData?.items || [];

  if (notes.length === 0) {
    return (
      <div className='flex flex-col justify-center items-center py-10 gap-2 rounded-lg border border-dashed border-border bg-[var(--pl-bg-sunken)]'>
        <FileX className='text-muted-foreground w-10 h-10' />
        <div className='text-muted-foreground text-sm'>
          {t('modal.ai.noNotes', { defaultValue: 'No notes found' })}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
        {notes.map((note) => (
          <NoteCardSelect
            key={note.id}
            note={{
              id: note.id,
              title: note.title,
              description:
                note.description ||
                t('modal.noDescription', {
                  defaultValue: 'No description available...',
                }),
              privacy: note.privacy,
              timeAgo: getTimeAgo(note.updated_at),
              created_at: new Date(note.created_at).toLocaleDateString(
                'en-GB',
                { day: '2-digit', month: 'short', year: 'numeric' },
              ),
            }}
            onSelected={() => {
              if (!disabled) onToggle(note.id);
            }}
            isSelected={selectedIds.includes(note.id)}
          />
        ))}
      </div>
      {selectedIds.length > 0 && (
        <p className='text-xs text-muted-foreground mt-2.5'>
          {selectedIds.length} {t('modal.ai.selected')}
        </p>
      )}
    </>
  );
};

export default AINotesGrid;
