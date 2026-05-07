import { RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

import { DEFAULT_DIFFICULTY } from './types';

import type { ExamAIDifficultyDistribution } from '@/services/types/exam.types';

export type QuestionCounts = { MCQ: number; TF: number; ESS: number };

type Props = {
  counts: QuestionCounts;
  onCountsChange: (counts: QuestionCounts) => void;
  difficulty: ExamAIDifficultyDistribution;
  onDifficultyChange: (difficulty: ExamAIDifficultyDistribution) => void;
  disabled?: boolean;
};

const AIExamSettings = ({
  counts,
  onCountsChange,
  difficulty,
  onDifficultyChange,
  disabled,
}: Props) => {
  const { t } = useTranslation();
  const totalQuestions = counts.MCQ + counts.TF + counts.ESS;
  const difficultySum = difficulty.Easy + difficulty.Medium + difficulty.Hard;
  const difficultyValid = difficultySum === 100;

  const updateCount = (key: keyof QuestionCounts, val: number) =>
    onCountsChange({ ...counts, [key]: Math.max(0, val) });

  const updateDifficulty = (
    key: keyof ExamAIDifficultyDistribution,
    val: number,
  ) => onDifficultyChange({ ...difficulty, [key]: Math.max(0, val) });

  return (
    <>
      <div>
        <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2.5 block'>
          {t('modal.ai.questionCounts', {
            defaultValue: 'Number of Questions by Type',
          })}
        </Label>
        <div className='grid grid-cols-3 gap-3'>
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>
              {t('modal.ai.mcq', { defaultValue: 'Multiple Choice' })}
            </label>
            <Input
              type='number'
              min={0}
              max={20}
              value={counts.MCQ}
              onChange={(e) => updateCount('MCQ', Number(e.target.value))}
              disabled={disabled}
              className='bg-[var(--pl-bg-sunken)]'
            />
          </div>
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>
              {t('modal.ai.tf', { defaultValue: 'True / False' })}
            </label>
            <Input
              type='number'
              min={0}
              max={20}
              value={counts.TF}
              onChange={(e) => updateCount('TF', Number(e.target.value))}
              disabled={disabled}
              className='bg-[var(--pl-bg-sunken)]'
            />
          </div>
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>
              {t('modal.ai.essay', { defaultValue: 'Essay' })}
            </label>
            <Input
              type='number'
              min={0}
              max={10}
              value={counts.ESS}
              onChange={(e) => updateCount('ESS', Number(e.target.value))}
              disabled={disabled}
              className='bg-[var(--pl-bg-sunken)]'
            />
          </div>
        </div>
        <p className='text-xs text-muted-foreground mt-2'>
          {t('modal.ai.questionTotal', {
            count: totalQuestions,
            defaultValue: 'Total: {{count}} question(s)',
          })}
        </p>
      </div>

      <div>
        <div className='flex flex-wrap items-end justify-between gap-2 mb-2.5'>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground'>
            {t('modal.ai.difficultyMix', {
              defaultValue: 'Difficulty mix (% — Easy + Medium + Hard = 100)',
            })}
          </Label>
          <button
            type='button'
            onClick={() => onDifficultyChange(DEFAULT_DIFFICULTY)}
            disabled={disabled}
            className='text-xs text-muted-foreground hover:text-foreground disabled:opacity-50 inline-flex items-center gap-1 cursor-pointer'
          >
            <RotateCcw className='w-3 h-3' />
            {t('modal.ai.difficultyReset', {
              defaultValue: 'Reset to 50 / 30 / 20',
            })}
          </button>
        </div>
        <div className='grid grid-cols-3 gap-3'>
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>
              {t('modal.ai.difficultyEasy', { defaultValue: 'Easy' })}
            </label>
            <Input
              type='number'
              min={0}
              max={100}
              value={difficulty.Easy}
              onChange={(e) => updateDifficulty('Easy', Number(e.target.value))}
              disabled={disabled}
              className='bg-[var(--pl-bg-sunken)]'
            />
          </div>
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>
              {t('modal.ai.difficultyMedium', { defaultValue: 'Medium' })}
            </label>
            <Input
              type='number'
              min={0}
              max={100}
              value={difficulty.Medium}
              onChange={(e) =>
                updateDifficulty('Medium', Number(e.target.value))
              }
              disabled={disabled}
              className='bg-[var(--pl-bg-sunken)]'
            />
          </div>
          <div>
            <label className='text-xs text-muted-foreground mb-1 block'>
              {t('modal.ai.difficultyHard', { defaultValue: 'Hard' })}
            </label>
            <Input
              type='number'
              min={0}
              max={100}
              value={difficulty.Hard}
              onChange={(e) => updateDifficulty('Hard', Number(e.target.value))}
              disabled={disabled}
              className='bg-[var(--pl-bg-sunken)]'
            />
          </div>
        </div>
        <p
          className={cn(
            'text-xs mt-2',
            difficultyValid ? 'text-muted-foreground' : 'text-destructive',
          )}
        >
          {t('modal.ai.difficultySumHint', {
            sum: difficultySum,
            defaultValue: 'Current total: {{sum}}% — must equal 100%',
          })}
        </p>
      </div>
    </>
  );
};

export default AIExamSettings;
