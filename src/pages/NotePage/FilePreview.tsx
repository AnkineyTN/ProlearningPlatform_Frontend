import { FileText, LoaderCircle, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useDeleteNoteDoc, useSummarizeFile } from "@/hooks/useNotes";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

interface FilePreviewProps {
  fileId: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
  onFileSummarize: (summary: string, fileName: string) => void;
  onFileDeleted: () => void;
}

export const FilePreview = ({
  fileId,
  fileName,
  fileUrl,
  extension,
  publicId,
  onFileSummarize,
  onFileDeleted,
}: FilePreviewProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState(520);
  const pdfWrapRef = useRef<HTMLDivElement>(null);
  const summarizeFileMutation = useSummarizeFile();
  const deleteNoteDocMutation = useDeleteNoteDoc();

  const isPdf = extension.toLowerCase() === "pdf";

  useEffect(() => {
    setNumPages(null);
  }, [fileUrl]);

  useEffect(() => {
    if (!isPdf) return;
    const el = pdfWrapRef.current;
    if (!el) return;
    const update = () =>
      setPageWidth(Math.max(240, Math.floor(el.getBoundingClientRect().width)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isPdf, fileUrl]);

  const handleSummarize = async () => {
    try {
      const response = await summarizeFileMutation.mutateAsync({
        noteDocsId: fileId,
        fileUrl,
        extension,
      });

      const summary = response.data.data.summary;
      onFileSummarize(summary, fileName);
      toast.success("File summarized successfully");
    } catch (error) {
      toast.error("Failed to summarize file");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteNoteDocMutation.mutateAsync({
        noteDocsId: fileId,
        data: {
          publicId,
          extension,
        },
      });

      onFileDeleted();
      toast.success("File deleted successfully");
    } catch (error) {
      toast.error("Failed to delete file");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className='w-full h-full overflow-auto flex flex-col'>
      <div className='p-4 border-b flex items-center justify-between sticky top-0'>
        <h3 className='font-semibold text-sm'>Uploaded File</h3>
        <Button
          size='sm'
          variant='ghost'
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <X className='w-4 h-4' />
        </Button>
      </div>

      <div className='flex-1 p-4'>
        <Card className='p-4'>
          <div className='flex items-start gap-3'>
            <FileText className='w-8 h-8 text-blue-500 flex-shrink-0 mt-1' />
            <div className='flex-1 min-w-0'>
              <p className='font-medium text-sm truncate'>{fileName}</p>
              <p className='text-xs text-muted-foreground'>{extension.toUpperCase()}</p>
            </div>
          </div>

          {isPdf && (
            <div
              ref={pdfWrapRef}
              className='rounded-md border bg-muted/20 overflow-y-auto max-h-[calc(100vh-350px)] overflow-x-hidden'
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
                    <div key={i + 1} className='flex justify-center py-2 first:pt-3 last:pb-3'>
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
    </div>
  );
};
