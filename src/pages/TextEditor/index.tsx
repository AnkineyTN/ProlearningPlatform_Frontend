import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Save, FileText, ChevronDown, Sparkles, X, Check, Upload, FileIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import { useNoteDetail, useAutoSaveNote, useExplainText, useUploadFile, useSummarizeFile, useConvertToVectorDB, useDeleteNoteDoc } from '@/hooks/useNotes';
import "./style.scss";

interface EditorProps {
    initialTitle?: string;
    noteId: string;
    onSave?: (title: string, content: any) => void;
}

interface ExplainPopupState {
    show: boolean;
    selectedText: string;
    answer: string;
    loading: boolean;
    position: { top: number; left: number };
}

interface UploadedFile {
    id: number;
    fileName: string;
    fileUrl: string;
    extension: string;
    publicId: string;
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
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [explainPopup, setExplainPopup] = useState<ExplainPopupState>({
        show: false,
        selectedText: '',
        answer: '',
        loading: false,
        position: { top: 0, left: 0 }
    });

    // File management states
    const [uploadedFilesList, setUploadedFilesList] = useState<UploadedFile[]>([]);
    const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
    const [showFileSidebar, setShowFileSidebar] = useState<boolean>(false);
    const [fileSummary, setFileSummary] = useState<string>('');
    const [isSummarizing, setIsSummarizing] = useState<boolean>(false);

    const { data: noteData, isLoading, error } = useNoteDetail(Number(noteId));
    const autoSaveMutation = useAutoSaveNote();
    const explainMutation = useExplainText();
    const uploadFileMutation = useUploadFile();
    const summarizeFileMutation = useSummarizeFile();
    const convertToVectorDBMutation = useConvertToVectorDB();
    const deleteNoteDocMutation = useDeleteNoteDoc();

    // Dùng useMemo để tìm file đang chọn
    const selectedFile = useMemo(() => {
        return uploadedFilesList.find(f => f.id === selectedFileId) || null;
    }, [uploadedFilesList, selectedFileId]);

    const parseNoteContent = (content: any) => {
        if (!content) {
            return [
                {
                    type: "heading",
                    content: "Heading 1...",
                    props: { level: 1 }
                },
                {
                    type: "paragraph",
                    content: ""
                }
            ];
        }

        try {
            return typeof content === 'string' ? JSON.parse(content) : content;
        } catch (error) {
            console.error('Error parsing content:', error);
            return [
                {
                    type: "paragraph",
                    content: "Error loading content"
                }
            ];
        }
    };

    // Initialize BlockNote editor
    const editor = useCreateBlockNote({
        initialContent: parseNoteContent(noteData?.content)
    });

    useEffect(() => {
        if (noteData) {
            setTitle(noteData.title);
            if (noteData.content) {
                const parsedContent = parseNoteContent(noteData.content);
                editor.replaceBlocks(editor.document, parsedContent);
            }
            // Tải danh sách files nếu có
            if (noteData.noteDocs && Array.isArray(noteData.noteDocs)) {
                setUploadedFilesList(noteData.noteDocs);
            }
        }
    }, [noteData]);

    // Auto-save functionality (every 15 seconds)
    useEffect(() => {
        const startAutoSave = () => {
            if (autoSaveTimerRef.current) {
                clearInterval(autoSaveTimerRef.current);
            }

            autoSaveTimerRef.current = setInterval(() => {
                handleAutoSave();
            }, 15000);
        };

        startAutoSave();

        return () => {
            if (autoSaveTimerRef.current) {
                clearInterval(autoSaveTimerRef.current);
            }
        };
    }, [title, editor]);

