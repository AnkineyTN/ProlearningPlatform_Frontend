import React, { useState } from 'react';
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
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const handleTextSelection = () => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && onTextSelected) {
            onTextSelected(selectedText);
        }
    };

    if (!show || !file) return null;

    return (
        <div className="fixed right-0 top-0 bottom-0 w-200 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
            {/* Sidebar Header */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
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
            <div className="p-4 border-b border-gray-200">
                <div className="bg-gray-100 rounded-lg p-3">
                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {file.extension.toUpperCase()} • Uploaded
                    </p>
                </div>
            </div>

            {/* File Preview/Content */}
            <div className="flex-1 overflow-y-auto" onMouseUp={handleTextSelection}>
                {file.extension === 'pdf' ? (
                    <div className="h-full p-4">
                        <Document
                            file={{
                                url: file.fileUrl,
                            }}
                            onLoadSuccess={onDocumentLoadSuccess}
                            onLoadError={(error) => console.error('PDF load error:', error)}
                            className="flex flex-col items-center"
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
                            <Page
                                pageNumber={pageNumber}
                                renderTextLayer={true}
                                renderAnnotationLayer={true}
                                className="border border-gray-200 rounded shadow-sm"
                                width={700}
                            />
                        </Document>

                        {numPages > 1 && (
                            <div className="flex items-center justify-center gap-4 mt-4">
                                <button
                                    onClick={() => setPageNumber(prev => Math.max(1, prev - 1))}
                                    disabled={pageNumber <= 1}
                                    className="px-3 py-1 bg-purple-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Previous
                                </button>
                                <span className="text-sm">
                                    Page {pageNumber} of {numPages}
                                </span>
                                <button
                                    onClick={() => setPageNumber(prev => Math.min(numPages, prev + 1))}
                                    disabled={pageNumber >= numPages}
                                    className="px-3 py-1 bg-purple-600 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center text-gray-500 py-8 px-4">
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
                )}
            </div>

            {/* Summary Section */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
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
            </div>
        </div>
    );
};

export default FileSidebar;