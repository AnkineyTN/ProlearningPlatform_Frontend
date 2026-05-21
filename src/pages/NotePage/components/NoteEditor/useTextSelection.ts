import { useEffect, useRef, useState } from 'react';

interface UseTextSelectionResult {
  selectedText: string;
  showSummarizeBtn: boolean;
  tooltipPos: { x: number; y: number };
  tooltipRef: React.RefObject<HTMLDivElement | null>;
  hide: () => void;
}

const BUTTON_WIDTH = 130;

export function useTextSelection(
  containerRef: React.RefObject<HTMLDivElement | null>,
): UseTextSelectionResult {
  const [selectedText, setSelectedText] = useState('');
  const [showSummarizeBtn, setShowSummarizeBtn] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const tooltipRef = useRef<HTMLDivElement | null>(null);

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
      const container = containerRef.current;
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
      const xRaw = rect.left - editorRect.left - BUTTON_WIDTH - 8;
      setTooltipPos({
        x: Math.max(6, xRaw),
        y: rect.top - editorRect.top,
      });
      setShowSummarizeBtn(true);
    };
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
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
    tooltipPos,
    tooltipRef,
    hide: () => setShowSummarizeBtn(false),
  };
}
