import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { useTheme } from '@/components/theme/theme-provider';
import { BlockNoteEditor as BlockNoteEditorClass } from '@blocknote/core';
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
  /** Persisted note content (BlockNote JSON) loaded from API. Used to hydrate
   * the Y.Doc the first time we sync if the server's doc is empty. */
  initialContent: string;
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
  initialContent,
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

  // Hydrate the Y.Doc from API content the first time we sync.
  // BlockNote ignores `initialContent` when collaboration is enabled, so the
  // editor only shows what the Hocuspocus server has in the Y.Doc. If the
  // server's doc is empty (e.g. first time opening this note, or backend
  // doesn't seed Y.Doc from DB), the persisted JSON content from the API
  // would otherwise never appear. After the first sync, if the editor is
  // still empty, we replace its blocks with the parsed API content.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!editorInstance || !initialContent) return;
    if (hydratedRef.current) return;

    const tryHydrate = () => {
      if (hydratedRef.current) return;
      hydratedRef.current = true;
      const blocks = editorInstance.document;
      const isEmpty =
        !blocks ||
        blocks.length === 0 ||
        (blocks.length === 1 &&
          blocks[0].type === 'paragraph' &&
          (!blocks[0].content ||
            (Array.isArray(blocks[0].content) &&
              blocks[0].content.length === 0)));
      if (!isEmpty) return;
      const doHydrate = async () => {
        try {
          const trimmed = initialContent.trim();
          if (trimmed.startsWith('[')) {
            try {
              const parsed = JSON.parse(trimmed);
              if (Array.isArray(parsed) && parsed.length > 0) {
                editorInstance.replaceBlocks(editorInstance.document, parsed);
                return;
              }
            } catch {
              // fall through to HTML
            }
          }
          const parsed =
            await editorInstance.tryParseHTMLToBlocks(initialContent);
          if (parsed && parsed.length > 0) {
            editorInstance.replaceBlocks(editorInstance.document, parsed);
          }
        } catch (e) {
          console.error('[NoteEditor] Failed to hydrate collab content:', e);
        }
      };
      void doHydrate();
    };

    const onSynced = () => tryHydrate();
    collab.provider.on('synced', onSynced);
    if (collab.provider.isSynced) tryHydrate();
    return () => {
      collab.provider.off('synced', onSynced);
    };
  }, [editorInstance, collab.provider, initialContent]);

  // Sync content changes to parent for auto-save
  const handleEditorChange = useCallback(() => {
    if (editorInstance) {
      onContentChange(
        editorInstance.blocksToHTMLLossy(editorInstance.document),
      );
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

  // Text selection for AI Explain — scoped to editor container only
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      if (!text || !selection || selection.rangeCount === 0) {
        setShowSummarizeBtn(false);
        setSelectedText('');
        return;
      }
      const range = selection.getRangeAt(0);
      const container = editorContainerRef.current;
      if (
        !container ||
        !container.contains(range.startContainer) ||
        !container.contains(range.endContainer)
      ) {
        setShowSummarizeBtn(false);
        setSelectedText('');
        return;
      }
      setSelectedText(text);
      const rect = range.getBoundingClientRect();
      const editorRect = container.getBoundingClientRect();
      // Place button to the LEFT of the selection, vertically centered with it
      const buttonWidth = 130;
      const xRaw = rect.left - editorRect.left - buttonWidth - 8;
      setTooltipPos({
        x: Math.max(6, xRaw),
        y: rect.top - editorRect.top,
      });
      setShowSummarizeBtn(true);
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
    <div className='relative w-full h-full overflow-hidden flex flex-col bg-[var(--pl-bg)]'>
      {showSummarizeBtn && selectedText && (
        <div
          ref={tooltipRef}
          className='absolute rounded-lg shadow-lg bg-[var(--pl-bg)] z-50 flex items-center gap-2'
          style={{
            right: `${(editorContainerRef.current?.getBoundingClientRect().left ?? 0) + tooltipPos.x + 20}px`,
            top: `${tooltipPos.y}px`,
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
        className='flex-1 overflow-auto focus-within:outline-none px-8 py-6 text-[var(--pl-text)] bg-[var(--pl-bg)]'
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

  const blockNoteEditor = useCreateBlockNote({});

  useEffect(() => {
    setEditorInstance(blockNoteEditor);
  }, [blockNoteEditor]);

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!editorInstance || !content || hydratedRef.current) return;
    hydratedRef.current = true;

    const hydrate = async () => {
      try {
        // Backward compat: old notes stored as BlockNote JSON
        const trimmed = content.trim();
        if (trimmed.startsWith('[')) {
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed) && parsed.length > 0) {
              editorInstance.replaceBlocks(editorInstance.document, parsed);
              return;
            }
          } catch {
            // not JSON, fall through to HTML parse
          }
        }
        const parsed = await editorInstance.tryParseHTMLToBlocks(content);
        if (parsed && parsed.length > 0) {
          editorInstance.replaceBlocks(editorInstance.document, parsed);
        }
      } catch (e) {
        console.error('[NoteEditor] Failed to hydrate content:', e);
      }
    };

    void hydrate();
  }, [editorInstance, content]);

  const handleEditorChange = useCallback(() => {
    if (editorInstance)
      onContentChange(
        editorInstance.blocksToHTMLLossy(editorInstance.document),
      );
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
      if (!text || !selection || selection.rangeCount === 0) {
        setShowSummarizeBtn(false);
        setSelectedText('');
        return;
      }
      const range = selection.getRangeAt(0);
      const container = editorContainerRef.current;
      if (
        !container ||
        !container.contains(range.startContainer) ||
        !container.contains(range.endContainer)
      ) {
        setShowSummarizeBtn(false);
        setSelectedText('');
        return;
      }
      setSelectedText(text);
      const rect = range.getBoundingClientRect();
      const editorRect = container.getBoundingClientRect();
      const buttonWidth = 130;
      const xRaw = rect.left - editorRect.left - buttonWidth - 8;
      setTooltipPos({
        x: Math.max(8, xRaw),
        y: rect.top - editorRect.top,
      });
      setShowSummarizeBtn(true);
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
    <div className='relative w-full h-full overflow-hidden flex flex-col bg-[var(--pl-bg)]'>
      {showSummarizeBtn && selectedText && (
        <div
          ref={tooltipRef}
          className='absolute rounded-lg shadow-lg bg-[var(--pl-bg)] z-50 flex items-center gap-2'
          style={{
            right: `${(editorContainerRef.current?.getBoundingClientRect().left ?? 0) + tooltipPos.x + 20}px`,
            top: `${tooltipPos.y}px`,
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
        className='flex-1 overflow-auto focus-within:outline-none px-8 py-6 text-[var(--pl-text)] bg-[var(--pl-bg)]'
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
  /** Timestamp of the last successful auto-save / manual save */
  lastSavedAt?: Date | null;
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
      lastSavedAt = null,
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

      // Track online users via awareness.
      // Defer the parent setState to a microtask: BlockNote's `useCreateBlockNote`
      // sets local awareness synchronously during the inner editor's render, which
      // would otherwise trigger `setState during render of a different component`.
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
        queueMicrotask(() => {
          if (!cancelled) onOnlineUsersChange?.(users);
        });
      });

      if (!cancelled) {
        setCollabReady({ yjsDoc, provider });
      }

      return () => {
        cancelled = true;
        const localProvider = provider;
        const localDoc = yjsDoc;
        setCollabReady(null);
        // Defer Yjs/provider tear-down so the inner editor (which holds a
        // BlockNote instance bound to this Y.Doc fragment) can unmount first.
        // Destroying the doc synchronously here causes `RangeError: Position
        // out of range` when BlockNote's observer flushes pending updates
        // against an already-destroyed doc.
        setTimeout(() => {
          localProvider?.awareness?.setLocalState(null);
          localProvider?.disconnect();
          localProvider?.destroy();
          localDoc.destroy();
        }, 0);
      };
    }, [noteId, onConnStatusChange, onOnlineUsersChange, wsUrl]);

    const disconnectedBanner = connStatus === 'disconnected' && collabReady && (
      <div className='flex items-center gap-1.5 px-6 py-1.5 text-xs font-medium border-b border-[var(--bg-warning)] bg-[var(--bg-warning)] text-[var(--text-warning)]'>
        <WifiOff className='size-3.5' />
        Lost connection — reconnecting…
      </div>
    );

    const savedLabel = lastSavedAt
      ? `Auto-saved at ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
      : null;

    const connectedIndicator = connStatus === 'connected' && collabReady && (
      <div className='flex items-center gap-3 px-6 py-1 text-[10px] tracking-[0.18em] uppercase text-[var(--pl-accent)]'>
        <span className='flex items-center gap-1.5'>
          <Wifi className='size-3' />
          Synced
        </span>
        {savedLabel && (
          <span className='text-[var(--pl-text-faint)]'>{savedLabel}</span>
        )}
      </div>
    );

    const offlineSavedIndicator = !collabReady && savedLabel && (
      <div className='flex items-center gap-1.5 px-6 py-1 text-[10px] tracking-[0.18em] uppercase text-[var(--pl-text-faint)]'>
        {savedLabel}
      </div>
    );

    return (
      <div className='relative w-full h-full overflow-hidden flex flex-col bg-[var(--pl-bg)]'>
        {disconnectedBanner}
        {connectedIndicator}
        {offlineSavedIndicator}

        {collabReady ? (
          <NoteEditorInner
            collab={collabReady}
            userName={currentUserName}
            userColor={userColor}
            editable={editable}
            noteId={noteId}
            setId={setId}
            initialContent={content}
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
