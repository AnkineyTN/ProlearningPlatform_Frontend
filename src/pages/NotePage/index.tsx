import "./notes.css";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import { AISummarizePanel } from "@/pages/NotePage/AISummarizePanel";
import { FilePreview } from "@/pages/NotePage/FilePreview";
import { NoteEditor } from "@/pages/NotePage/NoteEditor";
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
  const { noteId } = useParams<{ noteId: string }>();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [summaries, setSummaries] = useState<AISummary[]>([]);

  const { data: noteDetail, isLoading: isLoadingNote } = useNoteDetail(
    noteId ? parseInt(noteId) : 0,
  );
  const autoSaveMutation = useAutoSaveNote();

  // Load note detail on mount
  useEffect(() => {
    if (noteDetail) {
      setTitle(noteDetail.title);
      setContent(noteDetail.content);
      // Load uploaded docs if any
      if (noteDetail.noteDocs && noteDetail.noteDocs.length > 0) {
        // Parse the first doc (structure depends on your API)
        // This is a placeholder - adjust based on your actual API response
      }
    }
  }, [noteDetail]);

  // Auto-save on content change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (noteId && (title || content)) {
        autoSaveMutation.mutate({
          noteId: parseInt(noteId),
          title,
          content,
        });
      }
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(timer);
  }, [title, content, noteId, autoSaveMutation]);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleSave = () => {
    if (noteId) {
      autoSaveMutation.mutate({
        noteId: parseInt(noteId),
        title,
        content,
      });
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

  const handleDownloadHTML = useCallback(() => {
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
        <pre>${escapeHtml(content)}</pre>
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
  }, [title, content]);

  const escapeHtml = (text: string) => {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  };

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
            <NoteEditor
              content={content}
              onContentChange={handleContentChange}
              onAISummarize={handleAISummarize}
              noteId={noteId ? parseInt(noteId) : 0}
            />
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
