import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  LoaderCircle,
  MessageSquarePlus,
  PanelRightClose,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  useDeleteNoteDoc,
  useDeleteNoteImg,
  useSummarizeFile,
} from '@/hooks/useNotes';
import { isImageExtension, mapI18nToAiApiLanguage } from '@/lib/utils';
import { noteAPI } from '@/services/endpoints/notes';
import type { NoteFileRegionCommentDto } from '@/services/types/note.types';

import {
  fileRegionCommentDtoToRegion,
  RegionCommentOverlay,
} from '@/pages/NotePage/NoteFileRegionComments';
import type {
  NoteAttachedFile,
  RegionComment,
  RegionCommentSavePayload,
} from '@/pages/NotePage/NoteFileRegionComments';

export type {
  NoteAttachedFile,
  NoteFileRegionCommentPayload,
} from '@/pages/NotePage/NoteFileRegionComments';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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

function NoteFileRow({
  file,
  noteId,
  setId,
  serverComments,
  onFileSummarize,
  onDeleted,
}: {
  file: NoteAttachedFile;
  noteId: number;
  setId: number;
  serverComments: NoteFileRegionCommentDto[];
  onFileSummarize: (summary: string, fileName: string) => void;
  onDeleted: () => void;
}) {
  const { i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState(520);
  const pdfWrapRef = useRef<HTMLDivElement>(null);
  const summarizeFileMutation = useSummarizeFile();
  const deleteNoteDocMutation = useDeleteNoteDoc();
  const deleteNoteImgMutation = useDeleteNoteImg();

  const [isCommentMode, setIsCommentMode] = useState(false);
  const [comments, setComments] = useState<RegionComment[]>([]);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentSaving, setCommentSaving] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const { fileName, fileUrl, extension, publicId, id: fileId } = file;
  const kind = file.kind ?? (isImageExtension(extension) ? 'image' : 'doc');
  const isPdf = extension.toLowerCase() === 'pdf';
  const isImage = kind === 'image' || isImageExtension(extension);
  const canRegionComment = isPdf || (isImage && !isPdf);

  useEffect(() => {
    setNumPages(null);
    setPreviewError(null);
  }, [fileUrl]);

  useEffect(() => {
    if (!isPdf || !open) return;
    const el = pdfWrapRef.current;
    if (!el) return;
    const update = () =>
      setPageWidth(Math.max(240, Math.floor(el.getBoundingClientRect().width)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isPdf, fileUrl, open]);

  useEffect(() => {
    setComments(serverComments.map(fileRegionCommentDtoToRegion));
  }, [serverComments]);

  useEffect(() => {
    if (!isCommentMode || !open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCommentMode(false);
        setActiveCommentId(null);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [isCommentMode, open]);

  const invalidateFileComments = useCallback(() => {
    if (setId && noteId) {
      void queryClient.invalidateQueries({
        queryKey: ['note', noteId, 'file-region-comments', setId],
      });
    }
  }, [queryClient, setId, noteId]);

  const persistComment = useCallback(
    async (
      pageNumber: number,
      rect: RegionComment['rect'],
      payload: RegionCommentSavePayload,
    ) => {
      const trimmed = payload.text.trim();
      if (!trimmed && !payload.attachmentAssetId) return;
      setIsCommentMode(false);
      setActiveCommentId(null);
      if (!setId) {
        toast.error(
          'Missing set context — cannot save comment (need setId on note detail).',
        );
        return;
      }
      setCommentSaving(true);
      try {
        await noteAPI.createFileRegionComment(setId, noteId, {
          noteAssetId: fileId,
          kind,
          pageNumber,
          rectPercent: { ...rect },
          content: trimmed,
          ...(payload.attachmentAssetId != null
            ? { attachmentAssetId: payload.attachmentAssetId }
            : {}),
          publicId,
        });
        invalidateFileComments();
        toast.success('Comment saved');
      } catch (e) {
        console.error(e);
        toast.error('Failed to save comment');
      } finally {
        setCommentSaving(false);
      }
    },
    [fileId, invalidateFileComments, kind, noteId, publicId, setId],
  );

  const deleteComment = async (id: string) => {
    const serverNumeric = /^\d+$/.test(id) ? Number(id) : NaN;
    if (!Number.isNaN(serverNumeric) && setId) {
      try {
        await noteAPI.deleteFileRegionComment(setId, noteId, serverNumeric);
        invalidateFileComments();
        toast.success('Comment removed');
      } catch (e) {
        console.error(e);
        toast.error('Failed to delete comment');
        return;
      }
    }
    setActiveCommentId(null);
  };

  const handleSummarize = async () => {
    try {
      const response = await summarizeFileMutation.mutateAsync({
        setId,
        data: {
          language: mapI18nToAiApiLanguage(i18n.language),
          limit: 0,
          file_url: fileUrl,
        },
      });

      const summary = response.data.data.summary;
      onFileSummarize(summary, fileName);
      toast.success('File summarized successfully');
    } catch (error) {
      toast.error('Failed to summarize file');
      console.error(error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!setId || !noteId) {
      toast.error('Invalid note');
      return;
    }
    setIsDeleting(true);
    try {
      if (kind === 'image') {
        await deleteNoteImgMutation.mutateAsync({
          setId,
          data: {
            noteId,
            fileUrl,
          },
        });
      } else {
        await deleteNoteDocMutation.mutateAsync({
          setId,
          data: {
            noteId,
            assetId: fileId,
            publicId,
            extension,
          },
        });
      }

      onDeleted();
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error('Failed to delete file');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className='border-b border-border last:border-b-0'
    >
      <div className='flex items-center gap-1 px-3 py-2 hover:bg-[var(--pl-bg-hover)] transition-colors'>
        <CollapsibleTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='flex-1 min-w-0 h-auto py-2 px-2 justify-start gap-2.5 font-normal hover:bg-transparent'
          >
            {open ? (
              <ChevronDown className='w-4 h-4 shrink-0 text-[var(--pl-text-faint)]' />
            ) : (
              <ChevronRight className='w-4 h-4 shrink-0 text-[var(--pl-text-faint)]' />
            )}
            <FileText className='w-4 h-4 shrink-0 text-[var(--pl-accent)]' />
            <span className='truncate text-sm font-medium text-left text-[var(--pl-text)]'>
              {fileName}
            </span>
            <span className='text-[10px] tracking-[0.14em] uppercase text-[var(--pl-text-faint)] shrink-0 font-[family-name:var(--font-mono-pl)]'>
              {extension.toUpperCase()}
            </span>
          </Button>
        </CollapsibleTrigger>
        <Button
          size='sm'
          variant='ghost'
          className='shrink-0 h-8 w-8 p-0 text-[var(--pl-text-faint)] hover:text-[var(--text-error)] hover:bg-[var(--bg-error)]'
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label='Delete file'
        >
          {isDeleting ? (
            <LoaderCircle className='w-4 h-4 animate-spin' />
          ) : (
            <Trash2 className='w-4 h-4' />
          )}
        </Button>
      </div>

      <CollapsibleContent>
        <div className='px-3 py-2'>
          <Card className='p-2 bg-[var(--pl-bg)] shadow-none gap-4'>
            {previewError && (
              <div className='rounded-md border border-[var(--border-error)] bg-[var(--bg-error)] p-3 flex flex-col gap-2'>
                <div className='flex items-start gap-2 text-[var(--text-error)]'>
                  <AlertTriangle className='w-4 h-4 shrink-0 mt-0.5' />
                  <div className='text-xs leading-relaxed'>
                    <p className='font-medium'>Could not load preview</p>
                    <p className='text-[var(--pl-text-muted)] mt-0.5 break-words'>
                      {previewError}
                    </p>
                  </div>
                </div>
                <a
                  href={fileUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--pl-accent)] hover:underline'
                >
                  <ExternalLink className='w-3.5 h-3.5' />
                  Open file in new tab
                </a>
              </div>
            )}

            {isPdf && !previewError && (
              <div
                ref={pdfWrapRef}
                data-note-file-scroll
                className='rounded-md border border-border bg-[var(--pl-bg-sunken)] overflow-y-auto max-h-[calc(100vh-380px)] overflow-x-auto'
              >
                <Document
                  file={fileUrl}
                  loading={
                    <div className='flex justify-center py-12'>
                      <LoaderCircle className='w-8 h-8 animate-spin text-muted-foreground' />
                    </div>
                  }
                  onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                  onLoadError={(error) => {
                    const message =
                      error?.message ?? 'Unknown error rendering PDF';
                    setPreviewError(message);
                    toast.error('Could not load PDF preview');
                    console.error('PDF load error', error);
                  }}
                  onSourceError={(error) => {
                    const message =
                      error?.message ?? 'Failed to fetch PDF file';
                    setPreviewError(message);
                    console.error('PDF source error', error);
                  }}
                >
                  {numPages !== null &&
                    Array.from({ length: numPages }, (_, i) => (
                      <div
                        key={i + 1}
                        className='flex justify-center py-2 first:pt-3 last:pb-3'
                      >
                        <div className='relative inline-block'>
                          <Page
                            pageNumber={i + 1}
                            width={pageWidth}
                            renderTextLayer
                            renderAnnotationLayer
                            onRenderError={(error) => {
                              console.error('PDF page render error', error);
                            }}
                          />
                          <RegionCommentOverlay
                            drawEnabled={isCommentMode}
                            pageNumber={i + 1}
                            comments={comments}
                            activeId={activeCommentId}
                            setActiveId={setActiveCommentId}
                            onDeleteComment={deleteComment}
                            onSaveComment={(rect, p) =>
                              persistComment(i + 1, rect, p)
                            }
                          />
                        </div>
                      </div>
                    ))}
                </Document>
              </div>
            )}

            {isImage && !isPdf && !previewError && (
              <div
                data-note-file-scroll
                className='rounded-md border border-border bg-[var(--pl-bg-sunken)] max-h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto flex justify-center p-2'
              >
                <div className='relative inline-block max-w-full'>
                  <img
                    src={fileUrl}
                    alt={fileName}
                    className='max-w-full h-auto object-contain block'
                    onError={() => {
                      setPreviewError(`Image could not be loaded from ${fileUrl}`);
                      toast.error('Could not load image preview');
                    }}
                  />
                  <RegionCommentOverlay
                    drawEnabled={isCommentMode}
                    pageNumber={1}
                    comments={comments}
                    activeId={activeCommentId}
                    setActiveId={setActiveCommentId}
                    onDeleteComment={deleteComment}
                    onSaveComment={(rect, p) => persistComment(1, rect, p)}
                  />
                </div>
              </div>
            )}

            {!isPdf && !isImage && (
              <p className='text-xs text-[var(--pl-text-muted)] italic font-[var(--font-serif)]'>
                Preview is available for PDF and images. You can still summarize
                this file with AI.
              </p>
            )}

            {canRegionComment && (
              <div className='flex flex-col gap-2'>
                <Button
                  type='button'
                  variant={isCommentMode ? 'secondary' : 'outline'}
                  size='sm'
                  className='w-full gap-2'
                  disabled={commentSaving}
                  onClick={() => {
                    setIsCommentMode((v) => !v);
                    setActiveCommentId(null);
                  }}
                >
                  <MessageSquarePlus className='w-4 h-4' />
                  {isCommentMode ? 'Cancel commenting' : 'Add region comment'}
                </Button>
                {isCommentMode && (
                  <p className='text-xs text-[var(--pl-text-muted)] text-center animate-pulse'>
                    Drag to select a region · Esc to cancel
                  </p>
                )}
                {comments.length > 0 && (
                  <p className='text-[10px] tracking-[0.14em] uppercase text-[var(--pl-text-faint)] text-center'>
                    {comments.length} comment{comments.length !== 1 ? 's' : ''}
                    {!setId ? ' · not synced' : ''}
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={handleSummarize}
              disabled={summarizeFileMutation.isPending}
              className='w-full gap-2'
              size='sm'
            >
              {summarizeFileMutation.isPending ? (
                <LoaderCircle className='w-4 h-4 animate-spin' />
              ) : (
                <Sparkles className='w-4 h-4' />
              )}
              Summarize File with AI
            </Button>
          </Card>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
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
