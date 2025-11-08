import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import {
    useNoteDetail,
    useAutoSaveNote,
    useExplainText,
    useUploadFile,
    useSummarizeFile,
    useConvertToVectorDB,
    useDeleteNoteDoc
} from '@/hooks/useNotes';
import EditorHeader from './EditorHeader';
import FileTabs from './FileTabs';
import ExplainPopup from './ExplainPopup';
import FileSidebar from './FileSidebar';
import { useFileManagement } from '@/hooks/useFileManagement';
import { useExplainFeature } from '@/hooks/useExplainFeature';
import "./style.scss";

interface EditorProps {
    initialTitle?: string;
    noteId: string;
    onSave?: (title: string, content: any) => void;
}

const NotionEditor: React.FC<EditorProps> = ({
    initialTitle = 'Untitled Note',
    noteId,
    onSave
}) => {
    const navigate = useNavigate();
    const [title, setTitle] = useState<string>(initialTitle);
    const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    // Ref để track timeout cho debounce
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const hasUnsavedChanges = useRef<boolean>(false);

    const { data: noteData, isLoading, error } = useNoteDetail(Number(noteId));
    const autoSaveMutation = useAutoSaveNote();

    // Parse note content
    const parseNoteContent = (content: any) => {
        if (!content) {
            return [
                { type: "heading", content: "Heading 1...", props: { level: 1 } },
                { type: "paragraph", content: "" }
            ];
        }
        try {
            return typeof content === 'string' ? JSON.parse(content) : content;
        } catch (error) {
            console.error('Error parsing content:', error);
            return [{ type: "paragraph", content: "Error loading content" }];
        }
    };

    // Initialize BlockNote editor
    const editor = useCreateBlockNote({
        initialContent: parseNoteContent(noteData?.content)
    });

    // Custom hooks
    const {
        uploadedFilesList,
        setUploadedFilesList,
        selectedFileId,
        setSelectedFileId,
        showFileSidebar,
        setShowFileSidebar,
        fileSummary,
        setFileSummary,
        isSummarizing,
        selectedFile,
        handleFileUpload,
        handleSummarizeFile,
        handleApplySummary,
        handleRemoveFile
    } = useFileManagement({
        noteId: Number(noteId),
        editor,
        uploadFileMutation: useUploadFile(),
        summarizeFileMutation: useSummarizeFile(),
        convertToVectorDBMutation: useConvertToVectorDB(),
        deleteNoteDocMutation: useDeleteNoteDoc()
    });

    const {
        explainPopup,
        handleExplainClick,
        handleApplyExplanation,
        handleCancelExplanation
    } = useExplainFeature({
        noteId: Number(noteId),
        editor,
        explainMutation: useExplainText()
    });

    // Load note data
    useEffect(() => {
        if (noteData) {
            setTitle(noteData.title);
            if (noteData.content) {
                const parsedContent = parseNoteContent(noteData.content);
                editor.replaceBlocks(editor.document, parsedContent);
            }
            if (noteData.noteDocs && Array.isArray(noteData.noteDocs)) {
                setUploadedFilesList(noteData.noteDocs);
            }
        }
    }, [noteData]);

    // Hàm thực hiện auto-save
    const performAutoSave = async () => {
        if (!hasUnsavedChanges.current) return;

        try {
            setIsSaving(true);
            const blocks = editor.document;
            const contentString = JSON.stringify(blocks);
            await autoSaveMutation.mutateAsync({
                noteId: Number(noteId),
                title,
                content: contentString
            });
            setLastSaved(new Date());
            hasUnsavedChanges.current = false;
        } catch (error) {
            console.error('Auto-save failed:', error);
        } finally {
            setIsSaving(false);
        }
    };

    // Debounced auto-save: chỉ save sau 20s kể từ lần edit cuối
    const triggerAutoSave = () => {
        hasUnsavedChanges.current = true;

        // Clear timeout cũ nếu có
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        // Set timeout mới: save sau 20s
        autoSaveTimeoutRef.current = setTimeout(() => {
            performAutoSave();
        }, 20000); // 20 giây
    };

    // Listen to editor changes
    useEffect(() => {
        const unsubscribe = editor.onChange(() => {
            triggerAutoSave();
        });

        return () => {
            unsubscribe();
        };
    }, [editor, title]);

    // Listen to title changes
    useEffect(() => {
        if (noteData && title !== noteData.title) {
            triggerAutoSave();
        }
    }, [title]);

    // Cleanup timeout khi unmount
    useEffect(() => {
        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
            // Save ngay khi unmount nếu có thay đổi chưa save
            if (hasUnsavedChanges.current) {
                performAutoSave();
            }
        };
    }, []);

    // Handlers
    const handleBack = () => navigate(-1);

    const handleTitleClick = () => setIsEditingTitle(true);

    const handleTitleBlur = () => setIsEditingTitle(false);

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') setIsEditingTitle(false);
    };

    const handleSave = async () => {
        // Clear timeout để không save 2 lần
        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        const blocks = editor.document;
        setIsSaving(true);
        try {
            if (onSave) {
                await onSave(title, blocks);
            } else {
                const contentString = JSON.stringify(blocks);
                await autoSaveMutation.mutateAsync({
                    noteId: Number(noteId),
                    title,
                    content: contentString
                });
                setLastSaved(new Date());
                hasUnsavedChanges.current = false;
            }
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save document!');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownload = async () => {
        const blocks = editor.document;
        const html = await editor.blocksToHTMLLossy(blocks);
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>${title}</title>
            </head>
            <body>
                ${html}
            </body>
            </html>
        `;
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleSelectFile = (fileId: number) => {
        setSelectedFileId(fileId);
        setShowFileSidebar(true);
        setFileSummary('');
    };

    const getTheme = () => {
        const theme = document.documentElement.getAttribute('data-theme');
        return theme === 'dark' ? 'dark' : 'light';
    };

    // Loading & Error states
    if (isLoading) {
        return (
            <div className="min-h-screen bg-card flex items-center justify-center">
                <div className="text-muted-foreground">Loading note...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-card flex items-center justify-center">
                <div className="text-destructive">Error loading note. Please try again.</div>
            </div>
        );
    }

    const docFiles = uploadedFilesList.filter((f: { fileUrl: string; }) =>
        !f.fileUrl.match(/\.(jpe?g|png|gif|webp)$/i)
    );

    return (
        <div className="min-h-screen bg-card flex">
            {/* Main Editor Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${showFileSidebar && selectedFile ? 'mr-112' : ''
                }`}>
                <EditorHeader
                    title={title}
                    isEditingTitle={isEditingTitle}
                    lastSaved={lastSaved}
                    isSaving={isSaving}
                    isUploading={false}
                    showFileSidebar={showFileSidebar}
                    hasDocFiles={docFiles.length > 0}
                    onBack={handleBack}
                    onTitleClick={handleTitleClick}
                    onTitleChange={setTitle}
                    onTitleBlur={handleTitleBlur}
                    onTitleKeyDown={handleTitleKeyDown}
                    onUpload={handleFileUpload}
                    onDownload={handleDownload}
                    onSave={handleSave}
                    onToggleSidebar={() => setShowFileSidebar((prev: any) => !prev)}
                />

                <FileTabs
                    files={docFiles}
                    selectedFileId={selectedFileId}
                    showSidebar={showFileSidebar}
                    onSelectFile={handleSelectFile}
                    onRemoveFile={handleRemoveFile}
                />

                <ExplainPopup
                    show={explainPopup.show}
                    selectedText={explainPopup.selectedText}
                    answer={explainPopup.answer}
                    loading={explainPopup.loading}
                    position={explainPopup.position}
                    onExplain={handleExplainClick}
                    onApply={handleApplyExplanation}
                    onCancel={handleCancelExplanation}
                />

                {/* Editor Content */}
                <main className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto px-8 py-12 flex-1">
                    <BlockNoteView editor={editor} theme={getTheme()} />
                </main>
            </div>

            <FileSidebar
                show={showFileSidebar}
                file={selectedFile}
                summary={fileSummary}
                isSummarizing={isSummarizing}
                onClose={() => setShowFileSidebar(false)}
                onSummarize={handleSummarizeFile}
                onApplySummary={handleApplySummary}
                onRegenerateSummary={() => setFileSummary('')}
                onTextSelected={(selectedText) => {
                    console.log("Text được chọn:", selectedText);
                    // Xử lý text ở đây
                }}
            />
        </div>
    );
};

export default NotionEditor;