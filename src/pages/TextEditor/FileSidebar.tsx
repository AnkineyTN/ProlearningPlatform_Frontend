import React, { useState, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { File, X, Sparkles, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Setup worker
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

interface UploadedFile {
    id: number;
    fileName: string;
    fileUrl: string;
    extension: string;
    publicId: string;
    content: string;
}

interface FileSidebarProps {
    show: boolean;
    file: UploadedFile | null;
    summary: string;
    isSummarizing: boolean;
    onClose: () => void;
    onSummarize: () => void;
    onApplySummary: () => void;
    onRegenerateSummary: () => void;
    onTextSelected?: (text: string) => void;
}

const FileSidebar: React.FC<FileSidebarProps> = ({
    show,
    file,
    summary,
    isSummarizing,
    onClose,
    onSummarize,
    onApplySummary,
    onRegenerateSummary,
    onTextSelected
}) => {
    const [numPages, setNumPages] = useState<number | null>(null);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const memoizedFile = useMemo(() => {
        return file?.fileUrl ? { url: file.fileUrl } : undefined;
    }, [file?.fileUrl]);

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && onTextSelected) {
            onTextSelected(selectedText);
        }
    };

    if (!show || !file) return null;

    return (
        <div className="h-full border-l border-ring shadow-2xl flex flex-col">
            {/* Sidebar Header */}
            <div className="border-b border-ring p-4 flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2">
                    <File className="w-5 h-5 text-purple-600" />
                    <h2 className="font-semibold">Document Preview</h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-500 cursor-pointer hover:text-gray-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* File Info */}
            <div className="p-4 border-b border-ring flex-shrink-0">
                <div className="bg-card-secondary rounded-lg p-3">
                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {file.extension.toUpperCase()} • Uploaded
                    </p>
                </div>
            </div>

            {/* File Preview/Content */}
            <div className="flex-1 overflow-y-auto" onMouseUp={handleTextSelection}>
                {file.extension === 'pdf' ? (
                    <div className="max-h-[calc(100vh-225px)] p-4 overflow-auto">
                        <Document
                            file={memoizedFile}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={(error) => {
                                console.error('PDF load error:', error);
                                setNumPages(null);
                            }}
                            className="flex flex-col items-center gap-4"
                            loading={
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                    <span className="ml-2">Loading PDF...</span>
                                </div>
                            }
                            error={
                                <div className="text-center p-8">
                                    <p className="text-red-600 mb-2">Failed to load PDF</p>
                                    <a
                                        href={file.fileUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-purple-600 hover:underline text-sm"
                                    >
                                        Open in new tab →
                                    </a>
                                </div>
                            }
                        >
                            {/* Render all pages - only when numPages is available */}
                            {numPages && numPages > 0 && Array.from(
                                { length: numPages },
                                (_, index) => (
                                    <div key={`page_${index + 1}`} className="mb-4">
                                        <Page
                                            pageNumber={index + 1}
                                            renderTextLayer={true}
                                            renderAnnotationLayer={true}
                                            className="border border-gray-200 rounded shadow-sm"
                                            width={Math.min(window.innerWidth * 0.35, 700)}
                                            loading={
                                                <div className="flex items-center justify-center p-4 border border-gray-200 rounded">
                                                    <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                                                </div>
                                            }
                                        />
                                        {/* Page number label */}
                                        <p className="text-center text-xs text-gray-500 mt-2">
                                            Page {index + 1} of {numPages}
                                        </p>
                                    </div>
                                )
                            )}
                        </Document>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8 px-4">
                        <File className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="mb-2">Preview not available for this file type</p>
                        <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline text-sm inline-block"
                        >
                            Open in new tab →
                        </a>
                    </div>
                )
                }
            </div >

            {/* Summary Section */}
            < div className="border-t border-ring p-4 flex-shrink-0" >
                {!summary ? (
                    <Button
                        className="w-full gap-2 bg-purple-600 hover:bg-purple-700 cursor-pointer text-white"
                        onClick={onSummarize}
                        disabled={isSummarizing}
                    >
                        {isSummarizing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Summarizing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                Summarize with AI
                            </>
                        )}
                    </Button>
                ) : (
                    <div>
                        <div className="bg-white rounded-lg p-3 mb-3 max-h-48 overflow-y-auto border border-gray-200">
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                AI Summary:
                            </p>
                            <div
                                className="text-sm text-gray-700"
                                dangerouslySetInnerHTML={{ __html: summary }}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                className="flex-1 cursor-pointer"
                                onClick={onRegenerateSummary}
                            >
                                Regenerate
                            </Button>
                            <Button
                                className="flex-1 gap-2 text-white bg-purple-600 cursor-pointer hover:bg-purple-700"
                                onClick={onApplySummary}
                            >
                                <Check className="w-4 h-4" />
                                Apply
                            </Button>
                        </div>
                    </div>
                )}
            </div >
        </div >
    );
};

export default FileSidebar;