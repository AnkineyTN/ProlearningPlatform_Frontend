import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useTheme } from '@/components/theme/theme-provider';
import {
  BlockNoteEditor as BlockNoteEditorClass,
  type PartialBlock,
} from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import '@blocknote/react/style.css';
import { Button } from '@/components/ui/button';
import { Sparkles, LoaderCircle, Wifi, WifiOff } from 'lucide-react';
import { useExplainText } from '@/hooks/useNotes';
import { mapI18nToAiApiLanguage } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import './notes.css';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import type { CollabRole } from '@/services/types/collaboration.types';

export interface NoteEditorHandle {
  getHTML: () => Promise<string>;
}

interface CollabReady {
  yjsDoc: Y.Doc;
  provider: HocuspocusProvider;
}

interface OnlineUser {
  name: string;
  color: string;
}

// ─── Utility: generate deterministic color per userId ─────────────────────────
function generateUserColor(userId: number): string {
  const colors = [
    '#958DF1',
    '#F98181',
    '#FBBC88',
    '#FAF594',
    '#70CFF8',
    '#94FADB',
    '#B9F18D',
  ];
  return colors[userId % colors.length];
}

// ─── Inner component: only mounts after provider is ready ────────────────────

interface NoteEditorInnerProps {
  collab: CollabReady;
  userName: string;
  userColor: string;
  editable: boolean;
  noteId: number;
  setId: number;
  onContentChange: (content: string) => void;
  onAISummarize: (selectedText: string, response: string) => void;
  innerRef: React.Ref<NoteEditorHandle>;
}

