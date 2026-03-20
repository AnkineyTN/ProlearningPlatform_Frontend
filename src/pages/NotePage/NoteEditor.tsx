import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { useTheme } from "@/components/theme/theme-provider";
import {
  BlockNoteEditor as BlockNoteEditorClass,
  type PartialBlock,
} from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/react/style.css";
import { Button } from "@/components/ui/button";
import { Sparkles, LoaderCircle } from "lucide-react";
import { useExplainText } from "@/hooks/useNotes";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import "./notes.css";

export interface NoteEditorHandle {
  getHTML: () => Promise<string>;
}

interface NoteEditorProps {
  noteId: number;
  content: string;
  onContentChange: (content: string) => void;
  onAISummarize: (selectedText: string, response: string) => void;
}

export const NoteEditor = forwardRef<NoteEditorHandle, NoteEditorProps>(({
  noteId,
  content,
  onContentChange,
  onAISummarize,
}, ref) => {
  const { i18n } = useTranslation();
  const { theme: appTheme } = useTheme();
  const [blockNoteScheme, setBlockNoteScheme] = useState<"light" | "dark">(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.classList.contains("dark")
        ? "dark"
        : "light",
  );
  const [selectedText, setSelectedText] = useState("");
  const [showSummarizeBtn, setShowSummarizeBtn] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [editor, setEditor] = useState<BlockNoteEditorClass | null>(null);
  const explainTextMutation = useExplainText();

  // Initialize BlockNote editor
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
    setEditor(blockNoteEditor);
  }, [blockNoteEditor]);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      setBlockNoteScheme(root.classList.contains("dark") ? "dark" : "light");
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [appTheme]);

  useImperativeHandle(ref, () => ({
    getHTML: async () => {
      if (editor) {
        return await editor.blocksToHTMLLossy(editor.document);
      }
      return "";
    },
  }), [editor]);

  // Handle content change from editor - save as JSON blocks
  const handleEditorChange = useCallback(() => {
    if (editor) {
      const jsonContent = JSON.stringify(editor.document);
      onContentChange(jsonContent);
    }
  }, [editor, onContentChange]);

  // Track text selection
  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() || "";

      if (selectedText.length > 0) {
        setSelectedText(selectedText);

        // Get selection position for tooltip
        const range = selection?.getRangeAt(0);
        if (range && editorRef.current) {
          const rect = range.getBoundingClientRect();
          const editorRect = editorRef.current.getBoundingClientRect();

          setTooltipPos({
            x: rect.left - editorRect.left,
            y: rect.top - editorRect.top - 40,
          });
          setShowSummarizeBtn(true);
        }
      } else {
        setShowSummarizeBtn(false);
        setSelectedText("");
      }
    };

    document.addEventListener("mouseup", handleMouseUp);
    return () => document.removeEventListener("mouseup", handleMouseUp);
  }, []);

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !editorRef.current?.contains(e.target as Node)
      ) {
        setShowSummarizeBtn(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAISummarize = useCallback(async () => {
    if (!selectedText) {
      return;
    }

    if (!noteId) {
      toast.error("Invalid note");
      return;
    }

    try {
      const response = await explainTextMutation.mutateAsync({
        lang: i18n.language || "vi",
        limit: "0",
        note_id: noteId,
        query_text: selectedText,
      });

      const aiResponse = response.data.data.answer;
      onAISummarize(selectedText, aiResponse);
      setShowSummarizeBtn(false);
      toast.success("Explained successfully");
    } catch {
      toast.error("Failed to explain text");
    }
  }, [selectedText, noteId, i18n.language, explainTextMutation, onAISummarize]);

  return (
    <div className='relative w-full h-full overflow-hidden flex flex-col'>
      {/* Floating AI Summarize Button */}
      {showSummarizeBtn && selectedText && (
        <div
          ref={tooltipRef}
          className='fixed rounded-lg shadow-lg bg-card z-50 flex items-center gap-2'
          style={{
            left: `${editorRef.current?.getBoundingClientRect().left || 0 + tooltipPos.x}px`,
            top: `${editorRef.current?.getBoundingClientRect().top || 0 + tooltipPos.y}px`,
          }}
        >
          <Button
            size='sm'
            onClick={handleAISummarize}
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

      {/* Editor Container */}
      <div
        ref={editorRef}
        className='flex-1 overflow-auto focus-within:outline-none px-8 text-foreground'
      >
        {editor && (
          <BlockNoteView
            editor={editor}
            theme={blockNoteScheme}
            onChange={handleEditorChange}
            className='block-note-editor'
          />
        )}
      </div>
    </div>
  );
});
