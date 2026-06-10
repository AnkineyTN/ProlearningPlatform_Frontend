import type * as Y from 'yjs';
import type { HocuspocusProvider } from '@hocuspocus/provider';

export interface NoteEditorHandle {
  getHTML: () => Promise<string>;
  getMarkdown: () => Promise<string>;
  getText: () => Promise<string>;
}

export interface CollabReady {
  yjsDoc: Y.Doc;
  provider: HocuspocusProvider;
}

export interface OnlineUser {
  name: string;
  color: string;
}

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';
