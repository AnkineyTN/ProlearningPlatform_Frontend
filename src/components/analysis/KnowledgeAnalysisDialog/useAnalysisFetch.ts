import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { knowledgeAnalysisAPI } from '@/services/endpoints/knowledge-analysis';
import type { KnowledgeAnalysis } from '@/services/types/knowledge-analysis.types';
import type { AnalysisTarget, Phase } from './types';
import {
  extractApiMessage,
  isNoTopicsError,
  isSetEmptyError,
} from './utils';

export function useAnalysisFetch(open: boolean, target: AnalysisTarget) {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>({ state: 'loading' });
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setPhase({ state: 'loading' });

    const triggerAndFetch = async () => {
      try {
        if (target.kind === 'flashcard') {
          const res = await knowledgeAnalysisAPI.triggerFlashcardAnalysis(
            target.setId,
            target.flashcardId,
            target.sessionId,
          );
          if (!cancelled) setPhase({ state: 'ready', analysis: res.data.data });
        } else if (target.kind === 'exam') {
          const res = await knowledgeAnalysisAPI.triggerExamAnalysis(
            target.setId,
            target.examId,
            target.attemptId,
          );
          if (!cancelled) setPhase({ state: 'ready', analysis: res.data.data });
        } else {
          const res = await knowledgeAnalysisAPI.triggerSetAnalysis(
            target.setId,
          );
          if (!cancelled) setPhase({ state: 'ready', analysis: res.data.data });
        }
      } catch (error) {
        if (cancelled) return;
        // 409: analysis already exists — fetch latest from history.
        if (isAxiosError(error) && error.response?.status === 409) {
          try {
            let latest: KnowledgeAnalysis | undefined;
            if (target.kind === 'flashcard') {
              const list = await knowledgeAnalysisAPI.getFlashcardAnalyses(
                target.setId,
                target.flashcardId,
              );
              latest =
                list.data.data.find(
                  (a) => a.sessionRefId === target.sessionId,
                ) ?? list.data.data[0];
            } else if (target.kind === 'exam') {
              const list = await knowledgeAnalysisAPI.getExamAnalyses(
                target.setId,
                target.examId,
              );
              latest =
                list.data.data.find(
                  (a) => a.sessionRefId === target.attemptId,
                ) ?? list.data.data[0];
            } else {
              const list = await knowledgeAnalysisAPI.getSetAnalyses(
                target.setId,
              );
              latest = list.data.data[0];
            }
            if (cancelled) return;
            if (latest) {
              setPhase({ state: 'ready', analysis: latest });
            } else {
              setPhase({
                state: 'error',
                message: t('analysis.errors.notFound', {
                  defaultValue: 'Analysis not found.',
                }),
              });
            }
          } catch {
            if (!cancelled)
              setPhase({
                state: 'error',
                message: t('analysis.errors.loadFailed', {
                  defaultValue: 'Could not load analysis.',
                }),
              });
          }
          return;
        }

        if (target.kind === 'set' && isSetEmptyError(error)) {
          setPhase({ state: 'set-empty' });
          return;
        }

        if (
          (target.kind === 'flashcard' || target.kind === 'exam') &&
          isNoTopicsError(error)
        ) {
          setPhase({ state: 'no-topics' });
          return;
        }

        setPhase({
          state: 'error',
          message:
            extractApiMessage(error) ??
            t('analysis.errors.unknown', {
              defaultValue: 'Something went wrong. Please try again.',
            }),
        });
      }
    };

    triggerAndFetch();
    return () => {
      cancelled = true;
    };
  }, [open, target, retryToken, t]);

  return {
    phase,
    setPhase,
    retry: () => setRetryToken((n) => n + 1),
  };
}
