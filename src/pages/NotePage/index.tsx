import './notes.css';

import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { useTranslation } from 'react-i18next';
import { useBlocker, useNavigate, useParams } from 'react-router-dom';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ResourceAccessError } from '@/components/collaboration/ResourceAccessError';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { useAuth } from '@/hooks/useAuth';
import { useGenerateFlashcardsFromNotes } from '@/hooks/useFlashcards';
import {
  useAutoSaveNote,
  useNoteDetail,
  useNoteFileRegionComments,
} from '@/hooks/useNotes';
import { mapI18nToAiApiLanguage } from '@/lib/utils';
import { AISummarizePanel } from '@/pages/NotePage/components/AISummarizePanel';
import {
  exportNoteAsHtml,
  exportNoteAsMarkdown,
  exportNoteAsPdf,
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
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
  const [isDirty, setIsDirty] = useState(false);
  const [isSavingBeforeExit, setIsSavingBeforeExit] = useState(false);
  const editorRef = useRef<NoteEditorHandle>(null);

  const blocker = useBlocker(
    useCallback(
      ({
        currentLocation,
        nextLocation,
      }: {
        currentLocation: { pathname: string };
        nextLocation: { pathname: string };
      }) => isDirty && currentLocation.pathname !== nextLocation.pathname,
      [isDirty],
    ),
  );

  const {
    data: noteDetail,
    isLoading: isLoadingNote,
    error: noteError,
    refetch: refetchNote,
  } = useNoteDetail(numericSetId, noteId ? parseInt(noteId) : 0);
  const autoSaveMutation = useAutoSaveNote();
  const generateFlashcardsMutation = useGenerateFlashcardsFromNotes();
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
    if (!noteError) return;
    setIsDirty(false);
    if (blocker.state === 'blocked') blocker.proceed?.();
  }, [noteError, blocker]);

  useEffect(() => {
    if (isInitialLoadRef.current || noteError) return;

    setIsDirty(true);

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
            onSuccess: () => {
              setLastSavedAt(new Date());
              setIsDirty(false);
            },
          },
        );
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [title, content, noteId, setId, noteError]);

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
            setIsDirty(false);
            toast.success('Note saved successfully');
          },
          onError: (error) => {
            toast.error(apiErrorMessage(error, 'Failed to save note'));
          },
        },
      );
    }
  }, [setId, noteId, title, content]);

  const handleExitWithoutSaving = useCallback(() => {
    setIsDirty(false);
    blocker.proceed?.();
  }, [blocker]);

  const handleSaveAndExit = useCallback(() => {
    if (!setId || !noteId) {
      handleExitWithoutSaving();
      return;
    }
    setIsSavingBeforeExit(true);
    autoSaveMutationRef.current.mutate(
      {
        setId,
        noteId: parseInt(noteId),
        title,
        content,
      },
      {
        onSuccess: () => {
          setIsDirty(false);
          setIsSavingBeforeExit(false);
          blocker.proceed?.();
        },
        onError: (error) => {
          setIsSavingBeforeExit(false);
          toast.error(apiErrorMessage(error, 'Failed to save note'));
        },
      },
    );
  }, [setId, noteId, title, content, blocker, handleExitWithoutSaving]);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

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
    if (format === 'pdf') {
      const html = (await editorRef.current?.getHTML()) || '';
      exportNoteAsPdf(title, html);
      return;
    }
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

  const handleGenerateFlashcard = useCallback(async () => {
    if (!setId || !numericNoteId) return;
    try {
      const documentUrls = noteFiles
        .filter((f) => f.kind === 'doc')
        .map((f) => f.fileUrl);

      const result = await generateFlashcardsMutation.mutateAsync({
        setId,
        notes: [{ note_id: numericNoteId, document_urls: documentUrls }],
        language: mapI18nToAiApiLanguage(i18n.language),
        freeText: '',
      });

      const generatedFlashcards = result.data.content.split(';').map((card) => {
        const [frontCard, backCard] = card.split('|');
        return { frontCard: frontCard?.trim(), backCard: backCard?.trim() };
      });

      navigate(`/sets/${setId}/flashcards/editor`, {
        state: {
          title: result.data.title || title,
          description: result.data.description || '',
          privacy: noteDetail?.privacy ?? 'PRIVATE',
          generatedFlashcards,
        },
      });
    } catch (error) {
      console.error('Failed to generate flashcards from note:', error);
      toast.error(
        apiErrorMessage(error, 'Failed to generate flashcards from this note'),
      );
    }
  }, [
    setId,
    numericNoteId,
    noteFiles,
    generateFlashcardsMutation,
    i18n.language,
    navigate,
    title,
    noteDetail?.privacy,
  ]);

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

  if (noteError) {
    return (
      <ResourceAccessError
        resource='note'
        error={noteError}
        onRetry={() => void refetchNote()}
      />
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
        onGenerateFlashcard={handleGenerateFlashcard}
        isGeneratingFlashcard={generateFlashcardsMutation.isPending}
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

      <AlertDialog
        open={blocker.state === 'blocked'}
        onOpenChange={(open) => {
          if (!open && !isSavingBeforeExit) blocker.reset?.();
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('note.unsavedDialog.title')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('note.unsavedDialog.description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingBeforeExit}>
              {t('note.unsavedDialog.cancel')}
            </AlertDialogCancel>
            <Button
              variant='outline'
              onClick={handleExitWithoutSaving}
              disabled={isSavingBeforeExit}
              className='border-[var(--pl-danger-border)] text-[var(--pl-danger-text)] hover:bg-[var(--pl-danger-soft)]'
            >
              {t('note.unsavedDialog.exitWithoutSaving')}
            </Button>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSaveAndExit();
              }}
              disabled={isSavingBeforeExit}
            >
              {isSavingBeforeExit ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : null}
              {t('note.unsavedDialog.saveAndExit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default NotePage;
