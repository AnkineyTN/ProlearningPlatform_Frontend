import "./notes.css";

import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

import { AISummarizePanel } from "@/pages/NotePage/AISummarizePanel";
import { NoteFilesPanel } from "@/pages/NotePage/NoteFilesPanel";
import { NoteEditor, type NoteEditorHandle } from "@/pages/NotePage/NoteEditor";
import { NoteHeader } from "@/pages/NotePage/NoteHeader";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  useAutoSaveNote,
  useNoteDetail,
  useNoteFileRegionComments,
} from "@/hooks/useNotes";
import { isImageExtension } from "@/lib/utils";
import type { NoteDocItem } from "@/services/types/note.types";

interface UploadedFile {
  id: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
  kind: "doc" | "image";
}

function noteItemToUploadedFile(
  doc: NoteDocItem,
  kind: UploadedFile["kind"],
): UploadedFile {
  const ext = doc.fileName.includes(".")
    ? doc.fileName.split(".").pop() || ""
    : "";
  return {
    id: doc.assetId,
    fileName: doc.fileName,
    fileUrl: doc.fileUrl,
    extension: ext,
    publicId: doc.publicId,
    kind,
  };
}

function attachmentKey(f: UploadedFile) {
  return `${f.id}-${f.publicId}`;
}

function inferKindFromNoteDoc(doc: NoteDocItem): UploadedFile["kind"] {
  const ext = doc.fileName.includes(".")
    ? doc.fileName.split(".").pop() || ""
    : "";
  return isImageExtension(ext) ? "image" : "doc";
}

interface AISummary {
  id: string;
  query: string;
  response: string;
  type: "text" | "file";
}

export const NotePage = () => {
  const { setId: setIdParam, id: noteId } = useParams<{
    setId: string;
    id: string;
  }>();
  const setId = setIdParam ? Number(setIdParam) : 0;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [noteFiles, setNoteFiles] = useState<UploadedFile[]>([]);
  const [showFilesPanel, setShowFilesPanel] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const editorRef = useRef<NoteEditorHandle>(null);

  const { data: noteDetail, isLoading: isLoadingNote } = useNoteDetail(
    setId,
    noteId ? parseInt(noteId) : 0,
  );
  const autoSaveMutation = useAutoSaveNote();
  const autoSaveMutationRef = useRef(autoSaveMutation);
  autoSaveMutationRef.current = autoSaveMutation;

  const isInitialLoadRef = useRef(true);

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

  useEffect(() => {
    if (!noteDetail) return;
    const fromDocs = (noteDetail.noteDocs ?? []).map((d) =>
      noteItemToUploadedFile(d, inferKindFromNoteDoc(d)),
    );
    const fromImgs = (
      noteDetail.noteImgs ??
      noteDetail.noteImages ??
      []
    ).map((d) => noteItemToUploadedFile(d, "image"));
    const merged = new Map<string, UploadedFile>();
    for (const f of fromDocs) merged.set(attachmentKey(f), f);
    for (const f of fromImgs) merged.set(attachmentKey(f), f);
    setNoteFiles([...merged.values()]);
  }, [noteDetail]);

  useEffect(() => {
    if (isInitialLoadRef.current) return;

    const timer = setTimeout(() => {
      if (setId && noteId && (title || content)) {
        autoSaveMutationRef.current.mutate({
          setId,
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
    if (setId && noteId) {
      autoSaveMutation.mutate(
        {
          setId,
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

  const handleFileUploaded = useCallback((file: UploadedFile) => {
    setNoteFiles((prev) => {
      if (prev.some((f) => f.id === file.id)) return prev;
      return [...prev, file];
    });
    setShowFilesPanel(true);
  }, []);

  const handleFileDeleted = useCallback((fileId: number) => {
    setNoteFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const handleAISummarize = async (selectedText: string, response: string) => {
    const newSummary: AISummary = {
      id: Date.now().toString(),
      query: selectedText,
      response,
      type: "text",
    };

    setSummaries((prev) => [newSummary, ...prev]);
    setShowAiPanel(true);
  };

  const handleFileSummarize = (summary: string, fileName: string) => {
    const newSummary: AISummary = {
      id: Date.now().toString(),
      query: `Summarize content of ${fileName}`,
      response: summary,
      type: "file",
    };

    setSummaries((prev) => [newSummary, ...prev]);
    setShowAiPanel(true);
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

  const numericNoteId = noteId ? parseInt(noteId, 10) : 0;
  const setId = noteDetail?.setId ?? 0;
  const { data: fileRegionComments = [] } = useNoteFileRegionComments(
    setId,
    numericNoteId,
  );
  const hasFilesPanel = showFilesPanel && noteFiles.length > 0;
  const hasAiPanel = showAiPanel && summaries.length > 0;

  let editorDefaultSize = 100;
  let filesDefaultSize = 30;
  let aiDefaultSize = 30;
  if (hasFilesPanel && hasAiPanel) {
    editorDefaultSize = 40;
    filesDefaultSize = 30;
    aiDefaultSize = 30;
  } else if (hasFilesPanel || hasAiPanel) {
    editorDefaultSize = 65;
    filesDefaultSize = 35;
    aiDefaultSize = 35;
  }

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
      <NoteHeader
        title={title}
        onTitleChange={handleTitleChange}
        onSave={handleSave}
        isSaving={autoSaveMutation.isPending}
        noteId={numericNoteId}
        onFileUploaded={handleFileUploaded}
        onDownloadHTML={handleDownloadHTML}
        attachedFileCount={noteFiles.length}
        showFilesPanel={showFilesPanel}
        onToggleFilesPanel={() => setShowFilesPanel((v) => !v)}
        aiSummaryCount={summaries.length}
        showAiPanel={showAiPanel}
        onToggleAiPanel={() => setShowAiPanel((v) => !v)}
      />

      <div className='flex-1 overflow-hidden'>
        <ResizablePanelGroup className='w-full h-full' key={`${hasFilesPanel}-${hasAiPanel}`}>
          <ResizablePanel defaultSize={editorDefaultSize} minSize={30}>
            {isEditorReady ? (
              <NoteEditor
                ref={editorRef}
                noteId={numericNoteId}
                content={content}
                onContentChange={handleContentChange}
                onAISummarize={handleAISummarize}
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500' />
              </div>
            )}
          </ResizablePanel>

          {hasFilesPanel ? (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={filesDefaultSize} minSize={18}>
                <NoteFilesPanel
                  noteId={numericNoteId}
                  setId={setId}
                  fileComments={fileRegionComments}
                  files={noteFiles}
                  onFileSummarize={handleFileSummarize}
                  onFileDeleted={handleFileDeleted}
                  onClosePanel={() => setShowFilesPanel(false)}
                />
              </ResizablePanel>
            </>
          ) : null}

          {hasAiPanel ? (
            <>
              <ResizableHandle />
              <ResizablePanel defaultSize={aiDefaultSize} minSize={18}>
                <AISummarizePanel
                  summaries={summaries}
                  onRemoveSummary={handleRemoveSummary}
                  onClosePanel={() => setShowAiPanel(false)}
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
