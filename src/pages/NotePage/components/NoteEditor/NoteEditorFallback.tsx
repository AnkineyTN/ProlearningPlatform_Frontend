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
import AiExplainTooltip from './AiExplainTooltip';
import { useAiExplain } from './useAiExplain';
import { useBlockNoteScheme } from './useBlockNoteScheme';
import { useTextSelection } from './useTextSelection';
import { hydrateBlocks } from './utils';
import type { NoteEditorHandle } from './types';

interface NoteEditorFallbackProps {
  content: string;
  editable: boolean;
  noteId: number;
  setId: number;
  onContentChange: (content: string) => void;
  onAISummarize: (selectedText: string, response: string) => void;
  innerRef: React.Ref<NoteEditorHandle>;
}

export default function NoteEditorFallback({
  content,
  editable,
  noteId,
  setId,
  onContentChange,
  onAISummarize,
  innerRef,
}: NoteEditorFallbackProps) {
  const blockNoteScheme = useBlockNoteScheme();
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] =
    useState<BlockNoteEditorClass | null>(null);

  const blockNoteEditor = useCreateBlockNote({});

  useEffect(() => {
    setEditorInstance(blockNoteEditor);
  }, [blockNoteEditor]);

  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!editorInstance || !content || hydratedRef.current) return;
    hydratedRef.current = true;
    void hydrateBlocks(editorInstance, content);
  }, [editorInstance, content]);

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
          return await editorInstance.blocksToHTMLLossy(
            editorInstance.document,
          );
        }
        return '';
      },
    }),
    [editorInstance],
  );

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
          containerRef={editorContainerRef}
          tooltipPos={selection.tooltipPos}
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
