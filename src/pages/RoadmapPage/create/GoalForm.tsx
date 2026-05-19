import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type {
  RoadmapLanguage,
  RoadmapLevel,
} from '@/services/types/roadmap.types';

import { Field, SegmentedControl } from './shared';

const LEVEL_VALUES: RoadmapLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const LANGUAGE_VALUES: RoadmapLanguage[] = ['Vietnamese', 'English'];

export const GoalForm = (props: {
  goal: string;
  setGoal: (v: string) => void;
  level: RoadmapLevel;
  setLevel: (v: RoadmapLevel) => void;
  language: RoadmapLanguage;
  setLanguage: (v: RoadmapLanguage) => void;
  onSubmit: () => void;
  loading: boolean;
}) => {
  const { t } = useTranslation();
  const levelOptions = LEVEL_VALUES.map((v) => ({
    value: v,
    label: t(`roadmap.level.${v}`),
  }));
  const languageOptions = LANGUAGE_VALUES.map((v) => ({
    value: v,
    label: t(`roadmap.language.${v}`),
  }));

  return (
    <div className='max-w-[760px] pb-16'>
      <p className='text-[11px] uppercase tracking-[0.16em] mb-2 text-[var(--pl-text-faint)]'>
        {t('roadmap.create.stepLabel')} 1
      </p>
      <h1 className='text-[34px] leading-tight mb-2 tracking-[-0.03em] font-[var(--font-display)] text-[var(--pl-text)]'>
        {t('roadmap.create.title')}
      </h1>
      <p className='text-[13px] mb-7 text-[var(--pl-text-muted)]'>
        {t('roadmap.create.subtitle')}
      </p>

      <Field label={t('roadmap.create.goal')}>
        <textarea
          value={props.goal}
          onChange={(e) => props.setGoal(e.target.value)}
          placeholder={t('roadmap.create.goalPlaceholder')}
          rows={4}
          className='w-full px-4 py-3 rounded-[10px] text-[13px] resize-none outline-none min-h-20 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] text-[var(--pl-text)]'
        />
      </Field>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
        <Field label={t('roadmap.create.currentLevel')}>
          <SegmentedControl
            options={levelOptions}
            value={props.level}
            onChange={props.setLevel}
          />
        </Field>
        <Field label={t('roadmap.create.contentLanguage')}>
          <SegmentedControl
            options={languageOptions}
            value={props.language}
            onChange={props.setLanguage}
          />
        </Field>
      </div>

      <div className='mt-8 flex justify-end'>
        <Button
          onClick={props.onSubmit}
          disabled={props.loading}
          className='bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:bg-[var(--pl-accent-strong)]'
        >
          {props.loading ? (
            <>
              <Loader2 size={14} className='animate-spin' />
              {t('roadmap.create.generating')}
            </>
          ) : (
            <>
              <Sparkles size={14} />
              {t('roadmap.create.generate')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
