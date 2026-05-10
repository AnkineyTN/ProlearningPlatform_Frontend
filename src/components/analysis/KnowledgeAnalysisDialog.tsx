import { isAxiosError } from 'axios';
import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle2,
  Lightbulb,
  Loader2,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  useAssignExamTopics,
  useAssignFlashcardTopics,
} from '@/hooks/useKnowledgeAnalysis';
import { knowledgeAnalysisAPI } from '@/services/endpoints/knowledge-analysis';

import type {
  ContributingSource,
  KnowledgeAnalysis,
  TopicAccuracy,
} from '@/services/types/knowledge-analysis.types';

export type AnalysisTarget =
  | { kind: 'flashcard'; setId: number; flashcardId: number; sessionId: number }
  | { kind: 'exam'; setId: number; examId: number; attemptId: number }
  | { kind: 'set'; setId: number };

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: AnalysisTarget;
};

type Phase =
  | { state: 'loading' }
  | { state: 'ready'; analysis: KnowledgeAnalysis }
  | { state: 'no-topics' }
  | { state: 'set-empty' }
  | { state: 'error'; message: string };

const STALE_DAYS = 30;
const STALE_MS = STALE_DAYS * 24 * 60 * 60 * 1000;

function bandFor(accuracy: number) {
  if (accuracy >= 0.75) return 'strong';
  if (accuracy >= 0.5) return 'medium';
  return 'weak';
}

function bandColors(band: ReturnType<typeof bandFor>) {
  switch (band) {
    case 'strong':
      return {
        bar: 'bg-emerald-500',
        text: 'text-emerald-600 dark:text-emerald-400',
      };
    case 'medium':
      return {
        bar: 'bg-amber-500',
        text: 'text-amber-600 dark:text-amber-400',
      };
    case 'weak':
      return {
        bar: 'bg-rose-500',
        text: 'text-rose-600 dark:text-rose-400',
      };
  }
}

function extractApiMessage(error: unknown): string | null {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return data?.message ?? data?.error ?? null;
  }
  return null;
}

function isNoTopicsError(error: unknown) {
  if (!isAxiosError(error) || error.response?.status !== 400) return false;
  const msg = extractApiMessage(error)?.toLowerCase() ?? '';
  return msg.includes('topic');
}

