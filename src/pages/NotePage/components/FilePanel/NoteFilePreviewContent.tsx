import type { ReactNode, RefObject } from 'react';
import { AlertTriangle, ExternalLink, LoaderCircle } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import toast from 'react-hot-toast';

import {
  DocxViewer,
  PptxViewer,
  TxtViewer,
} from '@/pages/NotePage/components/FilePanel/NoteFileViewers';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface NoteFilePreviewContentProps {
  fileUrl: string;
  fileName: string;
  isPdf: boolean;
  isImage: boolean;
  isTxt: boolean;
  isDocx: boolean;
  isPptx: boolean;
  previewError: string | null;
  pdfWrapRef: RefObject<HTMLDivElement | null>;
  numPages: number | null;
  pageWidth: number;
  renderOverlay: (pageNumber: number) => ReactNode;
  onPdfLoadSuccess: (numPages: number) => void;
  onPdfLoadError: (message: string) => void;
  onImageError: (message: string) => void;
}

export function NoteFilePreviewContent({
  fileUrl,
  fileName,
  isPdf,
  isImage,
  isTxt,
  isDocx,
  isPptx,
  previewError,
  pdfWrapRef,
  numPages,
  pageWidth,
  renderOverlay,
  onPdfLoadSuccess,
  onPdfLoadError,
  onImageError,
}: NoteFilePreviewContentProps) {
  return (
    <>
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
            onLoadSuccess={({ numPages: n }) => onPdfLoadSuccess(n)}
            onLoadError={(error) => {
              onPdfLoadError(error?.message ?? 'Unknown error rendering PDF');
              toast.error('Could not load PDF preview');
              console.error('PDF load error', error);
            }}
            onSourceError={(error) => {
              onPdfLoadError(error?.message ?? 'Failed to fetch PDF file');
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
                    {renderOverlay(i + 1)}
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
                onImageError(`Image could not be loaded from ${fileUrl}`);
                toast.error('Could not load image preview');
              }}
            />
            {renderOverlay(1)}
          </div>
        </div>
      )}

      {isTxt && !previewError && (
        <div
          data-note-file-scroll
          className='rounded-md border border-border bg-[var(--pl-bg-sunken)] max-h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto'
        >
          <TxtViewer fileUrl={fileUrl} renderPageOverlay={renderOverlay} />
        </div>
      )}

      {isDocx && !previewError && (
        <div
          data-note-file-scroll
          className='rounded-md border border-border bg-[var(--pl-bg-sunken)] max-h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto'
        >
          <DocxViewer fileUrl={fileUrl} renderPageOverlay={renderOverlay} />
        </div>
      )}

      {isPptx && !previewError && (
        <div
          data-note-file-scroll
          className='rounded-md border border-border bg-[var(--pl-bg-sunken)] max-h-[calc(100vh-380px)] overflow-y-auto overflow-x-auto'
        >
          <PptxViewer fileUrl={fileUrl} renderPageOverlay={renderOverlay} />
        </div>
      )}

      {!isPdf && !isImage && !isTxt && !isDocx && !isPptx && (
        <p className='text-xs text-[var(--pl-text-muted)] italic font-[var(--font-serif)]'>
          Preview is available for PDF, images, TXT, DOCX and PPTX. You can
          still summarize this file with AI.
        </p>
      )}
    </>
  );
}
