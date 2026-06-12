import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { BlockNoteEditor } from '@blocknote/core';
import { FileText, Loader2, Upload, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useImportNoteFromFile } from '@/hooks/useNotes';

import PrivacyCards from './create-modal/PrivacyCards';

const ACCEPTED_EXTENSIONS = ['.md', '.markdown', '.txt'];

const isAcceptedFile = (file: File) =>
  ACCEPTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext));

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const titleFromFileName = (fileName: string) => {
  const base = fileName.replace(/\.(md|markdown|txt)$/i, '').trim();
  return (base || fileName).slice(0, 99);
};

type Props = {
  setId: number;
  isOpen: boolean;
  onClose: () => void;
};

const UploadNoteModal = ({ setId, isOpen, onClose }: Props) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [privacy, setPrivacy] = useState('Public');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const importNoteMutation = useImportNoteFromFile();

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const accepted: File[] = [];
      for (const file of Array.from(incoming)) {
        if (!isAcceptedFile(file)) {
          toast.warning(t('set.upload.invalidType', { fileName: file.name }));
          continue;
        }
        accepted.push(file);
      }
      if (accepted.length === 0) return;
      setFiles((prev) => {
        const next = [...prev];
        for (const file of accepted) {
          if (!next.some((f) => f.name === file.name && f.size === file.size)) {
            next.push(file);
          }
        }
        return next;
      });
    },
    [t],
  );

  const removeFile = (target: File) =>
    setFiles((prev) => prev.filter((f) => f !== target));

  const reset = () => {
    setFiles([]);
    setPrivacy('Public');
    setIsDragging(false);
  };

  const handleClose = () => {
    if (isUploading) return;
    reset();
    onClose();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (files.length === 0 || isUploading) return;
    setIsUploading(true);

    // Headless editor used only to convert markdown to BlockNote blocks,
    // the format NoteEditor hydrates from.
    const parser = BlockNoteEditor.create();
    let created = 0;

    for (const file of files) {
      try {
        const text = await file.text();
        const title = titleFromFileName(file.name);
        const blocks = await parser.tryParseMarkdownToBlocks(text);

        await importNoteMutation.mutateAsync({
          setId,
          title,
          description: t('set.upload.importedFrom', { fileName: file.name }),
          privacy: privacy.toUpperCase(),
          content: blocks.length > 0 ? JSON.stringify(blocks) : '',
        });
        created += 1;
      } catch (error) {
        console.error('Failed to import note from file:', file.name, error);
      }
    }

    setIsUploading(false);

    const failed = files.length - created;
    if (created > 0) {
      toast.success(t('set.upload.success', { count: created }));
      reset();
      onClose();
    }
    if (failed > 0) {
      toast.error(
        created > 0
          ? t('set.upload.partialFail', { failed, total: files.length })
          : t('set.upload.fail'),
      );
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
    >
      <DialogContent
        className='gap-0 px-8 py-7 w-full max-w-2xl sm:max-w-2xl'
        showCloseButton={!isUploading}
        onEscapeKeyDown={(e) => {
          if (isUploading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isUploading) e.preventDefault();
        }}
      >
        <DialogHeader className='gap-1.5 mb-5'>
          <DialogTitle className='text-2xl font-bold'>
            {t('set.upload.title')}
          </DialogTitle>
          <p
            className='text-sm text-muted-foreground italic'
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            {t('set.upload.subtitle')}
          </p>
        </DialogHeader>

        <div className='space-y-5'>
          <div
            role='button'
            tabIndex={0}
            onClick={() => {
              if (!isUploading) inputRef.current?.click();
            }}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !isUploading) {
                e.preventDefault();
                inputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (!isUploading) setIsDragging(true);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setIsDragging(false);
              }
            }}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed px-6 py-10 text-center transition-colors',
              isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
              isDragging
                ? 'border-[var(--pl-accent)] bg-[var(--pl-accent-soft)]'
                : 'border-[var(--pl-border-strong)] bg-[var(--pl-bg-sunken)] hover:border-[var(--pl-accent-border)] hover:bg-[var(--pl-accent-soft-2)]',
            )}
          >
            <div className='w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--pl-accent-soft)]'>
              <Upload className='w-4 h-4 text-[var(--pl-accent)]' />
            </div>
            <p className='text-sm font-medium'>{t('set.upload.dropzone')}</p>
            <p className='text-xs text-muted-foreground'>
              {t('set.upload.dropzoneHint')}
            </p>
            <input
              ref={inputRef}
              type='file'
              accept='.md,.markdown,.txt,text/markdown,text/plain'
              multiple
              className='hidden'
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files);
                e.target.value = '';
              }}
            />
          </div>

          {files.length > 0 && (
            <div>
              <p className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2'>
                {t('set.upload.selectedFiles')}
              </p>
              <ul className='space-y-2 max-h-44 overflow-y-auto pr-1'>
                {files.map((file) => (
                  <li
                    key={`${file.name}-${file.size}`}
                    className='flex items-center gap-3 rounded-[14px] border border-[var(--pl-border)] bg-[var(--pl-bg-elev)] px-3.5 py-2.5'
                  >
                    <FileText className='w-4 h-4 shrink-0 text-[var(--pl-accent)]' />
                    <span className='flex-1 truncate text-sm'>{file.name}</span>
                    <span className='text-xs text-muted-foreground shrink-0'>
                      {formatSize(file.size)}
                    </span>
                    <button
                      type='button'
                      aria-label={t('set.upload.removeFile')}
                      disabled={isUploading}
                      onClick={() => removeFile(file)}
                      className='shrink-0 text-muted-foreground hover:text-[var(--pl-danger)] transition-colors cursor-pointer disabled:opacity-50'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <PrivacyCards value={privacy} onChange={setPrivacy} />

          <div className='flex justify-end gap-3 pt-1'>
            <Button variant='ghost' onClick={handleClose} disabled={isUploading}>
              {t('modal.cancel')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={files.length === 0 || isUploading}
              className='font-semibold gap-1.5'
            >
              {isUploading ? (
                <>
                  <Loader2 className='w-4 h-4 animate-spin' />
                  {t('set.upload.uploading')}
                </>
              ) : (
                t('set.upload.cta', { count: files.length })
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadNoteModal;
