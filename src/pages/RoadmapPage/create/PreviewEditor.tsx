import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Sparkles,
  Loader2,
  Plus,
  Wand2,
  CheckCircle2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import type {
  PreviewChapter,
  PreviewRoadmap,
} from '@/services/types/roadmap.types';

import { Field, tempKey } from './shared';
import { ChapterEditor } from './ChapterEditor';

export const PreviewEditor = ({
  draft,
  onChange,
  onBack,
  onConfirm,
  creating,
  onRegenerate,
  regenerating,
}: {
  draft: PreviewRoadmap;
  onChange: (d: PreviewRoadmap) => void;
  onBack: () => void;
  onConfirm: () => void;
  creating: boolean;
  onRegenerate: () => void;
  regenerating: boolean;
}) => {
  const { t } = useTranslation();
  const totalTopics = draft.chapters.reduce(
    (sum, c) => sum + c.topics.length,
    0,
  );

  const updateChapter = (idx: number, patch: Partial<PreviewChapter>) => {
    onChange({
      ...draft,
      chapters: draft.chapters.map((c, i) =>
        i === idx ? { ...c, ...patch } : c,
      ),
    });
  };

  const removeChapter = (idx: number) => {
    onChange({
      ...draft,
      chapters: draft.chapters.filter((_, i) => i !== idx),
    });
  };

  const addChapter = () => {
    const newChapter: PreviewChapter = {
      chapter_id: tempKey('ch'),
      chapter_title: t('roadmap.create.newChapter'),
      objective: t('roadmap.create.newChapterObjective'),
      topics: [
        {
          topic_id: tempKey('tp'),
          topic_title: t('roadmap.create.newTopic'),
          description: t('roadmap.create.newTopicDescription'),
        },
      ],
    };
    onChange({ ...draft, chapters: [...draft.chapters, newChapter] });
  };

  return (
    <div className='pb-16'>
      <div className='flex items-end justify-between mb-2'>
        <div className='flex-1'>
          <p className='text-[11px] uppercase tracking-[0.16em] mb-2 text-[var(--pl-text-faint)]'>
            {t('roadmap.create.stepLabel')} 2
          </p>
          <input
            value={draft.roadmap_title}
            onChange={(e) =>
              onChange({ ...draft, roadmap_title: e.target.value })
            }
            className='text-[32px] leading-tight bg-transparent outline-none w-full tracking-[-0.03em] font-[var(--font-display)] text-[var(--pl-text)]'
          />
          <p className='text-[13px] mt-2 text-[var(--pl-text-muted)]'>
            {t('roadmap.create.summary', {
              chapters: draft.chapters.length,
              topics: totalTopics,
              hours: draft.estimated_total_hours,
            })}
          </p>
        </div>
      </div>

      <div className='mt-5'>
        <Field label={t('roadmap.create.overviewLabel')}>
          <textarea
            value={draft.overview}
            onChange={(e) => onChange({ ...draft, overview: e.target.value })}
            rows={2}
            className='w-full px-4 py-3 rounded-[10px] text-[13px] resize-none outline-none min-h-30 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] text-[var(--pl-text)]'
          />
        </Field>
      </div>

      <div className='mt-5 rounded-[12px] px-4 py-2 flex items-center gap-3 mb-5 bg-[var(--pl-accent-soft)] border border-[var(--pl-border)]'>
        <Wand2 size={16} className='text-[var(--pl-accent-strong)]' />
        <p className='text-[12.5px] text-[var(--pl-text)]'>
          {t('roadmap.create.previewBanner')}
        </p>
        <Button
          onClick={onRegenerate}
          disabled={regenerating}
          variant='outline'
          className='ml-auto gap-1.5 px-3 py-[6px] rounded-full text-[11.5px] h-auto bg-[var(--pl-bg)] text-[var(--pl-text)] border-[var(--pl-border)]'
        >
          {regenerating ? (
            <Loader2 size={11} className='animate-spin' />
          ) : (
            <Sparkles size={11} />
          )}
          {regenerating
            ? t('roadmap.create.regenerating')
            : t('roadmap.create.regenerate')}
        </Button>
      </div>

      <div className='flex flex-col gap-3'>
        {draft.chapters.map((chapter, ci) => (
          <ChapterEditor
            key={chapter.chapter_id || ci}
            chapter={chapter}
            onChange={(patch) => updateChapter(ci, patch)}
            onRemove={() => removeChapter(ci)}
            index={ci}
          />
        ))}
        <Button
          onClick={addChapter}
          variant='ghost'
          className='justify-center gap-2 py-3 rounded-[10px] text-[12.5px] h-auto bg-transparent text-[var(--pl-text-muted)] border border-dashed border-[var(--pl-border)] hover:bg-[var(--pl-bg-hover)]'
        >
          <Plus size={13} /> {t('roadmap.create.addChapter')}
        </Button>
      </div>

      <div className='mt-8 flex items-center justify-between'>
        <Button
          onClick={onBack}
          variant='outline'
          className='gap-2 px-5 py-2 rounded-full text-[12.5px] h-auto bg-[var(--pl-bg-elev)] text-[var(--pl-text)] border-[var(--pl-border)]'
        >
          <ArrowLeft size={12} /> {t('roadmap.create.back')}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={creating || draft.chapters.length === 0}
          className='gap-2 px-6 py-3 rounded-full text-[13px] font-medium h-auto bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:bg-[var(--pl-accent-strong)]'
        >
          {creating ? (
            <>
              <Loader2 size={14} className='animate-spin' />
              {t('roadmap.create.creating')}
            </>
          ) : (
            <>
              <CheckCircle2 size={14} />
              {t('roadmap.create.confirmCreate')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