    // Handle text selection for Explain feature
    useEffect(() => {
        const handleSelection = () => {
            const selection = window.getSelection();
            const selectedText = selection?.toString().trim();

            if (selectedText && selectedText.length > 0) {
                const range = selection?.getRangeAt(0);
                const rect = range?.getBoundingClientRect();

                if (rect) {
                    setExplainPopup({
                        show: true,
                        selectedText,
                        answer: '',
                        loading: false,
                        position: {
                            top: rect.top - 50,
                            left: rect.left + rect.width / 2
                        }
                    });
                }
            } else {
                if (!explainPopup.loading && !explainPopup.answer) {
                    setExplainPopup(prev => ({ ...prev, show: false }));
                }
            }
        };

        document.addEventListener('mouseup', handleSelection);
        document.addEventListener('keyup', handleSelection);

        return () => {
            document.removeEventListener('mouseup', handleSelection);
            document.removeEventListener('keyup', handleSelection);
        };
    }, [explainPopup.loading, explainPopup.answer]);

    const handleAutoSave = async () => {
        try {
            const blocks = editor.document;
            const contentString = JSON.stringify(blocks);

            await autoSaveMutation.mutateAsync({
                noteId: Number(noteId),
                title,
                content: contentString
            });

            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleTitleClick = () => {
        setIsEditingTitle(true);
    };

    const handleTitleBlur = () => {
        setIsEditingTitle(false);
    };

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setIsEditingTitle(false);
        }
    };

    const handleSave = async () => {
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

    const handleExplainClick = async () => {
        if (!explainPopup.selectedText) return;

        setExplainPopup(prev => ({ ...prev, loading: true }));

        try {
            const response = await explainMutation.mutateAsync({
                noteId: Number(noteId),
                queryText: explainPopup.selectedText
            });

            setExplainPopup(prev => ({
                ...prev,
                answer: response.data.data.answer,
                loading: false
            }));
        } catch (error) {
            console.error('Explain failed:', error);
            setExplainPopup(prev => ({
                ...prev,
                loading: false,
                answer: 'Failed to explain. Please try again.'
            }));
        }
    };

    const handleApplyExplanation = async () => {
        // Tái sử dụng logic cũ cho Explanation
        const blocks = editor.document;
        editor.insertBlocks(
            [
                {
                    type: "paragraph",
                    content: [
                        {
                            type: "text",
                            text: explainPopup.answer,
                            styles: { italic: true, textColor: "blue" }
                        }
                    ]
                }
            ],
            blocks[blocks.length - 1],
            "after"
        );

        handleCancelExplanation();
    };

    const handleCancelExplanation = () => {
        setExplainPopup({
            show: false,
            selectedText: '',
            answer: '',
            loading: false,
            position: { top: 0, left: 0 }
        });
        window.getSelection()?.removeAllRanges();
    };

    // File upload handlers
    const handleFileUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

        if (!validTypes.includes(file.type)) {
            alert('Invalid file type. Please upload an image, PDF, DOC, or TXT file.');
            return;
        }

        try {
            const response = await uploadFileMutation.mutateAsync({ file, noteId: Number(noteId) });
            const uploadedData: UploadedFile = response.data.data;

            // Thêm file vào danh sách
            setUploadedFilesList(prev => [...prev, uploadedData]);

            if (!file.type.startsWith('image/')) {
                // Chỉ chuyển đổi các file tài liệu (PDF, DOC, TXT)
                await convertToVectorDBMutation.mutateAsync({
                    noteDocsId: uploadedData.id,
                    fileName: uploadedData.fileName,
                    fileUrl: uploadedData.fileUrl,
                    extension: uploadedData.extension,
                    noteId: Number(noteId)
                });
                console.log('Successfully converted to vector DB:', uploadedData.fileName);
            }

            // Nếu là ảnh, chèn trực tiếp vào editor
            if (file.type.startsWith('image/')) {
                const blocks = editor.document;
                editor.insertBlocks(
                    [
                        {
                            type: "image",
                            props: {
                                url: uploadedData.fileUrl,
                                caption: uploadedData.fileName
                            }
                        }
                    ],
                    blocks[blocks.length - 1],
                    "after"
                );
            } else {
                // Chọn file vừa upload và mở sidebar
                setSelectedFileId(uploadedData.id);
                setShowFileSidebar(true);
                setFileSummary('');
            }

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload file. Please try again.');
        }
    };

