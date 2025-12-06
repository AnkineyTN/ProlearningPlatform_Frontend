import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./style.scss";

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { useExplainFeature } from "@/hooks/useExplainFeature";
import { useFileManagement } from "@/hooks/useFileManagement";
import {
  useAutoSaveNote,
  useConvertToVectorDB,
  useDeleteNoteDoc,
  useExplainText,
  useNoteDetail,
  useSummarizeFile,
  useUploadFile,
} from "@/hooks/useNotes";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";

import EditorHeader from "./EditorHeader";
import ExplainPopup from "./ExplainPopup";
import FileSidebar from "./FileSidebar";
import FileTabs from "./FileTabs";

interface EditorProps {
  initialTitle?: string;
  noteId: string;
  onSave?: (title: string, content: any) => void;
}

const NotionEditor: React.FC<EditorProps> = ({
  initialTitle = "Untitled Note",
  noteId,
  onSave,
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState<string>(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [editorWidthPercent, setEditorWidthPercent] = useState(60); // 60% cho editor, 40% cho sidebar
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const MIN_EDITOR_WIDTH_PERCENT = 30;
  const MAX_EDITOR_WIDTH_PERCENT = 85;

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
        { type: "paragraph", content: "" },
      ];
    }
    try {
      return typeof content === "string" ? JSON.parse(content) : content;
    } catch (error) {
      console.error("Error parsing content:", error);
      return [{ type: "paragraph", content: "Error loading content" }];
    }
  };

  // Initialize BlockNote editor
  const editor = useCreateBlockNote({
    initialContent: parseNoteContent(noteData?.content),
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
    handleRemoveFile,
    isUploading,
    setIsUploading,
  } = useFileManagement({
    noteId: Number(noteId),
    editor,
    uploadFileMutation: useUploadFile(),
    summarizeFileMutation: useSummarizeFile(),
    convertToVectorDBMutation: useConvertToVectorDB(),
    deleteNoteDocMutation: useDeleteNoteDoc(),
  });

  const {
    explainPopup,
    handleExplainClick,
    handleApplyExplanation,
    handleCancelExplanation,
  } = useExplainFeature({
    noteId: Number(noteId),
    editor,
    explainMutation: useExplainText(),
  });

  // Resize effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidthPercent =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      const clampedPercent = Math.max(
        MIN_EDITOR_WIDTH_PERCENT,
        Math.min(MAX_EDITOR_WIDTH_PERCENT, newWidthPercent)
      );

      setEditorWidthPercent(clampedPercent);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    if (isResizing) {
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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
      // Convert blocks to HTML before saving to the API
      const html = await editor.blocksToHTMLLossy(blocks);
      const contentString = html;
      await autoSaveMutation.mutateAsync({
        noteId: Number(noteId),
        title,
        content: contentString,
      });
      setLastSaved(new Date());
      hasUnsavedChanges.current = false;
    } catch (error) {
      console.error("Auto-save failed:", error);
      toast.error("Auto-save failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced auto-save
  const triggerAutoSave = () => {
    hasUnsavedChanges.current = true;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      performAutoSave();
    }, 20000);
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
    if (e.key === "Enter") setIsEditingTitle(false);
  };

  const handleSave = async () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    const blocks = editor.document;
    setIsSaving(true);
    try {
      if (onSave) {
        // If parent provided onSave, keep previous behavior and pass raw blocks (so parent can decide)
        await onSave(title, blocks);
      } else {
        // Convert blocks to HTML before saving to the API
        const html = await editor.blocksToHTMLLossy(blocks);
        const contentString = html;
        await autoSaveMutation.mutateAsync({
          noteId: Number(noteId),
          title,
          content: contentString,
        });
        setLastSaved(new Date());
        hasUnsavedChanges.current = false;
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save document!");
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
    setFileSummary("");
  };

  const getTheme = () => {
    const theme = document.documentElement.getAttribute("data-theme");
    return theme === "dark" ? "dark" : "light";
  };

  // Loading & Error states
  if (isLoading) {
    return (
      <div className='min-h-screen bg-card flex items-center justify-center'>
        <div className='text-muted-foreground'>Loading note...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-card flex items-center justify-center'>
        <div className='text-destructive'>
          Error loading note. Please try again.
        </div>
      </div>
    );
  }

  const docFiles = uploadedFilesList.filter(
    (f: { fileUrl: string }) => !f.fileUrl.match(/\.(jpe?g|png|gif|webp)$/i)
  );

  const sidebarWidthPercent = 100 - editorWidthPercent;

  return (
    <div ref={containerRef} className='min-h-screen bg-card flex relative'>
      {/* Main Editor Area */}
      <div
        className='flex flex-col transition-all duration-200'
        style={{
          width:
            showFileSidebar && selectedFile ? `${editorWidthPercent}%` : "100%",
        }}
      >
        <EditorHeader
          title={title}
          isEditingTitle={isEditingTitle}
          lastSaved={lastSaved}
          isSaving={isSaving}
          isUploading={isUploading}
          showFileSidebar={showFileSidebar}
          hasDocFiles={docFiles.length > 0}
          onBack={handleBack}
          onTitleClick={handleTitleClick}
          onTitleChange={setTitle}
          onTitleBlur={handleTitleBlur}
          onTitleKeyDown={handleTitleKeyDown}
          onUpload={(file) => {
            setIsUploading(true);
            handleFileUpload(file)
              .then(() => setIsUploading(false))
              .catch(() => setIsUploading(false));
          }}
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
        <main className='w-full px-8 py-12 flex-1 overflow-auto'>
          <div className='max-w-4xl mx-auto'>
            <BlockNoteView editor={editor} theme={getTheme()} />
          </div>
        </main>
      </div>

      {/* Resize Handle */}
      {showFileSidebar && selectedFile && (
        <div
          onMouseDown={() => setIsResizing(true)}
          className={`w-1 hover:bg-purple-500 cursor-col-resize flex-shrink-0 transition-colors relative ${
            isResizing ? "bg-purple-500" : ""
          }`}
        ></div>
      )}

      {/* File Sidebar */}
      {showFileSidebar && selectedFile && (
        <div
          className='flex flex-col transition-all duration-200'
          style={{ width: `${sidebarWidthPercent}%` }}
        >
          <FileSidebar
            show={true}
            file={selectedFile}
            summary={fileSummary}
            isSummarizing={isSummarizing}
            onClose={() => setShowFileSidebar(false)}
            onSummarize={handleSummarizeFile}
            onApplySummary={handleApplySummary}
            onRegenerateSummary={() => setFileSummary("")}
            onTextSelected={(selectedText) => {
              console.log("Text được chọn:", selectedText);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default NotionEditor;
