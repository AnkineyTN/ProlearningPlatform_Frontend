import './notes.css';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { useParams } from 'react-router-dom';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useAuth } from '@/hooks/useAuth';
import {
  useAutoSaveNote,
  useNoteDetail,
  useNoteFileRegionComments,
} from '@/hooks/useNotes';
import { AISummarizePanel } from '@/pages/NotePage/components/AISummarizePanel';
import {
  exportNoteAsHtml,
  exportNoteAsMarkdown,
  exportNoteAsText,
  type ExportFormat,
} from '@/pages/NotePage/downloadNoteHtml';
import {
  NoteEditor,
  type NoteEditorHandle,
} from '@/pages/NotePage/components/NoteEditor';
import { NoteFilesPanel } from '@/pages/NotePage/components/FilePanel/NoteFilesPanel';
import { NoteHeader } from '@/pages/NotePage/components/NoteHeader';
import {
  attachmentKey,
  inferKindFromNoteDoc,
  noteItemToUploadedFile,
  type UploadedFile,
} from '@/pages/NotePage/components/noteTypes';
import { useNoteSummaries } from '@/pages/NotePage/hooks/useNoteSummaries';

export const NotePage = () => {
  const { setId: setIdParam, id: noteId } = useParams<{
    setId: string;
    id: string;
  }>();
  const numericSetId = setIdParam ? Number(setIdParam) : 0;
  const currentUser = useAuth().user;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [noteFiles, setNoteFiles] = useState<UploadedFile[]>([]);
  const [showFilesPanel, setShowFilesPanel] = useState(true);
  const [showAiPanel, setShowAiPanel] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<
    { name: string; color: string }[]
  >([]);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const editorRef = useRef<NoteEditorHandle>(null);

  const { data: noteDetail, isLoading: isLoadingNote } = useNoteDetail(
    numericSetId,
    noteId ? parseInt(noteId) : 0,
  );
  const autoSaveMutation = useAutoSaveNote();
  const autoSaveMutationRef = useRef(autoSaveMutation);
  autoSaveMutationRef.current = autoSaveMutation;

  const numericNoteId = noteId ? parseInt(noteId, 10) : 0;
  const setId = noteDetail?.setId ?? 0;

  const {
    summaries,
    addTextSummary,
    addFileSummary,
    saveSummary,
    removeSummary,
  } = useNoteSummaries({
    setId,
    noteId: numericNoteId,
    onSummaryAdded: () => setShowAiPanel(true),
  });

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
    const fromImgs = (noteDetail.noteImgs ?? noteDetail.noteImages ?? []).map(
      (d) => noteItemToUploadedFile(d, 'image'),
    );
    const merged = new Map<string, UploadedFile>();
    for (const f of fromDocs) merged.set(attachmentKey(f), f);
    for (const f of fromImgs) merged.set(attachmentKey(f), f);
    setNoteFiles([...merged.values()]);
  }, [noteDetail]);

  useEffect(() => {
    if (isInitialLoadRef.current) return;

    const timer = setTimeout(() => {
      if (setId && noteId && (title || content)) {
        autoSaveMutationRef.current.mutate(
          {
            setId,
            noteId: parseInt(noteId),
            title,
            content,
          },
          {
            onSuccess: () => setLastSavedAt(new Date()),
          },
        );
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [title, content, noteId, setId]);

  const handleSave = useCallback(() => {
    if (setId && noteId) {
      autoSaveMutationRef.current.mutate(
        {
          setId,
          noteId: parseInt(noteId),
          title,
          content,
        },
        {
          onSuccess: () => {
            setLastSavedAt(new Date());
            toast.success('Note saved successfully');
          },
          onError: () => {
            toast.error('Failed to save note');
          },
        },
      );
    }
  }, [setId, noteId, title, content]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSave]);

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

  const handleExport = useCallback(async (format: ExportFormat) => {
    if (format === 'html') {
      const html = (await editorRef.current?.getHTML()) || '';
      exportNoteAsHtml(title, html);
    } else if (format === 'md') {
      const md = (await editorRef.current?.getMarkdown()) || '';
      exportNoteAsMarkdown(title, md);
    } else {
      const text = (await editorRef.current?.getText()) || '';
      exportNoteAsText(title, text);
    }
    toast.success('Note exported successfully');
  }, [title]);

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
      <div className='w-full h-screen flex items-center justify-center bg-[var(--pl-bg-sunken)]'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-[var(--pl-accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3' />
          <p className='text-sm text-[var(--pl-text-muted)]'>Loading note…</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col w-full h-screen bg-[var(--pl-bg-sunken)]'>
      <NoteHeader
        title={title}
        onTitleChange={setTitle}
        noteId={numericNoteId}
        setId={setId}
        userRole={noteDetail?.userRole ?? 'OWNER'}
        onFileUploaded={handleFileUploaded}
        onExport={handleExport}
        attachedFileCount={noteFiles.length}
        showFilesPanel={showFilesPanel}
        onToggleFilesPanel={() => setShowFilesPanel((v) => !v)}
        aiSummaryCount={summaries.length}
        showAiPanel={showAiPanel}
        onToggleAiPanel={() => setShowAiPanel((v) => !v)}
        onlineUsers={onlineUsers}
        isFavorited={noteDetail?.isFavorited}
      />

      <div className='flex-1 overflow-hidden'>
        <ResizablePanelGroup
          className='w-full h-full'
          key={`${hasFilesPanel}-${hasAiPanel}`}
        >
          <ResizablePanel defaultSize={editorDefaultSize} minSize={30}>
            {isEditorReady ? (
              <NoteEditor
                ref={editorRef}
                noteId={numericNoteId}
                content={content}
                onContentChange={setContent}
                onAISummarize={addTextSummary}
                userRole={noteDetail?.userRole ?? 'OWNER'}
                currentUserId={currentUser?.id ?? 0}
                currentUserName={
                  currentUser
                    ? `${currentUser.firstName} ${currentUser.lastName}`
                    : 'User'
                }
                onOnlineUsersChange={setOnlineUsers}
                lastSavedAt={lastSavedAt}
              />
            ) : (
              <div className='flex items-center justify-center h-full'>
                <div className='w-8 h-8 border-2 border-[var(--pl-accent)] border-t-transparent rounded-full animate-spin' />
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
                  onFileSummarize={addFileSummary}
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
                  onRemoveSummary={removeSummary}
                  onSaveSummary={saveSummary}
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
