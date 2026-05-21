import { PanelRightClose } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import type { NoteFileRegionCommentDto } from '@/services/types/note.types';

import { NoteFileRow } from '@/pages/NotePage/components/FilePanel/NoteFileRow';
import type { NoteAttachedFile } from '@/pages/NotePage/components/FilePanel/NoteFileRegionComments';

export type {
  NoteAttachedFile,
  NoteFileRegionCommentPayload,
} from '@/pages/NotePage/components/FilePanel/NoteFileRegionComments';

interface NoteFilesPanelProps {
  noteId: number;
  /** From note detail (`setId`). When 0, region comments stay local-only. */
  setId: number;
  fileComments: NoteFileRegionCommentDto[];
  files: NoteAttachedFile[];
  onFileSummarize: (summary: string, fileName: string) => void;
  onFileDeleted: (fileId: number) => void;
  onClosePanel: () => void;
}

export const NoteFilesPanel = ({
  noteId,
  setId,
  fileComments,
  files,
  onFileSummarize,
  onFileDeleted,
  onClosePanel,
}: NoteFilesPanelProps) => {
  const commentsByAsset = useMemo(() => {
    const m = new Map<number, NoteFileRegionCommentDto[]>();
    for (const c of fileComments) {
      const arr = m.get(c.noteAssetId) ?? [];
      arr.push(c);
      m.set(c.noteAssetId, arr);
    }
    return m;
  }, [fileComments]);

  return (
    <div className='w-full h-full overflow-hidden flex flex-col bg-[var(--pl-bg)] border-l border-border'>
      <div className='px-4 py-3 border-b border-border flex items-center justify-between gap-2 shrink-0'>
        <div className='flex items-baseline gap-2 min-w-0'>
          <h3 className='font-[family-name:var(--font-display)] text-base font-medium tracking-tight truncate text-[var(--pl-text)]'>
            Documents
          </h3>
          <span className='text-[10px] tracking-[0.18em] uppercase text-[var(--pl-text-faint)] font-[family-name:var(--font-mono-pl)]'>
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </span>
        </div>
        <Button
          type='button'
          size='sm'
          variant='ghost'
          className='shrink-0 gap-1 h-8 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
          onClick={onClosePanel}
          aria-label='Hide documents panel'
        >
          <PanelRightClose className='w-4 h-4' />
          <span className='hidden sm:inline text-xs'>Hide</span>
        </Button>
      </div>

      <div className='flex-1 overflow-y-auto'>
        {files.map((f) => (
          <NoteFileRow
            key={`${f.id}-${f.publicId}`}
            file={f}
            noteId={noteId}
            setId={setId}
            serverComments={commentsByAsset.get(f.id) ?? []}
            onFileSummarize={onFileSummarize}
            onDeleted={() => onFileDeleted(f.id)}
          />
        ))}
      </div>
    </div>
  );
};
