import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Sparkles,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
  Wand2,
  CheckCircle2,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';

import { useCreateRoadmap, usePreviewRoadmap } from '@/hooks/useRoadmap';
import type {
  CreateRoadmapPayload,
  PreviewChapter,
  PreviewRoadmap,
  PreviewTopic,
  RoadmapLanguage,
  RoadmapLevel,
} from '@/services/types/roadmap.types';

type Step = 'goal' | 'preview' | 'done';

const LEVEL_VALUES: RoadmapLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const LANGUAGE_VALUES: RoadmapLanguage[] = ['Vietnamese', 'English'];

const tempKey = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

const CreateRoadmapPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const previewMutation = usePreviewRoadmap();
  const createMutation = useCreateRoadmap();

  const [step, setStep] = useState<Step>('goal');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState<RoadmapLevel>('BEGINNER');
  const [language, setLanguage] = useState<RoadmapLanguage>(
    i18n.language?.startsWith('en') ? 'English' : 'Vietnamese',
  );

  const [draft, setDraft] = useState<PreviewRoadmap | null>(null);

  const handlePreview = async () => {
    if (!goal.trim()) {
      toast.error(t('roadmap.create.missingGoal'));
      return;
    }
    try {
      const result = await previewMutation.mutateAsync({
        goal: goal.trim(),
        level,
        language,
      });
      setDraft(result);
      setStep('preview');
    } catch {
      toast.error(t('roadmap.create.previewError'));
    }
  };

  const handleCreate = async () => {
    if (!draft) return;
    try {
      const payload: CreateRoadmapPayload = draft;
      const created = await createMutation.mutateAsync(payload);
      setStep('done');
      toast.success(t('roadmap.create.createSuccess'));
      setTimeout(() => navigate(`/roadmaps/${created.id}`), 800);
    } catch {
      toast.error(t('roadmap.create.createError'));
    }
  };

  return (
    <div className='min-h-screen' style={{ background: 'var(--pl-bg)' }}>
      <div className='px-10 pt-8 pb-0'>
        <button
          onClick={() => navigate('/roadmaps')}
          className='flex items-center gap-2 text-[12.5px] mb-4'
          style={{ color: 'var(--pl-text-muted)' }}
        >
          <ArrowLeft size={13} /> {t('roadmap.backToList')}
        </button>

        <StepIndicator step={step} />

        {step === 'goal' && (
          <GoalForm
            goal={goal}
            setGoal={setGoal}
            level={level}
            setLevel={setLevel}
            language={language}
            setLanguage={setLanguage}
            onSubmit={handlePreview}
            loading={previewMutation.isPending}
          />
        )}

        {step === 'preview' && draft && (
          <PreviewEditor
            draft={draft}
            onChange={setDraft}
            onBack={() => setStep('goal')}
            onConfirm={handleCreate}
            creating={createMutation.isPending}
            onRegenerate={handlePreview}
            regenerating={previewMutation.isPending}
          />
        )}

        {step === 'done' && (
          <div className='py-24 text-center'>
            <CheckCircle2
              size={48}
              className='mx-auto mb-4'
              style={{ color: 'oklch(0.7 0.18 150)' }}
            />
            <h3
              className='text-[20px] font-[500] mb-1'
              style={{ color: 'var(--pl-text)' }}
            >
              {t('roadmap.create.doneTitle')}
            </h3>
            <p
              className='text-[13px]'
              style={{ color: 'var(--pl-text-muted)' }}
            >
              {t('roadmap.create.doneSubtitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const StepIndicator = ({ step }: { step: Step }) => {
  const { t } = useTranslation();
  const steps: { key: Step; label: string }[] = [
    { key: 'goal', label: t('roadmap.create.step1') },
    { key: 'preview', label: t('roadmap.create.step2') },
    { key: 'done', label: t('roadmap.create.step3') },
  ];
  const idx = steps.findIndex((s) => s.key === step);

  return (
    <div className='flex items-center gap-2 mb-6'>
      {steps.map((s, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <div key={s.key} className='flex items-center gap-2'>
            <div
              className='flex items-center gap-2 px-3 py-[6px] rounded-full text-[11.5px]'
              style={{
                background: active
                  ? 'var(--pl-accent)'
                  : done
                    ? 'var(--pl-accent-soft)'
                    : 'var(--pl-bg-elev)',
                color: active
                  ? 'var(--pl-accent-fg)'
                  : done
                    ? 'var(--pl-accent-strong)'
                    : 'var(--pl-text-faint)',
                border: '1px solid var(--pl-border)',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono-pl)' }}>
                {i + 1}
              </span>
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <ChevronRight
                size={12}
                style={{ color: 'var(--pl-text-faint)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

const GoalForm = (props: {
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
      <p
        className='text-[11px] uppercase tracking-[0.16em] mb-2'
        style={{ color: 'var(--pl-text-faint)' }}
      >
        {t('roadmap.create.stepLabel')} 1
      </p>
      <h1
        className='text-[34px] font-[400] leading-tight mb-2'
        style={{
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.03em',
          color: 'var(--pl-text)',
        }}
      >
        {t('roadmap.create.title')}
      </h1>
      <p className='text-[13px] mb-7' style={{ color: 'var(--pl-text-muted)' }}>
        {t('roadmap.create.subtitle')}
      </p>

      <Field label={t('roadmap.create.goal')}>
        <textarea
          value={props.goal}
          onChange={(e) => props.setGoal(e.target.value)}
          placeholder={t('roadmap.create.goalPlaceholder')}
          rows={4}
          className='w-full px-4 py-3 rounded-[10px] text-[13px] resize-none outline-none'
          style={{
            background: 'var(--pl-bg-elev)',
            border: '1px solid var(--pl-border)',
            color: 'var(--pl-text)',
          }}
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
        <button
          onClick={props.onSubmit}
          disabled={props.loading}
          className='flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-[500] disabled:opacity-60'
          style={{
            background: 'var(--pl-accent)',
            color: 'var(--pl-accent-fg)',
          }}
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
        </button>
      </div>
    </div>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <label
      className='block text-[11px] uppercase tracking-[0.14em] mb-2'
      style={{ color: 'var(--pl-text-faint)' }}
    >
      {label}
    </label>
    {children}
  </div>
);

function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div
      className='inline-flex rounded-[10px] p-1'
      style={{
        background: 'var(--pl-bg-elev)',
        border: '1px solid var(--pl-border)',
      }}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type='button'
            onClick={() => onChange(opt.value)}
            className='px-4 py-[6px] rounded-[7px] text-[12.5px] transition-all'
            style={{
              background: active ? 'var(--pl-accent)' : 'transparent',
              color: active
                ? 'var(--pl-accent-fg)'
                : 'var(--pl-text-muted)',
              fontWeight: active ? 500 : 400,
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const PreviewEditor = ({
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
          <p
            className='text-[11px] uppercase tracking-[0.16em] mb-2'
            style={{ color: 'var(--pl-text-faint)' }}
          >
            {t('roadmap.create.stepLabel')} 2
          </p>
          <input
            value={draft.roadmap_title}
            onChange={(e) =>
              onChange({ ...draft, roadmap_title: e.target.value })
            }
            className='text-[32px] font-[400] leading-tight bg-transparent outline-none w-full'
            style={{
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.03em',
              color: 'var(--pl-text)',
            }}
          />
          <p
            className='text-[13px] mt-2'
            style={{ color: 'var(--pl-text-muted)' }}
          >
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
            className='w-full px-4 py-3 rounded-[10px] text-[13px] resize-none outline-none'
            style={{
              background: 'var(--pl-bg-elev)',
              border: '1px solid var(--pl-border)',
              color: 'var(--pl-text)',
            }}
          />
        </Field>
      </div>

      <div
        className='mt-5 rounded-[12px] p-4 flex items-center gap-3 mb-5'
        style={{
          background: 'var(--pl-accent-soft)',
          border: '1px solid var(--pl-border)',
        }}
      >
        <Wand2 size={16} style={{ color: 'var(--pl-accent-strong)' }} />
        <p className='text-[12.5px]' style={{ color: 'var(--pl-text)' }}>
          {t('roadmap.create.previewBanner')}
        </p>
        <button
          onClick={onRegenerate}
          disabled={regenerating}
          className='ml-auto flex items-center gap-1.5 px-3 py-[6px] rounded-full text-[11.5px] disabled:opacity-60'
          style={{
            background: 'var(--pl-bg)',
            color: 'var(--pl-text)',
            border: '1px solid var(--pl-border)',
          }}
        >
          {regenerating ? (
            <Loader2 size={11} className='animate-spin' />
          ) : (
            <Sparkles size={11} />
          )}
          {regenerating
            ? t('roadmap.create.regenerating')
            : t('roadmap.create.regenerate')}
        </button>
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
        <button
          onClick={addChapter}
          className='flex items-center justify-center gap-2 py-3 rounded-[10px] text-[12.5px] transition-all'
          style={{
            background: 'transparent',
            color: 'var(--pl-text-muted)',
            border: '1px dashed var(--pl-border)',
          }}
        >
          <Plus size={13} /> {t('roadmap.create.addChapter')}
        </button>
      </div>

      <div className='mt-8 flex items-center justify-between'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 px-5 py-2 rounded-full text-[12.5px]'
          style={{
            background: 'var(--pl-bg-elev)',
            color: 'var(--pl-text)',
            border: '1px solid var(--pl-border)',
          }}
        >
          <ArrowLeft size={12} /> {t('roadmap.create.back')}
        </button>
        <button
          onClick={onConfirm}
          disabled={creating || draft.chapters.length === 0}
          className='flex items-center gap-2 px-6 py-3 rounded-full text-[13px] font-[500] disabled:opacity-60'
          style={{
            background: 'var(--pl-accent)',
            color: 'var(--pl-accent-fg)',
          }}
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
        </button>
      </div>
    </div>
  );
};

const ChapterEditor = ({
  chapter,
  onChange,
  onRemove,
  index,
}: {
  chapter: PreviewChapter;
  onChange: (patch: Partial<PreviewChapter>) => void;
  onRemove: () => void;
  index: number;
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);

  const updateTopic = (ti: number, patch: Partial<PreviewTopic>) => {
    onChange({
      topics: chapter.topics.map((tp, i) =>
        i === ti ? { ...tp, ...patch } : tp,
      ),
    });
  };
  const removeTopic = (ti: number) => {
    onChange({ topics: chapter.topics.filter((_, i) => i !== ti) });
  };
  const addTopic = () => {
    onChange({
      topics: [
        ...chapter.topics,
        {
          topic_id: tempKey('tp'),
          topic_title: t('roadmap.create.newTopic'),
          description: t('roadmap.create.newTopicDescription'),
        },
      ],
    });
  };

  return (
    <div
      className='rounded-[12px] overflow-hidden'
      style={{
        background: 'var(--pl-bg-elev)',
        border: '1px solid var(--pl-border)',
      }}
    >
      <div className='flex items-center gap-3 p-4'>
        <button
          onClick={() => setOpen(!open)}
          className='shrink-0 transition-transform'
          style={{
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
            color: 'var(--pl-text-faint)',
          }}
        >
          <ChevronRight size={14} />
        </button>
        <span
          className='shrink-0 text-[10.5px] tracking-[0.14em] uppercase px-2 py-[2px] rounded-full'
          style={{
            background: 'var(--pl-accent-soft)',
            color: 'var(--pl-accent-strong)',
            fontFamily: 'var(--font-mono-pl)',
          }}
        >
          {t('roadmap.create.chapter', { n: index + 1 })}
        </span>
        <input
          value={chapter.chapter_title}
          onChange={(e) => onChange({ chapter_title: e.target.value })}
          className='flex-1 bg-transparent outline-none text-[14.5px] font-[500]'
          style={{ color: 'var(--pl-text)' }}
        />
        <span
          className='text-[11.5px]'
          style={{ color: 'var(--pl-text-faint)' }}
        >
          {t('roadmap.create.topicsCount', { count: chapter.topics.length })}
        </span>
        <button
          onClick={onRemove}
          className='p-1 rounded-md hover:bg-[var(--pl-bg-hover)]'
          title={t('roadmap.create.deleteChapter')}
        >
          <Trash2 size={13} style={{ color: 'var(--pl-text-faint)' }} />
        </button>
      </div>

      {open && (
        <div
          className='px-4 pb-4 pt-3 flex flex-col gap-3'
          style={{ borderTop: '1px solid var(--pl-border)' }}
        >
          <textarea
            value={chapter.objective}
            onChange={(e) => onChange({ objective: e.target.value })}
            placeholder={t('roadmap.create.objectiveLabel')}
            rows={2}
            className='w-full px-3 py-2 rounded-[8px] text-[12.5px] resize-none outline-none'
            style={{
              background: 'var(--pl-bg)',
              border: '1px solid var(--pl-border)',
              color: 'var(--pl-text-muted)',
            }}
          />

          <div className='flex flex-col gap-2'>
            {chapter.topics.map((topic, ti) => (
              <div
                key={topic.topic_id || ti}
                className='flex flex-col gap-1.5 px-3 py-2.5 rounded-[8px]'
                style={{
                  background: 'var(--pl-bg)',
                  border: '1px solid var(--pl-border)',
                }}
              >
                <div className='flex items-center gap-2'>
                  <span
                    className='text-[11px] w-5 text-center shrink-0'
                    style={{
                      fontFamily: 'var(--font-mono-pl)',
                      color: 'var(--pl-text-faint)',
                    }}
                  >
                    {ti + 1}
                  </span>
                  <input
                    value={topic.topic_title}
                    onChange={(e) =>
                      updateTopic(ti, { topic_title: e.target.value })
                    }
                    className='flex-1 bg-transparent outline-none text-[13px] font-[500]'
                    style={{ color: 'var(--pl-text)' }}
                  />
                  <button
                    onClick={() => removeTopic(ti)}
                    className='p-1 rounded-md hover:bg-[var(--pl-bg-hover)]'
                  >
                    <X size={12} style={{ color: 'var(--pl-text-faint)' }} />
                  </button>
                </div>
                <input
                  value={topic.description}
                  onChange={(e) =>
                    updateTopic(ti, { description: e.target.value })
                  }
                  placeholder={t('roadmap.create.descriptionLabel')}
                  className='w-full bg-transparent outline-none text-[11.5px] pl-7'
                  style={{ color: 'var(--pl-text-muted)' }}
                />
              </div>
            ))}
            <button
              onClick={addTopic}
              className='flex items-center justify-center gap-1.5 py-2 rounded-[8px] text-[11.5px] transition-all'
              style={{
                background: 'transparent',
                color: 'var(--pl-text-muted)',
                border: '1px dashed var(--pl-border)',
              }}
            >
              <Plus size={11} /> {t('roadmap.create.addTopic')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateRoadmapPage;
