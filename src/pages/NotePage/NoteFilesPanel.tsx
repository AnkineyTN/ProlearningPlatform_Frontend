import {
  ChevronDown,
  ChevronRight,
  FileText,
  LoaderCircle,
  PanelRightClose,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDeleteNoteDoc, useSummarizeFile } from "@/hooks/useNotes";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export interface NoteAttachedFile {
  id: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
}

interface NoteFilesPanelProps {
  noteId: number;
  files: NoteAttachedFile[];
  onFileSummarize: (summary: string, fileName: string) => void;
  onFileDeleted: (fileId: number) => void;
  onClosePanel: () => void;
}

function NoteFileRow({
  file,
  noteId,
  onFileSummarize,
  onDeleted,
}: {
  file: NoteAttachedFile;
  noteId: number;
  onFileSummarize: (summary: string, fileName: string) => void;
  onDeleted: () => void;
}) {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState(520);
  const pdfWrapRef = useRef<HTMLDivElement>(null);
  const summarizeFileMutation = useSummarizeFile();
  const deleteNoteDocMutation = useDeleteNoteDoc();

  const { fileName, fileUrl, extension, publicId, id: fileId } = file;
  const isPdf = extension.toLowerCase() === "pdf";

  useEffect(() => {
    setNumPages(null);
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

  const handleSummarize = async () => {
    try {
      const response = await summarizeFileMutation.mutateAsync({
        lang: i18n.language || "vi",
        limit: 0,
        asset_id: fileId,
        file_url: fileUrl,
      });

      const summary = response.data.data.summary;
      onFileSummarize(summary, fileName);
      toast.success("File summarized successfully");
    } catch (error) {
      toast.error("Failed to summarize file");
      console.error(error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!noteId) {
      toast.error("Invalid note");
      return;
    }
    setIsDeleting(true);
    try {
      await deleteNoteDocMutation.mutateAsync({
        noteId,
        assetId: fileId,
        publicId,
        extension,
      });

      onDeleted();
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen} className='border-b last:border-b-0'>
      <div className='flex items-center gap-1 px-2 py-2 hover:bg-muted/40'>
        <CollapsibleTrigger asChild>
          <Button
            variant='ghost'
            size='sm'
            className='flex-1 min-w-0 h-auto py-2 px-2 justify-start gap-2 font-normal'
          >
            {open ? (
              <ChevronDown className='w-4 h-4 shrink-0 text-muted-foreground' />
            ) : (
              <ChevronRight className='w-4 h-4 shrink-0 text-muted-foreground' />
            )}
            <FileText className='w-4 h-4 shrink-0 text-blue-500' />
            <span className='truncate text-sm font-medium text-left'>{fileName}</span>
            <span className='text-xs text-muted-foreground shrink-0'>
              {extension.toUpperCase()}
            </span>
          </Button>
        </CollapsibleTrigger>
        <Button
          size='sm'
          variant='ghost'
          className='shrink-0 h-8 w-8 p-0 text-muted-foreground hover:text-destructive'
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
        <div className='px-3 pb-4 pt-0'>
          <Card className='p-4'>
            {isPdf && (
              <div
                ref={pdfWrapRef}
                className='rounded-md border bg-muted/20 overflow-y-auto max-h-[calc(100vh-380px)] overflow-x-hidden mb-3'
              >
                <Document
                  file={fileUrl}
                  loading={
                    <div className='flex justify-center py-12'>
                      <LoaderCircle className='w-8 h-8 animate-spin text-muted-foreground' />
                    </div>
                  }
                  onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                  onLoadError={() => {
                    toast.error("Could not load PDF preview");
                  }}
                >
                  {numPages !== null &&
                    Array.from({ length: numPages }, (_, i) => (
                      <div
                        key={i + 1}
                        className='flex justify-center py-2 first:pt-3 last:pb-3'
                      >
                        <Page
                          pageNumber={i + 1}
                          width={pageWidth}
                          renderTextLayer
                          renderAnnotationLayer
                        />
                      </div>
                    ))}
                </Document>
              </div>
            )}

            {!isPdf && (
              <p className='text-xs text-muted-foreground mb-3'>
                Preview is available for PDF. You can still summarize this file with AI.
              </p>
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
  files,
  onFileSummarize,
  onFileDeleted,
  onClosePanel,
}: NoteFilesPanelProps) => {
  return (
    <div className='w-full h-full overflow-hidden flex flex-col bg-background'>
      <div className='p-3 border-b flex items-center justify-between gap-2 shrink-0'>
        <h3 className='font-semibold text-sm truncate'>Documents</h3>
        <Button
          type='button'
          size='sm'
          variant='ghost'
          className='shrink-0 gap-1 h-8'
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
            onFileSummarize={onFileSummarize}
            onDeleted={() => onFileDeleted(f.id)}
          />
        ))}
      </div>
    </div>
  );
};