    const handleSummarizeFile = async () => {
        if (!selectedFile) return;

        setIsSummarizing(true);

        try {
            const response = await summarizeFileMutation.mutateAsync({
                noteDocsId: selectedFile.id,
                fileUrl: selectedFile.fileUrl,
                extension: selectedFile.extension
            });

            setFileSummary(response.data.data.summary);
            console.log("🚀 ~ handleSummarizeFile ~ response.data.data.summary:", response.data.data.summary)
        } catch (error) {
            console.error('Summarize failed:', error);
            setFileSummary('Failed to summarize. Please try again.');
        } finally {
            setIsSummarizing(false);
        }
    };

    const generateSummaryBlocks = (summaryText: string): any[] => {
        // Parse each HTML part and convert to BlockNote blocks
        const parts = summaryText.split('\n\n');
        const blocks: any[] = [
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: `✨ AI Summary of ${selectedFile?.fileName || 'Document'}:`,
                        styles: { bold: true, textColor: "purple" }
                    }
                ]
            }
        ];

        // Helper to convert HTML element to block content
        function parseNode(node: ChildNode): any[] {
            if (node.nodeType === Node.TEXT_NODE) {
                return [{ type: "text", text: node.textContent || "" }];
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                if (el.tagName === "B" || el.tagName === "STRONG") {
                    return [{ type: "text", text: el.textContent || "", styles: { bold: true } }];
                }
                if (el.tagName === "I" || el.tagName === "EM") {
                    return [{ type: "text", text: el.textContent || "", styles: { italic: true } }];
                }
                // Recursively parse children
                let children: any[] = [];
                el.childNodes.forEach(child => {
                    children = children.concat(parseNode(child));
                });
                return children;
            }
            return [];
        }

        for (const part of parts) {
            const doc = new DOMParser().parseFromString(part, "text/html");
            doc.body.childNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const el = node as HTMLElement;
                    if (el.tagName === "P") {
                        blocks.push({
                            type: "paragraph",
                            content: parseNode(el)
                        });
                    } else if (el.tagName === "H1") {
                        blocks.push({
                            type: "heading",
                            props: { level: 1 },
                            content: parseNode(el)
                        });
                    } else if (el.tagName === "H2") {
                        blocks.push({
                            type: "heading",
                            props: { level: 2 },
                            content: parseNode(el)
                        });
                    } else {
                        // Default: treat as paragraph
                        blocks.push({
                            type: "paragraph",
                            content: parseNode(el)
                        });
                    }
                } else if (node.nodeType === Node.TEXT_NODE) {
                    const text = node.textContent?.trim();
                    if (text) {
                        blocks.push({
                            type: "paragraph",
                            content: [{ type: "text", text }]
                        });
                    }
                }
            });
        }
        return blocks;
    };


    const handleApplySummary = () => {
        if (!fileSummary || !selectedFile) return;

        const summaryBlocks = generateSummaryBlocks(fileSummary);

        const blocks = editor.document;
        editor.insertBlocks(
            summaryBlocks,
            blocks[blocks.length - 1],
            "after"
        );
    };

    const handleCloseSidebar = () => {
        setShowFileSidebar(false);
    };

    // Hàm đóng file đang xem (xóa khỏi danh sách)
    const handleRemoveFile = async (fileId: number) => {
        const fileToRemove = uploadedFilesList.find(f => f.id === fileId);

        if (!fileToRemove) return;

        try {
            // 1. GỌI API XÓA FILE (bao gồm xóa trên Cloudinary)
            await deleteNoteDocMutation.mutateAsync({
                noteDocsId: fileId,
                data: {
                    publicId: fileToRemove.publicId,
                    extension: fileToRemove.extension
                }
            });

            // 2. Cập nhật state (Xóa khỏi danh sách)
            setUploadedFilesList(prev => prev.filter(f => f.id !== fileId));
            if (selectedFileId === fileId) {
                setSelectedFileId(null);
                setShowFileSidebar(false);
                setFileSummary('');
            }
            console.log('Successfully deleted file:', fileToRemove.fileName);

        } catch (error) {
            console.error('Failed to delete file:', error);
            alert('Failed to delete file. Please try again.');
        }
    };

    const getTheme = () => {
        const theme = document.documentElement.getAttribute('data-theme');
        return theme === 'dark' ? 'dark' : 'light';
    };

    const formatLastSaved = () => {
        if (!lastSaved) return '';
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);

        if (diff < 60) return 'Saved just now';
        if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
        return `Saved ${Math.floor(diff / 3600)}h ago`;
    };

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

    const docFiles = uploadedFilesList.filter(f => !f.fileUrl.match(/\.(jpe?g|png|gif|webp)$/i));

    return (
        <div className="min-h-screen bg-card flex">
            {/* Main Editor Area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${showFileSidebar && selectedFile ? 'mr-112' : ''}`}>

                {/* Header */}
                <header className="border-b border-border bg-card sticky top-0 z-50">
                    <div className="flex items-center justify-between px-6 py-3">
                        <div className="flex items-center gap-3">
                            <FileText onClick={handleBack} className="w-6 h-6 text-foreground cursor-pointer" />
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    onBlur={handleTitleBlur}
                                    onKeyDown={handleTitleKeyDown}
                                    onFocus={(e) => e.target.select()}
                                    className="text-lg font-medium bg-transparent border-none outline-none focus:ring-0 px-2 py-1"
                                    autoFocus
                                />
                            ) : (
                                <h1
                                    onClick={handleTitleClick}
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
                            <input
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
                                onClick={handleFileUploadClick}
                                disabled={uploadFileMutation.isPending}
                            >
                                {uploadFileMutation.isPending ? (
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
                                onClick={handleDownload}
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </Button>

                            {/* Nút Toggle Sidebar */}
                            {docFiles.length > 0 && (
                                <Button
                                    variant={showFileSidebar ? "default" : "outline"}
                                    size="sm"
                                    className="gap-2 cursor-pointer"
                                    onClick={() => setShowFileSidebar(prev => !prev)}
                                >
                                    <FileIcon className="w-4 h-4" />
                                    {showFileSidebar ? 'Hide Docs' : 'Show Docs'}
                                </Button>
                            )}

                            <Button
                                size="sm"
                                className="gap-2 bg-foreground text-background hover:bg-foreground/80 cursor-pointer"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                <Save className="w-4 h-4" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </header>

                {/* Thanh File Tabs (Horizontal Scroll) */}
                {docFiles.length > 0 && (
                    <div className="bg-muted border-b border-border overflow-x-auto whitespace-nowrap px-6 py-2 shadow-sm sticky top-[61px] z-40">
                        <div className="flex gap-2 min-w-max">
                            {docFiles.map(file => (
                                <div
                                    key={file.id}
                                    onClick={() => {
                                        setSelectedFileId(file.id);
                                        setShowFileSidebar(true);
                                        setFileSummary(''); // Reset summary khi chọn file khác
                                    }}
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer 
                                        ${selectedFileId === file.id && showFileSidebar
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-card text-foreground hover:bg-card-secondary'
                                        }`}
                                >
                                    <FileIcon className="w-4 h-4" />
                                    <span className="truncate max-w-[150px]">{file.fileName}</span>
                                    {/* Nút xóa file khỏi danh sách */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemoveFile(file.id);
                                        }}
                                        className={`p-0.5 rounded-full cursor-pointer ${selectedFileId === file.id && showFileSidebar ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* Explain Popup */}
                {explainPopup.show && !explainPopup.answer && (
                    <div
                        className="absolute z-50"
                        style={{
                            top: `${explainPopup.position.top + 70}px`, // chuyển xuống dưới vùng chọn
                            left: `${explainPopup.position.left + 450}px`,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <Button
                            size="sm"
                            className="gap-2 shadow-lg bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                            onClick={handleExplainClick}
                            disabled={explainPopup.loading}
                        >
                            <Sparkles className="w-4 h-4" />
                            {explainPopup.loading ? 'Explaining...' : 'Explain with AI'}
                        </Button>
                    </div>
                )}

                {/* Explanation Result Popup */}
                {explainPopup.show && explainPopup.answer && (
                    <div
                        className="fixed z-50 bg-card border border-border rounded-lg shadow-2xl p-4 max-w-md"
                        style={{
                            top: `${explainPopup.position.top + 40}px`,
                            left: `${explainPopup.position.left}px`,
                            transform: 'translateX(-50%)'
                        }}
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-purple-600" />
                                <h3 className="font-semibold text-sm">AI Explanation</h3>
                            </div>
                            <button
                                onClick={handleCancelExplanation}
                                className="text-muted-foreground cursor-pointer hover:text-foreground"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="mb-3 p-2 bg-muted rounded text-sm">
                            <p className="text-muted-foreground font-medium mb-1">Selected text:</p>
                            <p className="italic">"{explainPopup.selectedText}"</p>
                        </div>

                        <div
                            className="mb-4 text-sm"
                            dangerouslySetInnerHTML={{ __html: explainPopup.answer }}>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancelExplanation}
                                className="cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                size="sm"
                                className="gap-2 bg-purple-600 hover:bg-purple-700 cursor-pointer"
                                onClick={handleApplyExplanation}
                            >
                                <Check className="w-4 h-4" />
                                Apply to Note
                            </Button>
                        </div>
                    </div>
                )}

                {/* Editor Content */}
                <main className="max-w-4xl mx-auto px-8 py-12 flex-1">
                    <BlockNoteView
                        editor={editor}
                        theme={getTheme()}
                    />
                </main>
            </div>

            {/* File Sidebar */}
            {showFileSidebar && selectedFile && (
                <div className="fixed right-0 top-0 bottom-0 w-112 bg-card border-l border-border shadow-2xl z-40 flex flex-col z-50">
                    {/* Sidebar Header */}
                    <div className="border-b border-border p-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileIcon className="w-5 h-5 text-purple-600" />
                            <h2 className="font-semibold">Document Preview</h2>
                        </div>
                        <button
                            onClick={handleCloseSidebar}
                            className="text-muted-foreground cursor-pointer hover:text-foreground"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* File Info */}
                    <div className="p-4 border-b border-border">
                        <div className="bg-muted rounded-lg p-3">
                            <p className="text-sm font-medium truncate">{selectedFile.fileName}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                {selectedFile.extension} • Uploaded
                            </p>
                        </div>
                    </div>

                    {/* File Preview/Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {selectedFile.extension === 'pdf' ? (
                            <iframe
                                src={selectedFile.fileUrl}
                                className="w-full h-full border border-border rounded"
                                title="PDF Preview"
                            />
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <FileIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Preview not available for this file type</p>

                                <a href={selectedFile.fileUrl}
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
                        {!fileSummary ? (
                            <Button
                                className="w-full gap-2 bg-purple-600 hover:bg-purple-700 cursor-pointer"
                                onClick={handleSummarizeFile}
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
                                      className="text-sm text-muted-foreground whitespace-pre-wrap"
                                      dangerouslySetInnerHTML={{ __html: fileSummary }}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 cursor-pointer"
                                        onClick={() => setFileSummary('')}
                                    >
                                        Regenerate
                                    </Button>
                                    <Button
                                        className="flex-1 gap-2 bg-purple-600 cursor-pointer hover:bg-purple-700"
                                        onClick={handleApplySummary}
                                    >
                                        <Check className="w-4 h-4" />
                                        Apply to Note
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
            }
        </div >
    );
};

export default NotionEditor;