function NoteEditorInner({
  collab,
  userName,
  userColor,
  editable,
  noteId,
  setId,
  onContentChange,
  onAISummarize,
  innerRef,
}: NoteEditorInnerProps) {
  const { i18n } = useTranslation();
  const { theme: appTheme } = useTheme();
  const [blockNoteScheme, setBlockNoteScheme] = useState<'light' | 'dark'>(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light',
  );
  const [selectedText, setSelectedText] = useState('');
  const [showSummarizeBtn, setShowSummarizeBtn] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] =
    useState<BlockNoteEditorClass | null>(null);
  const explainTextMutation = useExplainText();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const blockNoteEditor = useCreateBlockNote({
    collaboration: {
      // Cast provider to any to avoid type mismatch between @hocuspocus/provider and BlockNote's expected type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provider: collab.provider as any,
      fragment: collab.yjsDoc.getXmlFragment('document-store'),
      user: { name: userName, color: userColor },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setEditorInstance(blockNoteEditor as any);
  }, [blockNoteEditor]);

  // Sync content changes to parent for auto-save
  const handleEditorChange = useCallback(() => {
    if (editorInstance) {
      onContentChange(JSON.stringify(editorInstance.document));
    }
  }, [editorInstance, onContentChange]);

  // Theme sync
  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setBlockNoteScheme(root.classList.contains('dark') ? 'dark' : 'light');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [appTheme]);

  useImperativeHandle(
    innerRef,
    () => ({
      getHTML: async () => {
        if (editorInstance) {
          return await editorInstance.blocksToHTMLLossy(
            editorInstance.document,
          );
        }
        return '';
      },
    }),
    [editorInstance],
  );

  // Text selection for AI explain
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      if (text.length > 0) {
        setSelectedText(text);
        const range = selection?.getRangeAt(0);
        if (range && editorContainerRef.current) {
          const rect = range.getBoundingClientRect();
          const editorRect = editorContainerRef.current.getBoundingClientRect();
          setTooltipPos({
            x: rect.left - editorRect.left,
            y: rect.top - editorRect.top - 40,
          });
          setShowSummarizeBtn(true);
        }
      } else {
        setShowSummarizeBtn(false);
        setSelectedText('');
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !editorContainerRef.current?.contains(e.target as Node)
      ) {
        setShowSummarizeBtn(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAISummarize = useCallback(async () => {
    if (!selectedText || !setId || !noteId) {
      if (!selectedText) return;
      toast.error('Invalid note');
      return;
    }
    try {
      const response = await explainTextMutation.mutateAsync({
        setId,
        data: {
          language: mapI18nToAiApiLanguage(i18n.language),
          note_id: noteId,
          query_text: selectedText,
        },
      });
      onAISummarize(selectedText, response.data.data.answer);
      setShowSummarizeBtn(false);
      toast.success('Explained successfully');
    } catch {
      toast.error('Failed to explain text');
    }
  }, [
    selectedText,
    setId,
    noteId,
    i18n.language,
    explainTextMutation,
    onAISummarize,
  ]);

  return (
    <div className='relative w-full h-full overflow-hidden flex flex-col'>
      {showSummarizeBtn && selectedText && (
        <div
          ref={tooltipRef}
          className='fixed rounded-lg shadow-lg bg-[var(--pl-bg)] z-50 flex items-center gap-2'
          style={{
            left: `${(editorContainerRef.current?.getBoundingClientRect().left ?? 0) + tooltipPos.x}px`,
            top: `${(editorContainerRef.current?.getBoundingClientRect().top ?? 0) + tooltipPos.y}px`,
          }}
        >
          <Button
            size='sm'
            onClick={() => void handleAISummarize()}
            disabled={explainTextMutation.isPending}
            className='gap-2'
          >
            {explainTextMutation.isPending ? (
              <LoaderCircle className='w-4 h-4 animate-spin' />
            ) : (
              <Sparkles className='w-4 h-4' />
            )}
            AI Explain
          </Button>
        </div>
      )}

      <div
        ref={editorContainerRef}
        className='flex-1 overflow-auto focus-within:outline-none px-8 text-foreground'
      >
        {editorInstance && (
          <BlockNoteView
            editor={editorInstance}
            theme={blockNoteScheme}
            onChange={handleEditorChange}
            editable={editable}
            className='block-note-editor'
          />
        )}
      </div>
    </div>
  );
}

// ─── Fallback editor: no collab (legacy / offline) ───────────────────────────

interface NoteEditorFallbackProps {
  content: string;
  editable: boolean;
  noteId: number;
  setId: number;
  onContentChange: (content: string) => void;
  onAISummarize: (selectedText: string, response: string) => void;
  innerRef: React.Ref<NoteEditorHandle>;
}

function NoteEditorFallback({
  content,
  editable,
  noteId,
  setId,
  onContentChange,
  onAISummarize,
  innerRef,
}: NoteEditorFallbackProps) {
  const { i18n } = useTranslation();
  const { theme: appTheme } = useTheme();
  const [blockNoteScheme, setBlockNoteScheme] = useState<'light' | 'dark'>(
    () =>
      typeof document !== 'undefined' &&
      document.documentElement.classList.contains('dark')
        ? 'dark'
        : 'light',
  );
  const [selectedText, setSelectedText] = useState('');
  const [showSummarizeBtn, setShowSummarizeBtn] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] =
    useState<BlockNoteEditorClass | null>(null);
  const explainTextMutation = useExplainText();

  const blockNoteEditor = useCreateBlockNote({
    initialContent: content
      ? (() => {
          try {
            return JSON.parse(content) as PartialBlock[];
          } catch {
            return undefined;
          }
        })()
      : undefined,
  });

  useEffect(() => {
    setEditorInstance(blockNoteEditor);
  }, [blockNoteEditor]);

  const handleEditorChange = useCallback(() => {
    if (editorInstance)
      onContentChange(JSON.stringify(editorInstance.document));
  }, [editorInstance, onContentChange]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setBlockNoteScheme(root.classList.contains('dark') ? 'dark' : 'light');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [appTheme]);

  useImperativeHandle(
    innerRef,
    () => ({
      getHTML: async () => {
        if (editorInstance)
          return await editorInstance.blocksToHTMLLossy(
            editorInstance.document,
          );
        return '';
      },
    }),
    [editorInstance],
  );

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      if (text.length > 0) {
        setSelectedText(text);
        const range = selection?.getRangeAt(0);
        if (range && editorContainerRef.current) {
          const rect = range.getBoundingClientRect();
          const editorRect = editorContainerRef.current.getBoundingClientRect();
          setTooltipPos({
            x: rect.left - editorRect.left,
            y: rect.top - editorRect.top - 40,
          });
          setShowSummarizeBtn(true);
        }
      } else {
        setShowSummarizeBtn(false);
        setSelectedText('');
      }
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !editorContainerRef.current?.contains(e.target as Node)
      ) {
        setShowSummarizeBtn(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleAISummarize = useCallback(async () => {
    if (!selectedText) return;
    if (!setId || !noteId) {
      toast.error('Invalid note');
      return;
    }
    try {
      const response = await explainTextMutation.mutateAsync({
        setId,
        data: {
          language: mapI18nToAiApiLanguage(i18n.language),
          note_id: noteId,
          query_text: selectedText,
        },
      });
      onAISummarize(selectedText, response.data.data.answer);
      setShowSummarizeBtn(false);
      toast.success('Explained successfully');
    } catch {
      toast.error('Failed to explain text');
    }
  }, [
    selectedText,
    setId,
    noteId,
    i18n.language,
    explainTextMutation,
    onAISummarize,
  ]);

  return (
    <div className='relative w-full h-full overflow-hidden flex flex-col'>
      {showSummarizeBtn && selectedText && (
        <div
          ref={tooltipRef}
          className='fixed rounded-lg shadow-lg bg-[var(--pl-bg)] z-50 flex items-center gap-2'
          style={{
            left: `${(editorContainerRef.current?.getBoundingClientRect().left ?? 0) + tooltipPos.x}px`,
            top: `${(editorContainerRef.current?.getBoundingClientRect().top ?? 0) + tooltipPos.y}px`,
          }}
        >
          <Button
            size='sm'
            onClick={() => void handleAISummarize()}
            disabled={explainTextMutation.isPending}
            className='gap-2'
          >
            {explainTextMutation.isPending ? (
              <LoaderCircle className='w-4 h-4 animate-spin' />
            ) : (
              <Sparkles className='w-4 h-4' />
            )}
            AI Explain
          </Button>
        </div>
      )}
      <div
        ref={editorContainerRef}
        className='flex-1 overflow-auto focus-within:outline-none px-8 text-foreground'
      >
        {editorInstance && (
          <BlockNoteView
            editor={editorInstance}
            theme={blockNoteScheme}
            onChange={handleEditorChange}
            editable={editable}
            className='block-note-editor'
          />
        )}
      </div>
    </div>
  );
}

// ─── Public outer component ───────────────────────────────────────────────────

interface NoteEditorProps {
  noteId: number;
  content: string;
  onContentChange: (content: string) => void;
  onAISummarize: (selectedText: string, response: string) => void;
  userRole?: CollabRole;
  /** Called when online users list changes */
  onOnlineUsersChange?: (users: OnlineUser[]) => void;
  /** Called when connection status changes */
  onConnStatusChange?: (
    status: 'connecting' | 'connected' | 'disconnected',
  ) => void;
  currentUserId?: number;
  currentUserName?: string;
}

export const NoteEditor = forwardRef<NoteEditorHandle, NoteEditorProps>(
  (
    {
      noteId,
      content,
      onContentChange,
      onAISummarize,
      userRole = 'OWNER',
      onOnlineUsersChange,
      onConnStatusChange,
      currentUserId = 0,
      currentUserName = 'User',
    },
    ref,
  ) => {
    const { setId: setIdParam } = useParams<{ setId: string }>();
    const setId = setIdParam ? Number(setIdParam) : 0;

    const [collabReady, setCollabReady] = useState<CollabReady | null>(null);
    const [connStatus, setConnStatus] = useState<
      'connecting' | 'connected' | 'disconnected'
    >('connecting');

    const editable = userRole === 'OWNER' || userRole === 'EDITOR';
    const userColor = generateUserColor(currentUserId);

    const wsUrl = import.meta.env.VITE_COLLAB_WS_URL as string | undefined;

    useEffect(() => {
      // Skip collab if no WS URL configured
      if (!wsUrl || !noteId) return;

      let provider: HocuspocusProvider | null = null;
      let cancelled = false;

      const token = localStorage.getItem('token') ?? '';
      const yjsDoc = new Y.Doc();

      provider = new HocuspocusProvider({
        url: wsUrl,
        name: `note-${noteId}`,
        document: yjsDoc,
        token,

        onStatus: ({ status }) => {
          const mapped =
            status === 'connected'
              ? 'connected'
              : status === 'disconnected'
                ? 'disconnected'
                : 'connecting';
          setConnStatus(mapped);
          onConnStatusChange?.(mapped);
        },

        onAuthenticationFailed: () => {
          // JWT expired or removed from note
          const newToken = localStorage.getItem('token') ?? '';
          if (newToken) {
            provider?.setConfiguration({ token: newToken });
            provider?.connect();
          } else {
            window.location.href = '/login';
          }
        },
      });

      // Track online users via awareness
      provider.awareness?.on('change', () => {
        const users: OnlineUser[] = [];
        provider?.awareness?.getStates().forEach((state) => {
          if (state?.user) {
            users.push({
              name: String(state.user.name),
              color: String(state.user.color),
            });
          }
        });
        onOnlineUsersChange?.(users);
      });

      if (!cancelled) {
        setCollabReady({ yjsDoc, provider });
      }

      return () => {
        cancelled = true;
        setCollabReady(null);
        provider?.awareness?.setLocalState(null);
        provider?.disconnect();
        yjsDoc.destroy();
      };
    }, [noteId, wsUrl]);

    // Connection status banner
    const disconnectedBanner = connStatus === 'disconnected' && collabReady && (
      <div className='flex items-center gap-1.5 bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'>
        <WifiOff className='size-3.5' />
        Lost connection — reconnecting…
      </div>
    );

    const connectedIndicator = connStatus === 'connected' && collabReady && (
      <div className='flex items-center gap-1.5 px-3 py-0.5 text-xs text-green-600 dark:text-green-400'>
        <Wifi className='size-3.5' />
        Synced
      </div>
    );

    return (
      <div className='relative w-full h-full overflow-hidden flex flex-col'>
        {disconnectedBanner}
        {connectedIndicator}

        {collabReady ? (
          <NoteEditorInner
            collab={collabReady}
            userName={currentUserName}
            userColor={userColor}
            editable={editable}
            noteId={noteId}
            setId={setId}
            onContentChange={onContentChange}
            onAISummarize={onAISummarize}
            innerRef={ref}
          />
        ) : (
          // Fallback: no WS URL or still initialising — use non-collab editor
          <NoteEditorFallback
            content={content}
            editable={editable}
            noteId={noteId}
            setId={setId}
            onContentChange={onContentChange}
            onAISummarize={onAISummarize}
            innerRef={ref}
          />
        )}
      </div>
    );
  },
);
