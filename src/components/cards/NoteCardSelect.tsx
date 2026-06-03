import { FileText, Clock, File } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Checkbox } from '@/components/ui/checkbox';

export interface NoteDoc {
  fileUrl: string;
  fileName: string;
}

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
  onSelected: (id: number) => void;
  isSelected?: boolean;
  docs?: NoteDoc[];
  selectedDocUrls?: string[];
  onDocToggle?: (fileUrl: string) => void;
};

const NoteCardSelect = ({
  note,
  onSelected,
  isSelected,
  docs,
  selectedDocUrls,
  onDocToggle,
}: Props) => {
  const { t } = useTranslation();
  const [checked, setChecked] = useState(isSelected);

  const handleCheckedChange = (val: boolean) => {
    setChecked(!!val);
    onSelected(note.id);
  };

  const hasDocs = docs && docs.length > 0;

  return (
    <div
      className={`rounded-xl shadow-sm border ${checked ? 'bg-[var(--pl-bg-hover)] border-[var(--pl-accent-border)]' : 'bg-[var(--pl-bg-elev)] border-[var(--pl-border)]'}`}
    >
      <div
        className='p-5 cursor-pointer'
        onClick={() => handleCheckedChange(!checked)}
      >
        <div className='flex justify-between items-start mb-3'>
          <FileText className='w-5 h-5' />
          <Checkbox checked={checked} />
        </div>

        <h2
          className='font-semibold mb-1'
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {note.title}
        </h2>
        <p className='text-sm text-muted-foreground mb-4'>{note.description}</p>
        <div className='flex justify-between items-center text-xs text-muted-foreground'>
          <span className='flex items-center gap-1'>
            <Clock className='w-3 h-3' /> {note.timeAgo}
          </span>
          <span>{note.created_at}</span>
        </div>
      </div>

      {checked && hasDocs && (
        <div
          className='border-t border-[var(--pl-border)] px-5 py-3 space-y-2'
          onClick={(e) => e.stopPropagation()}
        >
          <p className='text-[10px] font-semibold tracking-[0.1em] uppercase text-muted-foreground mb-2'>
            {t('modal.ai.noteDocuments', { defaultValue: 'Documents' })}
          </p>
          {docs!.map((doc) => (
            <label key={doc.fileUrl} className='flex items-center gap-2 cursor-pointer'>
              <Checkbox
                checked={selectedDocUrls?.includes(doc.fileUrl) ?? false}
                onCheckedChange={() => onDocToggle?.(doc.fileUrl)}
              />
              <File className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
              <span className='text-xs text-muted-foreground truncate'>{doc.fileName}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteCardSelect;
