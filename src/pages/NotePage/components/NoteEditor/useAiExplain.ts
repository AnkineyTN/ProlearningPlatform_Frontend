import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { useExplainText } from '@/hooks/useNotes';
import { mapI18nToAiApiLanguage } from '@/lib/utils';

interface UseAiExplainArgs {
  setId: number;
  noteId: number;
  onResult: (selectedText: string, response: string) => void;
  onSuccess?: () => void;
}

const AI_EXPLAIN_RATE_LIMIT = 20;
const AI_EXPLAIN_RATE_WINDOW_MS = 60_000;

export function useAiExplain({
  setId,
  noteId,
  onResult,
  onSuccess,
}: UseAiExplainArgs) {
  const { t, i18n } = useTranslation();
  const explainTextMutation = useExplainText();
  const requestTimestampsRef = useRef<number[]>([]);

  const explain = useCallback(
    async (selectedText: string) => {
      if (!selectedText) return;
      if (!setId || !noteId) {
        toast.error('Invalid note');
        return;
      }

      const now = Date.now();
      const recentTimestamps = requestTimestampsRef.current.filter(
        (ts) => now - ts < AI_EXPLAIN_RATE_WINDOW_MS,
      );
      if (recentTimestamps.length >= AI_EXPLAIN_RATE_LIMIT) {
        requestTimestampsRef.current = recentTimestamps;
        toast.error(
          t('note.aiExplain.rateLimited', { limit: AI_EXPLAIN_RATE_LIMIT }),
        );
        return;
      }
      recentTimestamps.push(now);
      requestTimestampsRef.current = recentTimestamps;

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
      } catch (error) {
        toast.error(apiErrorMessage(error, 'Failed to explain text'));
      }
    },
    [setId, noteId, i18n.language, explainTextMutation, onResult, onSuccess, t],
  );

  return {
    explain,
    isPending: explainTextMutation.isPending,
  };
}