function isSetEmptyError(error: unknown) {
  return isAxiosError(error) && error.response?.status === 400;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

const KnowledgeAnalysisDialog = ({ open, onOpenChange, target }: Props) => {
  const { t } = useTranslation();
  const [phase, setPhase] = useState<Phase>({ state: 'loading' });
  const [retryToken, setRetryToken] = useState(0);
  const assignFlashcardTopics = useAssignFlashcardTopics();
  const assignExamTopics = useAssignExamTopics();

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

  const handleAssignThenRetry = async () => {
    try {
      if (target.kind === 'flashcard') {
        await assignFlashcardTopics.mutateAsync({
          setId: target.setId,
          flashcardId: target.flashcardId,
        });
      } else if (target.kind === 'exam') {
        await assignExamTopics.mutateAsync({
          setId: target.setId,
          examId: target.examId,
        });
      }
      setRetryToken((n) => n + 1);
    } catch (error) {
      setPhase({
        state: 'error',
        message:
          extractApiMessage(error) ??
          t('analysis.errors.assignFailed', {
            defaultValue: 'Failed to assign topics.',
          }),
      });
    }
  };

  const titleKey =
    target.kind === 'set'
      ? 'analysis.title.set'
      : target.kind === 'flashcard'
        ? 'analysis.title.flashcard'
        : 'analysis.title.exam';

  const titleDefault =
    target.kind === 'set'
      ? 'Set knowledge analysis'
      : target.kind === 'flashcard'
        ? 'Flashcard knowledge analysis'
        : 'Exam knowledge analysis';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-3xl max-h-[88vh] flex flex-col gap-0'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Brain className='w-5 h-5 text-[var(--pl-accent)]' />
            {t(titleKey, { defaultValue: titleDefault })}
          </DialogTitle>
        </DialogHeader>

        <div className='mt-3 min-h-0 flex-1 overflow-y-auto pr-1'>
          {phase.state === 'loading' && (
            <div className='flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground'>
              <Loader2 className='w-6 h-6 animate-spin' />
              <p className='text-sm'>
                {t('analysis.loading', {
                  defaultValue: 'Analyzing your knowledge…',
                })}
              </p>
            </div>
          )}

          {phase.state === 'no-topics' && (
            <div className='flex flex-col items-center justify-center py-10 gap-3 text-center'>
              <AlertCircle className='w-8 h-8 text-amber-500' />
              <p className='text-sm text-muted-foreground max-w-md'>
                {t('analysis.noTopics', {
                  defaultValue:
                    'Topics are being assigned, please try again shortly.',
                })}
              </p>
              <Button
                size='sm'
                onClick={handleAssignThenRetry}
                disabled={
                  assignFlashcardTopics.isPending || assignExamTopics.isPending
                }
              >
                {(assignFlashcardTopics.isPending ||
                  assignExamTopics.isPending) && (
                  <Loader2 className='w-4 h-4 animate-spin' />
                )}
                {t('analysis.actions.assignAndRetry', {
                  defaultValue: 'Assign topics and retry',
                })}
              </Button>
            </div>
          )}

          {phase.state === 'set-empty' && (
            <div className='flex flex-col items-center justify-center py-10 gap-3 text-center'>
              <AlertCircle className='w-8 h-8 text-amber-500' />
              <p className='text-sm text-muted-foreground max-w-md'>
                {t('analysis.setEmpty', {
                  defaultValue:
                    'Study a flashcard or take an exam first, then try again.',
                })}
              </p>
            </div>
          )}

          {phase.state === 'error' && (
            <div className='flex flex-col items-center justify-center py-10 gap-3 text-center'>
              <AlertCircle className='w-8 h-8 text-rose-500' />
              <p className='text-sm text-rose-600 max-w-md'>{phase.message}</p>
              <Button
                size='sm'
                variant='outline'
                onClick={() => setRetryToken((n) => n + 1)}
              >
                {t('analysis.actions.retry', { defaultValue: 'Retry' })}
              </Button>
            </div>
          )}

          {phase.state === 'ready' && (
            <AnalysisResult analysis={phase.analysis} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AnalysisResult = ({ analysis }: { analysis: KnowledgeAnalysis }) => {
  const { t } = useTranslation();
  const { topicAccuracies, strengths, weaknesses, improvements } = analysis;
  const sorted = [...topicAccuracies].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className='space-y-5 pb-2'>
      <TopicAccuracySection topics={sorted} />

      <NarrativeBlock
        icon={<CheckCircle2 className='w-4 h-4 text-emerald-500' />}
        label={t('analysis.sections.strengths', {
          defaultValue: 'Strengths',
        })}
        text={strengths}
      />
      <NarrativeBlock
        icon={<TriangleAlert className='w-4 h-4 text-rose-500' />}
        label={t('analysis.sections.weaknesses', {
          defaultValue: 'Weaknesses',
        })}
        text={weaknesses}
      />
      <NarrativeBlock
        icon={<Lightbulb className='w-4 h-4 text-amber-500' />}
        label={t('analysis.sections.improvements', {
          defaultValue: 'Suggestions',
        })}
        text={improvements}
      />

      {analysis.contributingSources &&
        analysis.contributingSources.length > 0 && (
          <ContributingSources
            createdAt={analysis.createdAt}
            sources={analysis.contributingSources}
          />
        )}

      <p className='text-[11px] text-muted-foreground flex items-center gap-1.5 pt-1'>
        <Sparkles className='w-3 h-3' />
        {t('analysis.generatedAt', {
          defaultValue: 'Generated {{date}}',
          date: new Date(analysis.createdAt).toLocaleString(),
        })}
      </p>
    </div>
  );
};

const TopicAccuracySection = ({ topics }: { topics: TopicAccuracy[] }) => {
  const { t } = useTranslation();
  if (topics.length === 0) return null;
  return (
    <section>
      <div className='flex items-center gap-2 mb-3'>
        <BarChart3 className='w-4 h-4 text-[var(--pl-accent)]' />
        <h3 className='text-sm font-semibold'>
          {t('analysis.sections.topics', {
            defaultValue: 'Topic accuracy',
          })}
        </h3>
      </div>
      <ul className='space-y-2.5'>
        {topics.map((t) => {
          const band = bandFor(t.accuracy);
          const colors = bandColors(band);
          const pct = Math.round(t.accuracy * 100);
          return (
            <li key={t.topic} className='space-y-1'>
              <div className='flex items-center justify-between gap-3'>
                <span className='text-sm font-medium truncate'>{t.topic}</span>
                <span className={`text-xs font-semibold ${colors.text}`}>
                  {pct}%
                </span>
              </div>
              <div className='h-1.5 rounded-full bg-muted overflow-hidden'>
                <div
                  className={`h-full rounded-full transition-all ${colors.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

const NarrativeBlock = ({
  icon,
  label,
  text,
}: {
  icon: React.ReactNode;
  label: string;
  text: string;
}) => {
  if (!text?.trim()) return null;
  return (
    <section>
      <div className='flex items-center gap-2 mb-1.5'>
        {icon}
        <h3 className='text-sm font-semibold'>{label}</h3>
      </div>
      <p className='text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed'>
        {text}
      </p>
    </section>
  );
};

const ContributingSources = ({
  createdAt,
  sources,
}: {
  createdAt: string;
  sources: ContributingSource[];
}) => {
  const { t } = useTranslation();
  const setAnalysisTime = new Date(createdAt).getTime();

  return (
    <section className='border-t border-border pt-4'>
      <h3 className='text-sm font-semibold mb-2'>
        {t('analysis.sections.contributingSources', {
          defaultValue: 'Contributing sources',
        })}
      </h3>
      <ul className='space-y-1.5'>
        {sources.map((src) => {
          const analyzedAt = new Date(src.analyzedAt).getTime();
          const stale =
            Number.isFinite(analyzedAt) &&
            Number.isFinite(setAnalysisTime) &&
            setAnalysisTime - analyzedAt > STALE_MS;
          return (
            <li
              key={`${src.sourceType}-${src.sourceId}-${src.analysisId}`}
              className='flex items-center justify-between gap-3 text-xs'
            >
              <span className='flex items-center gap-2'>
                <span className='inline-flex items-center px-2 py-0.5 rounded-full border border-border text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                  {src.sourceType}
                </span>
                <span className='text-muted-foreground'>
                  #{src.sourceId} · {formatDate(src.analyzedAt)}
                </span>
              </span>
              {stale && (
                <span className='text-amber-600 dark:text-amber-400 flex items-center gap-1'>
                  <TriangleAlert className='w-3 h-3' />
                  {t('analysis.stale', { defaultValue: 'Outdated' })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default KnowledgeAnalysisDialog;
