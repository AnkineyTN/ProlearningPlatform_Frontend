import React, { useState } from 'react';
import { File, X, Sparkles, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
}

const FileSidebar: React.FC<FileSidebarProps> = ({
    show,
    file,
    summary,
    isSummarizing,
    onClose,
    onSummarize,
    onApplySummary,
    onRegenerateSummary
}) => {
    const [viewMode, setViewMode] = useState<'preview' | 'html'>('preview');

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

            {/* View Mode Toggle (for PDFs with HTML content) */}
            {file.extension === 'pdf' && file.content && (
                <div className="px-4 pt-3 pb-2 flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setViewMode('preview')}
                        className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${viewMode === 'preview'
                                ? 'bg-purple-600 text-white font-medium'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        📄 PDF Preview
                    </button>
                    <button
                        onClick={() => setViewMode('html')}
                        className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${viewMode === 'html'
                                ? 'bg-purple-600 text-white font-medium'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        🌐 HTML Content
                    </button>
                </div>
            )}

            {/* File Preview/Content */}
            <div className="flex-1 overflow-y-auto">
                {file.extension === 'pdf' ? (
                    viewMode === 'html' && file.content ? (
                        <div className="h-full">
                            {/* HTML Content Display */}
                            <div
                                className="w-full h-full overflow-auto bg-white"
                                dangerouslySetInnerHTML={{ __html: file.content }}
                            />
                        </div>
                    ) : (
                        <div className="h-full p-4">
                            <iframe
                                src={file.fileUrl}
                                className="w-full h-full border border-gray-200 rounded"
                                title="PDF Preview"
                            />
                        </div>
                    )
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