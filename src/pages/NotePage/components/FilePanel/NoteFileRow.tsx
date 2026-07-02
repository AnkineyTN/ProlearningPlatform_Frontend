import {
  ChevronDown,
  ChevronRight,
  FileText,
  LoaderCircle,
  MessageSquarePlus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
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
} from '@/pages/NotePage/components/FilePanel/NoteFileRegionComments';
import type {
  NoteAttachedFile,
  RegionComment,
  RegionCommentSavePayload,
} from '@/pages/NotePage/components/FilePanel/NoteFileRegionComments';
import {
  isDocxExtension,
  isPptxExtension,
  isTxtExtension,
} from '@/pages/NotePage/components/FilePanel/NoteFileViewers';
import { NoteFilePreviewContent } from '@/pages/NotePage/components/FilePanel/NoteFilePreviewContent';

export function NoteFileRow({
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
  const isTxt = !isPdf && !isImage && isTxtExtension(extension);
  const isDocx = !isPdf && !isImage && isDocxExtension(extension);
  const isPptx = !isPdf && !isImage && isPptxExtension(extension);
  const canRegionComment = isPdf || isImage || isTxt || isDocx || isPptx;

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
        toast.error(apiErrorMessage(e, 'Failed to save comment'));
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
        toast.error(apiErrorMessage(e, 'Failed to delete comment'));
        return;
      }
    }
    setActiveCommentId(null);
  };

  const renderOverlay = useCallback(
    (pageNumber: number) => (
      <RegionCommentOverlay
        drawEnabled={isCommentMode}
        pageNumber={pageNumber}
        comments={comments}
        activeId={activeCommentId}
        setActiveId={setActiveCommentId}
        onDeleteComment={deleteComment}
        onSaveComment={(rect, p) => persistComment(pageNumber, rect, p)}
      />
    ),
    // deleteComment is declared as a non-memoized function; capturing via
    // closure is fine because the overlay re-renders on every state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isCommentMode, comments, activeCommentId, persistComment],
  );

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
      onFileSummarize(response.data.data.summary, fileName);
      toast.success('File summarized successfully');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to summarize file'));
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
          data: { noteId, fileUrl },
        });
      } else {
        await deleteNoteDocMutation.mutateAsync({
          setId,
          data: { noteId, assetId: fileId, publicId, extension },
        });
      }
      onDeleted();
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to delete file'));
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
          className='shrink-0 h-8 w-8 p-0 text-[var(--pl-text-faint)] hover:text-[var(--pl-danger-text)] hover:bg-[var(--pl-danger-soft)]'
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
            <NoteFilePreviewContent
              fileUrl={fileUrl}
              fileName={fileName}
              isPdf={isPdf}
              isImage={isImage}
              isTxt={isTxt}
              isDocx={isDocx}
              isPptx={isPptx}
              previewError={previewError}
              pdfWrapRef={pdfWrapRef}
              numPages={numPages}
              pageWidth={pageWidth}
              renderOverlay={renderOverlay}
              onPdfLoadSuccess={(n) => setNumPages(n)}
              onPdfLoadError={(msg) => setPreviewError(msg)}
              onImageError={(msg) => setPreviewError(msg)}
            />

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
