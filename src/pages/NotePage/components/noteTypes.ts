import { isImageExtension } from '@/lib/utils';
import type { NoteDocItem } from '@/services/types/note.types';

export interface UploadedFile {
  id: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
  kind: 'doc' | 'image';
}

export interface AISummary {
  id: string;
  /** Backend explain ID — present for persisted AI explains, absent for session-only file summaries */
  backendId?: number;
  query: string;
  response: string;
  type: 'text' | 'file';
}

export function noteItemToUploadedFile(
  doc: NoteDocItem,
  kind: UploadedFile['kind'],
): UploadedFile {
  const ext = doc.fileName.includes('.')
    ? doc.fileName.split('.').pop() || ''
    : '';
  return {
    id: doc.assetId,
    fileName: doc.fileName,
    fileUrl: doc.fileUrl,
    extension: ext,
    publicId: doc.publicId,
    kind,
  };
}

export function attachmentKey(f: UploadedFile) {
  return `${f.id}-${f.publicId}`;
}

export function inferKindFromNoteDoc(doc: NoteDocItem): UploadedFile['kind'] {
  const ext = doc.fileName.includes('.')
    ? doc.fileName.split('.').pop() || ''
    : '';
  return isImageExtension(ext) ? 'image' : 'doc';
}
