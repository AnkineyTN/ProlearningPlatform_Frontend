import { FileX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import NoteCardSelect from '@/components/cards/NoteCardSelect';

import { type NoteListItem } from '@/services/types/note.types';

import { type NoteAIInput } from './types';
import { getTimeAgo } from './utils';

type Props = {
  notes: NoteListItem[];
  selectedNotes: NoteAIInput[];
  onToggle: (id: number, documentUrls: string[]) => void;
  onDocumentToggle: (noteId: number, docUrl: string) => void;
  disabled?: boolean;
};

const AINotesGrid = ({
  notes,
  selectedNotes,
  onToggle,
  onDocumentToggle,
  disabled,
}: Props) => {
  const { t } = useTranslation();

  const selectedNoteIds = selectedNotes.map((n) => n.note_id);

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
        {notes.map((note) => {
          const selectedNote = selectedNotes.find((n) => n.note_id === note.id);
          return (
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
                if (!disabled)
                  onToggle(note.id, note.noteDocs?.map((d) => d.fileUrl) ?? []);
              }}
              isSelected={selectedNoteIds.includes(note.id)}
              docs={note.noteDocs?.map((d) => ({
                fileUrl: d.fileUrl,
                fileName: d.fileName,
              }))}
              selectedDocUrls={selectedNote?.document_urls}
              onDocToggle={(fileUrl) => {
                if (!disabled) onDocumentToggle(note.id, fileUrl);
              }}
            />
          );
        })}
      </div>
      {selectedNoteIds.length > 0 && (
        <p className='text-xs text-muted-foreground mt-2.5'>
          {selectedNoteIds.length} {t('modal.ai.selected')}
        </p>
      )}
    </>
  );
};

export default AINotesGrid;
