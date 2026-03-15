import "./notes.css";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import { AISummarizePanel } from "@/pages/NotePage/AISummarizePanel";
import { FilePreview } from "@/pages/NotePage/FilePreview";
import { NoteEditor, type NoteEditorHandle } from "@/pages/NotePage/NoteEditor";
import { NoteHeader } from "@/pages/NotePage/NoteHeader";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useAutoSaveNote, useNoteDetail } from "@/hooks/useNotes";

interface UploadedFile {
  id: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
}

interface AISummary {
  id: string;
  query: string;
  response: string;
  type: "text" | "file";
}

export const NotePage = () => {
  const { id: noteId } = useParams<{ id: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const editorRef = useRef<NoteEditorHandle>(null);

  const { data: noteDetail, isLoading: isLoadingNote } = useNoteDetail(
    noteId ? parseInt(noteId) : 0,
  );
  const autoSaveMutation = useAutoSaveNote();
  const autoSaveMutationRef = useRef(autoSaveMutation);
  autoSaveMutationRef.current = autoSaveMutation;

  // Track whether initial load has completed to avoid auto-saving on mount
  const isInitialLoadRef = useRef(true);

  // Load note detail on mount
  useEffect(() => {
    if (noteDetail) {
      setTitle(noteDetail.title);
      setContent(noteDetail.content);
    }
    if (!isLoadingNote) {
      setIsEditorReady(true);
      setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 0);
    }
  }, [noteDetail, isLoadingNote]);

  // Auto-save on content change
  useEffect(() => {
    if (isInitialLoadRef.current) return;

    const timer = setTimeout(() => {
      if (noteId && (title || content)) {
        autoSaveMutationRef.current.mutate({
          noteId: parseInt(noteId),
          title,
          content,
        });
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [title, content, noteId]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSave = () => {
    console.log('🚀 ~ handleSave ~ noteId:', noteId)
    if (noteId) {
      autoSaveMutation.mutate(
        {
          noteId: parseInt(noteId),
          title,
          content,
        },
        {
          onSuccess: () => {
            toast.success("Note saved successfully");
          },
          onError: () => {
            toast.error("Failed to save note");
          },
        },
      );
    }
  };

  const handleAISummarize = async (selectedText: string, response: string) => {
    const newSummary: AISummary = {
      id: Date.now().toString(),
      query: selectedText,
      response,
      type: "text",
    };

    setSummaries((prev) => [newSummary, ...prev]);
  };

  const handleFileSummarize = (summary: string, fileName: string) => {
    const newSummary: AISummary = {
      id: Date.now().toString(),
      query: `Summarize content of ${fileName}`,
      response: summary,
      type: "file",
    };

    setSummaries((prev) => [newSummary, ...prev]);
  };

  const handleRemoveSummary = (id: string) => {
    setSummaries((prev) => prev.filter((s) => s.id !== id));
  };

  const handleDownloadHTML = useCallback(async () => {
    const editorHtml = await editorRef.current?.getHTML() || "";

    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
            color: #333;
        }
        h1 {
            color: #1a1a1a;
            border-bottom: 2px solid #0066cc;
            padding-bottom: 10px;
        }
        .content {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #0066cc;
        }
    </style>
</head>
<body>
    <h1>${title}</h1>
    <div class="content">
        ${editorHtml}
    </div>
    <p style="text-align: center; color: #999; font-size: 12px; margin-top: 40px;">
        Generated from Prolearning Platform
    </p>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title || "note"}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success("Note downloaded successfully");
  }, [title]);

  if (isLoadingNote) {
    return (
      <div className='w-full h-screen flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4'></div>
          <p className='text-muted-foreground'>Loading note...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full h-screen'>
      {/* Header */}
      <NoteHeader
        title={title}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
        isSaving={autoSaveMutation.isPending}
        noteId={noteId ? parseInt(noteId) : 0}
        onFileUploaded={setUploadedFile}
        onDownloadHTML={handleDownloadHTML}
      />

      {/* Main Content Area with Resizable Panels */}
      <div className='flex-1 overflow-hidden'>
        <ResizablePanelGroup className='w-full h-full'>
          {/* Editor Panel */}
          <ResizablePanel defaultSize={uploadedFile ? 40 : 70} minSize={30}>
            {isEditorReady ? (
              <NoteEditor
                ref={editorRef}
                content={content}
                onContentChange={handleContentChange}
                onAISummarize={handleAISummarize}
                noteId={noteId ? parseInt(noteId) : 0}
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
              </div>
            )}
          </ResizablePanel>

          {/* File Preview Panel */}
          {uploadedFile && (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={30} minSize={20}>
                <FilePreview
                  fileId={uploadedFile.id}
                  fileName={uploadedFile.fileName}
                  fileUrl={uploadedFile.fileUrl}
                  extension={uploadedFile.extension}
                  publicId={uploadedFile.publicId}
                  onFileSummarize={handleFileSummarize}
                  onFileDeleted={() => setUploadedFile(null)}
                />
              </ResizablePanel>
            </>
          )}

          {/* AI Summarize Panel */}
          {summaries.length > 0 ? (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={uploadedFile ? 30 : 30} minSize={20}>
                <AISummarizePanel
                  summaries={summaries}
                  onRemoveSummary={handleRemoveSummary}
                />
              </ResizablePanel>
            </>
          ) : null}
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default NotePage;
