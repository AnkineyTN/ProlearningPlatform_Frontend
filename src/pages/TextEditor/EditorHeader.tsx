import React, { useRef } from 'react';
import { FileText, ChevronDown, Download, Save, Upload, FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface EditorHeaderProps {
    title: string;
    isEditingTitle: boolean;
    lastSaved: Date | null;
    isSaving: boolean;
    isUploading: boolean;
    showFileSidebar: boolean;
    hasDocFiles: boolean;
    onBack: () => void;
    onTitleClick: () => void;
    onTitleChange: (value: string) => void;
    onTitleBlur: () => void;
    onTitleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onUpload: (file: File) => void;
    onDownload: () => void;
    onSave: () => void;
    onToggleSidebar: () => void;
}

const EditorHeader: React.FC<EditorHeaderProps> = ({
    title,
    isEditingTitle,
    lastSaved,
    isSaving,
    isUploading,
    showFileSidebar,
    hasDocFiles,
    onBack,
    onTitleClick,
    onTitleChange,
    onTitleBlur,
    onTitleKeyDown,
    onUpload,
    onDownload,
    onSave,
    onToggleSidebar
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onUpload(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const formatLastSaved = () => {
        if (!lastSaved) return '';
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

        if (diff < 60) return 'Saved just now';
        if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
        return `Saved ${Math.floor(diff / 3600)}h ago`;
    };

    return (
        <header className="border-b border-border bg-card sticky top-0 z-50">
            <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                    <FileText onClick={onBack} className="w-6 h-6 text-foreground cursor-pointer" />
                    {isEditingTitle ? (
                        <Input
                            type="text"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            onBlur={onTitleBlur}
                            onKeyDown={onTitleKeyDown}
                            onFocus={(e) => e.target.select()}
                            className="text-lg font-medium bg-transparent border-none outline-none focus:ring-0 px-2 py-1"
                            autoFocus
                        />
                    ) : (
                        <h1
                            onClick={onTitleClick}
                            className="text-lg font-medium cursor-pointer hover:bg-card-secondary px-2 py-1 rounded transition-colors"
                        >
                            {title}
                        </h1>
                    )}
                    <Button variant="ghost" size="icon" className="w-8 h-8 cursor-pointer">
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                    {lastSaved && (
                        <span className="text-xs text-muted-foreground ml-2">
                            {formatLastSaved()}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx,.txt"
                        onChange={handleFileChange}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-4 h-4" />
                                Upload
                            </>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 cursor-pointer"
                        onClick={onDownload}
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </Button>

                    {hasDocFiles && (
                        <Button
                            variant={showFileSidebar ? "default" : "outline"}
                            size="sm"
                            className="gap-2 cursor-pointer"
                            onClick={onToggleSidebar}
                        >
                            <FileIcon className="w-4 h-4" />
                            {showFileSidebar ? 'Hide Docs' : 'Show Docs'}
                        </Button>
                    )}

                    <Button
                        size="sm"
                        className="gap-2 bg-foreground text-background hover:bg-foreground/80 cursor-pointer"
                        onClick={onSave}
                        disabled={isSaving}
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default EditorHeader;