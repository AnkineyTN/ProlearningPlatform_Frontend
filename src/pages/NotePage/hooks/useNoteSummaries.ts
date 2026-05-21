import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import {
  useCreateNoteExplain,
  useDeleteNoteExplain,
  useNoteExplains,
} from '@/hooks/useNotes';

import type { AISummary } from '@/pages/NotePage/components/noteTypes';

interface UseNoteSummariesParams {
  setId: number;
  noteId: number;
  onSummaryAdded?: () => void;
}

export function useNoteSummaries({
  setId,
  noteId,
  onSummaryAdded,
}: UseNoteSummariesParams) {
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const createExplainMutation = useCreateNoteExplain();
  const deleteExplainMutation = useDeleteNoteExplain();
  const { data: savedExplains } = useNoteExplains(setId, noteId);
  const explainLoadedRef = useRef(false);

  // Populate summaries from saved explains once on first load
  useEffect(() => {
    if (!savedExplains || explainLoadedRef.current) return;
    explainLoadedRef.current = true;
    if (savedExplains.length === 0) return;
    const loaded: AISummary[] = savedExplains.map((e) => ({
      id: `explain-${e.id}`,
      backendId: e.id,
      query: e.term,
      response: e.explain,
      type: 'text',
    }));
    setSummaries(loaded);
  }, [savedExplains]);

  const addTextSummary = async (selectedText: string, response: string) => {
    const tempId = Date.now().toString();
    setSummaries((prev) => [
      { id: tempId, query: selectedText, response, type: 'text' },
      ...prev,
    ]);
    onSummaryAdded?.();

    if (setId && noteId) {
      try {
        const saved = await createExplainMutation.mutateAsync({
          setId,
          noteId,
          data: {
            noteId,
            source: 'editor',
            term: selectedText,
            explain: response,
          },
        });
        setSummaries((prev) =>
          prev.map((s) =>
            s.id === tempId ? { ...s, backendId: saved.data.data.id } : s,
          ),
        );
      } catch {
        // Saving failed — keep card in session without backendId
      }
    }
  };

  const addFileSummary = (summary: string, fileName: string) => {
    const newSummary: AISummary = {
      id: Date.now().toString(),
      query: `Summarize content of ${fileName}`,
      response: summary,
      type: 'file',
    };
    setSummaries((prev) => [newSummary, ...prev]);
    onSummaryAdded?.();
  };

  const saveSummary = async (id: string) => {
    const target = summaries.find((s) => s.id === id);
    if (!target || target.backendId != null || !setId || !noteId) return;
    try {
      const saved = await createExplainMutation.mutateAsync({
        setId,
        noteId,
        data: {
          noteId,
          source: 'file',
          term: target.query,
          explain: target.response,
        },
      });
      setSummaries((prev) =>
        prev.map((s) =>
          s.id === id ? { ...s, backendId: saved.data.data.id } : s,
        ),
      );
      toast.success('Summary saved');
    } catch {
      toast.error('Failed to save summary');
    }
  };

  const removeSummary = (id: string) => {
    const target = summaries.find((s) => s.id === id);
    setSummaries((prev) => prev.filter((s) => s.id !== id));
    if (target?.backendId && setId && noteId) {
      deleteExplainMutation.mutate({
        setId,
        noteId,
        explainId: target.backendId,
      });
    }
  };

  return {
    summaries,
    addTextSummary,
    addFileSummary,
    saveSummary,
    removeSummary,
  };
}
