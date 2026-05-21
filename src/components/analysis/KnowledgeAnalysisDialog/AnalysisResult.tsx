import { CheckCircle2, Lightbulb, Sparkles, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { KnowledgeAnalysis } from '@/services/types/knowledge-analysis.types';
import ContributingSources from './ContributingSources';
import NarrativeBlock from './NarrativeBlock';
import TopicAccuracySection from './TopicAccuracySection';

interface AnalysisResultProps {
  analysis: KnowledgeAnalysis;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const { t } = useTranslation();
  const { topicAccuracies, strengths, weaknesses, improvements } = analysis;
  const sorted = [...topicAccuracies].sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className='space-y-5 pb-2'>
      <TopicAccuracySection topics={sorted} />

      <NarrativeBlock
        icon={<CheckCircle2 className='w-4 h-4 text-emerald-500' />}
        label={t('analysis.sections.strengths', { defaultValue: 'Strengths' })}
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

      {analysis.contributingSources && analysis.contributingSources.length > 0 && (
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
}
