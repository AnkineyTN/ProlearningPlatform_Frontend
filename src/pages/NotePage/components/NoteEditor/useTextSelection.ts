import { useEffect, useRef, useState } from 'react';

interface UseTextSelectionResult {
  selectedText: string;
  showSummarizeBtn: boolean;
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  hide: () => void;
}

export function useTextSelection(
  containerRef: React.RefObject<HTMLDivElement | null>,
): UseTextSelectionResult {
  const [selectedText, setSelectedText] = useState('');
  const [showSummarizeBtn, setShowSummarizeBtn] = useState(false);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const readSelection = () => {
      rafRef.current = null;
      const selection = window.getSelection();
      const text = selection?.toString().trim() || '';
      const container = containerRef.current;
      const range =
        text && selection && selection.rangeCount > 0
          ? selection.getRangeAt(0)
          : null;
      const insideContainer =
        !!container &&
        !!range &&
        container.contains(range.startContainer) &&
        container.contains(range.endContainer);

      if (insideContainer) {
        setSelectedText(text);
        setShowSummarizeBtn(true);
      } else {
        setSelectedText('');
        setShowSummarizeBtn(false);
      }
    };

    // selectionchange fires on every collapse/expand (including a plain
    // click that clears the selection), so the button hides itself the
    // moment there's nothing selected instead of lingering until the next
    // outside click. rAF-throttled since it fires rapidly while dragging.
    const handleSelectionChange = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(readSelection);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [containerRef]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(e.target as Node) &&
        !containerRef.current?.contains(e.target as Node)
      ) {
        setShowSummarizeBtn(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [containerRef]);

  return {
    selectedText,
    showSummarizeBtn,
    tooltipRef,
    hide: () => setShowSummarizeBtn(false),
  };
}
