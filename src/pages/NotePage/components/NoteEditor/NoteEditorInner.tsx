import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { BlockNoteEditor as BlockNoteEditorClass } from '@blocknote/core';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/mantine/style.css';
import '@blocknote/react/style.css';
import AiExplainTooltip from './AiExplainTooltip';
import { useAiExplain } from './useAiExplain';
import { useBlockNoteScheme } from './useBlockNoteScheme';
import { useTextSelection } from './useTextSelection';
import { hydrateBlocks, isEditorEmpty } from './utils';
import type { CollabReady, NoteEditorHandle } from './types';

interface NoteEditorInnerProps {
  collab: CollabReady;
  userName: string;
  userColor: string;
  userAvatarUrl?: string;
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

export default function NoteEditorInner({
  collab,
  userName,
  userColor,
  userAvatarUrl,
  editable,
  noteId,
  setId,
  initialContent,
  onContentChange,
  onAISummarize,
  innerRef,
}: NoteEditorInnerProps) {
  const blockNoteScheme = useBlockNoteScheme();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] =
    useState<BlockNoteEditorClass | null>(null);

  const blockNoteEditor = useCreateBlockNote({
    collaboration: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provider: collab.provider as any,
      fragment: collab.yjsDoc.getXmlFragment('document-store'),
      user: { name: userName, color: userColor, avatarUrl: userAvatarUrl },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setEditorInstance(blockNoteEditor as any);
  }, [blockNoteEditor]);

  // BlockNote ignores `initialContent` when collaboration is enabled. If the
  // server's Y.Doc is empty after first sync, hydrate it from the API content.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!editorInstance || !initialContent || hydratedRef.current) return;

    const tryHydrate = () => {
      if (hydratedRef.current) return;
      hydratedRef.current = true;
      if (!isEditorEmpty(editorInstance)) return;
      void hydrateBlocks(editorInstance, initialContent);
    };

    const onSynced = () => tryHydrate();
    collab.provider.on('synced', onSynced);
    if (collab.provider.isSynced) tryHydrate();
    return () => {
      collab.provider.off('synced', onSynced);
    };
  }, [editorInstance, collab.provider, initialContent]);

  const handleEditorChange = useCallback(() => {
    if (editorInstance) {
      onContentChange(
        editorInstance.blocksToHTMLLossy(editorInstance.document),
      );
    }
  }, [editorInstance, onContentChange]);

  useImperativeHandle(
    innerRef,
    () => ({
      getHTML: async () => {
        if (editorInstance) {
          return await editorInstance.blocksToHTMLLossy(editorInstance.document);
        }
        return '';
      },
      getMarkdown: async () => {
        if (editorInstance) {
          return await editorInstance.blocksToMarkdownLossy(editorInstance.document);
        }
        return '';
      },
      getText: async () => {
        if (editorInstance) {
          const html = await editorInstance.blocksToHTMLLossy(editorInstance.document);
          const div = document.createElement('div');
          div.innerHTML = html;
          return div.textContent || '';
        }
        return '';
      },
    }),
    [editorInstance],
  );

  const insertCodeBlockAtCursor = useCallback(() => {
    if (!editorInstance) return;
    const { block } = editorInstance.getTextCursorPosition();
    const isEmptyParagraph =
      block.type === 'paragraph' &&
      Array.isArray(block.content) &&
      block.content.length === 0;

    const targetBlock = isEmptyParagraph
      ? editorInstance.updateBlock(block, { type: 'codeBlock' })
      : editorInstance.insertBlocks(
          [{ type: 'codeBlock' }],
          block,
          'after',
        )[0];

    editorInstance.setTextCursorPosition(targetBlock, 'end');
    editorInstance.focus();
  }, [editorInstance]);

  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        insertCodeBlockAtCursor();
      }
    };
    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [insertCodeBlockAtCursor]);

  // Safety net: BlockNote binds Mod-Z/Mod-Y to undo/redo internally, but if
  // that binding doesn't fire for any reason, fall back to calling the
  // editor's undo/redo API directly. Skipped when another handler already
  // consumed the key (`defaultPrevented`) to avoid double-undoing.
  useEffect(() => {
    const container = editorContainerRef.current;
    if (!container || !editorInstance || !editable) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented || !(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        editorInstance.undo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        editorInstance.redo();
      }
    };
    container.addEventListener('keydown', onKeyDown);
    return () => container.removeEventListener('keydown', onKeyDown);
  }, [editorInstance, editable]);

  const selection = useTextSelection(editorContainerRef);
  const { explain, isPending } = useAiExplain({
    setId,
    noteId,
    onResult: onAISummarize,
    onSuccess: selection.hide,
  });

  return (
    <div className='relative w-full h-full overflow-hidden flex flex-col bg-[var(--pl-bg)]'>
      {selection.showSummarizeBtn && selection.selectedText && (
        <AiExplainTooltip
          ref={selection.tooltipRef}
          isPending={isPending}
          onClick={() => void explain(selection.selectedText)}
        />
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
