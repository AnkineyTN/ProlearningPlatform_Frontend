import React from 'react';
import { FileIcon, X, Sparkles, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadedFile {
    id: number;
    fileName: string;
    fileUrl: string;
    extension: string;
    publicId: string;
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
    if (!show || !file) return null;

    return (
        <div className="fixed right-0 top-0 bottom-0 w-112 bg-card border-l border-border shadow-2xl z-40 flex flex-col z-50">
            {/* Sidebar Header */}
            <div className="border-b border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileIcon className="w-5 h-5 text-purple-600" />
                    <h2 className="font-semibold">Document Preview</h2>
                </div>
                <button
                    onClick={onClose}
                    className="text-muted-foreground cursor-pointer hover:text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* File Info */}
            <div className="p-4 border-b border-border">
                <div className="bg-muted rounded-lg p-3">
                    <p className="text-sm font-medium truncate">{file.fileName}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {file.extension} • Uploaded
                    </p>
                </div>
            </div>

            {/* File Preview/Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {file.extension === 'pdf' ? (
                    <iframe
                        src={file.fileUrl}
                        className="w-full h-full border border-border rounded"
                        title="PDF Preview"
                    />
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <FileIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>Preview not available for this file type</p>
                        <a
                            href={file.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline text-sm mt-2 inline-block"
                        >
                            Open in new tab
                        </a>
                    </div>
                )}
            </div>

            {/* Summary Section */}
            <div className="border-t border-border p-4">
                {!summary ? (
                    <Button
                        className="w-full gap-2 bg-purple-600 hover:bg-purple-700 cursor-pointer"
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
                        <div className="bg-muted rounded-lg p-3 mb-3 max-h-48 overflow-y-auto">
                            <p className="text-sm font-medium mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                AI Summary (Formatted):
                            </p>
                            <div
                                className="text-sm text-foreground whitespace-pre-wrap"
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
                                Apply to Note
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileSidebar;