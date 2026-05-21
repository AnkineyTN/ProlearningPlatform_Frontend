import axios from 'axios';
import { useState } from 'react';
import toast from 'react-hot-toast';

import {
  useUploadDocumentFile,
  useUploadImageFile,
} from '@/hooks/useImageUpload';
import { useSaveDocumentInNote, useSaveImageInNote } from '@/hooks/useNotes';
import { isBrowserImageFile } from '@/lib/utils';

export interface UploadedNoteFile {
  id: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
  kind: 'doc' | 'image';
}

interface UseNoteFileUploadParams {
  setId: number;
  noteId: number;
  onFileUploaded: (file: UploadedNoteFile) => void;
}

function extractUploadErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { error?: { message?: string }; message?: string }
      | undefined;
    const backendMsg = data?.error?.message ?? data?.message;
    if (backendMsg === 'Empty file') {
      return 'Upload failed: the file is empty (0 bytes).';
    }
    if (backendMsg) return `Upload failed: ${backendMsg}`;
  }
  return 'Failed to upload file';
}

const VALID_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
];

const VALID_EXT_FALLBACKS = new Set([
  '.pdf',
  '.doc',
  '.docx',
  '.pptx',
  '.txt',
]);

export function useNoteFileUpload({
  setId,
  noteId,
  onFileUploaded,
}: UseNoteFileUploadParams) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadDocumentMutation = useUploadDocumentFile();
  const uploadImageMutation = useUploadImageFile();
  const saveDocumentMutation = useSaveDocumentInNote();
  const saveImageMutation = useSaveImageInNote();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size === 0) {
      toast.error(
        `"${file.name}" is empty (0 bytes). Please pick another file.`,
      );
      event.target.value = '';
      return;
    }

    // Browsers sometimes hand us an empty `file.type` for less common
    // extensions — fall back to checking the extension itself.
    const extFallback = file.name.includes('.')
      ? `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`
      : '';

    const isImage = isBrowserImageFile(file);
    const isAcceptedDoc =
      VALID_DOC_TYPES.includes(file.type) ||
      VALID_EXT_FALLBACKS.has(extFallback);
    if (!isImage && !isAcceptedDoc) {
      toast.error(
        'Invalid file type. Please upload images, PDF, DOC, DOCX, PPTX, or TXT.',
      );
      return;
    }

    if (!setId || !noteId) {
      toast.error('Invalid note');
      return;
    }

    setIsUploading(true);
    try {
      if (isImage) {
        const result = await uploadImageMutation.mutateAsync(file);
        const ext = file.name.includes('.')
          ? file.name.split('.').pop() || ''
          : '';

        await saveImageMutation.mutateAsync({
          setId,
          data: {
            noteId,
            assetId: result.assetId,
            publicId: result.publicId,
            extension: ext,
            fileName: file.name,
          },
        });

        onFileUploaded({
          id: result.assetId,
          fileName: file.name,
          fileUrl: result.url,
          extension: ext,
          publicId: result.publicId,
          kind: 'image',
        });
      } else {
        const result = await uploadDocumentMutation.mutateAsync(file);

        const ext =
          result.extension ||
          (file.name.includes('.') ? file.name.split('.').pop() || '' : '');

        await saveDocumentMutation.mutateAsync({
          setId,
          data: {
            noteId,
            assetId: result.assetId,
            publicId: result.publicId,
            extension: ext,
            fileName: result.fileName,
          },
        });

        onFileUploaded({
          id: result.assetId,
          fileName: result.fileName,
          fileUrl: result.url,
          extension: ext,
          publicId: result.publicId,
          kind: 'doc',
        });
      }

      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error(extractUploadErrorMessage(error));
      console.error(error);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return { isUploading, handleFileUpload };
}
