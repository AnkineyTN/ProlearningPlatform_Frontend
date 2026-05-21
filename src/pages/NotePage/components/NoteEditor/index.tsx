import { forwardRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import type { CollabRole } from '@/services/types/collaboration.types';
import '../../notes.css';
import ConnectionIndicators from './ConnectionIndicators';
import NoteEditorFallback from './NoteEditorFallback';
import NoteEditorInner from './NoteEditorInner';
import type {
  CollabReady,
  ConnectionStatus,
  NoteEditorHandle,
  OnlineUser,
} from './types';
import { generateUserColor } from './utils';

export type { NoteEditorHandle } from './types';

interface NoteEditorProps {
  noteId: number;
  content: string;
  onContentChange: (content: string) => void;
  onAISummarize: (selectedText: string, response: string) => void;
  userRole?: CollabRole;
  /** Called when online users list changes */
  onOnlineUsersChange?: (users: OnlineUser[]) => void;
  /** Called when connection status changes */
  onConnStatusChange?: (status: ConnectionStatus) => void;
  currentUserId?: number;
  currentUserName?: string;
  /** Timestamp of the last successful auto-save / manual save */
  lastSavedAt?: Date | null;
}

export const NoteEditor = forwardRef<NoteEditorHandle, NoteEditorProps>(
  function NoteEditor(
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
  ) {
    const { setId: setIdParam } = useParams<{ setId: string }>();
    const setId = setIdParam ? Number(setIdParam) : 0;

    const [collabReady, setCollabReady] = useState<CollabReady | null>(null);
    const [connStatus, setConnStatus] = useState<ConnectionStatus>('connecting');

    const editable = userRole === 'OWNER' || userRole === 'EDITOR';
    const userColor = generateUserColor(currentUserId);
    const wsUrl = import.meta.env.VITE_COLLAB_WS_URL as string | undefined;

    useEffect(() => {
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
          const mapped: ConnectionStatus =
            status === 'connected'
              ? 'connected'
              : status === 'disconnected'
                ? 'disconnected'
                : 'connecting';
          setConnStatus(mapped);
          onConnStatusChange?.(mapped);
        },

        onAuthenticationFailed: () => {
          const newToken = localStorage.getItem('token') ?? '';
          if (newToken) {
            provider?.setConfiguration({ token: newToken });
            provider?.connect();
          } else {
            window.location.href = '/login';
          }
        },
      });

      // Defer parent setState to microtask: BlockNote sets local awareness
      // synchronously during render, which would otherwise trigger
      // `setState during render of a different component`.
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

    return (
      <div className='relative w-full h-full overflow-hidden flex flex-col bg-[var(--pl-bg)]'>
        <ConnectionIndicators
          status={connStatus}
          collabActive={collabReady != null}
          lastSavedAt={lastSavedAt}
        />

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
