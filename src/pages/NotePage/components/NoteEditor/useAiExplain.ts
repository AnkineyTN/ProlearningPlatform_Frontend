import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useExplainText } from '@/hooks/useNotes';
import { mapI18nToAiApiLanguage } from '@/lib/utils';

interface UseAiExplainArgs {
  setId: number;
  noteId: number;
  onResult: (selectedText: string, response: string) => void;
  onSuccess?: () => void;
}

export function useAiExplain({
  setId,
  noteId,
  onResult,
  onSuccess,
}: UseAiExplainArgs) {
  const { i18n } = useTranslation();
  const explainTextMutation = useExplainText();

  const explain = useCallback(
    async (selectedText: string) => {
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
        onResult(selectedText, response.data.data.answer);
        onSuccess?.();
        toast.success('Explained successfully');
      } catch {
        toast.error('Failed to explain text');
      }
    },
    [setId, noteId, i18n.language, explainTextMutation, onResult, onSuccess],
  );

  return {
    explain,
    isPending: explainTextMutation.isPending,
  };
}
