import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Loader2, Plus, X, Link } from 'lucide-react';

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
  referenceLinks: string[];
  setReferenceLinks: (v: string[]) => void;
  onSubmit: () => void;
  loading: boolean;
}) => {
  const { t } = useTranslation();
  const [linkInput, setLinkInput] = useState('');

  const levelOptions = LEVEL_VALUES.map((v) => ({
    value: v,
    label: t(`roadmap.level.${v}`),
  }));
  const languageOptions = LANGUAGE_VALUES.map((v) => ({
    value: v,
    label: t(`roadmap.language.${v}`),
  }));

  const addLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    props.setReferenceLinks([...props.referenceLinks, trimmed]);
    setLinkInput('');
  };

  const removeLink = (idx: number) => {
    props.setReferenceLinks(props.referenceLinks.filter((_, i) => i !== idx));
  };

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

      <div className='mt-4'>
        <Field label={t('roadmap.create.referenceLinks')}>
          <p className='text-[11.5px] mb-2 text-[var(--pl-text-faint)]'>
            {t('roadmap.create.referenceLinksHint')}
          </p>

          {props.referenceLinks.length > 0 && (
            <ul className='mb-2 flex flex-col gap-1.5'>
              {props.referenceLinks.map((link, idx) => (
                <li
                  key={idx}
                  className='flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'
                >
                  <Link size={11} className='shrink-0 text-[var(--pl-text-faint)]' />
                  <span className='flex-1 text-[12px] truncate text-[var(--pl-text-muted)]'>
                    {link}
                  </span>
                  <button
                    type='button'
                    onClick={() => removeLink(idx)}
                    className='shrink-0 p-0.5 rounded hover:bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)] hover:text-[var(--pl-text)]'
                    title={t('roadmap.create.removeReferenceLink')}
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className='flex gap-2'>
            <input
              type='url'
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLink())}
              placeholder={t('roadmap.create.referenceLinkPlaceholder')}
              className='flex-1 px-3 py-2 rounded-[8px] text-[12.5px] outline-none bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] text-[var(--pl-text)]'
            />
            <Button
              type='button'
              variant='outline'
              onClick={addLink}
              disabled={!linkInput.trim()}
              className='gap-1.5 px-3 py-2 h-auto text-[12.5px] rounded-[8px] border-[var(--pl-border)] text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
            >
              <Plus size={12} />
              {t('roadmap.create.addReferenceLink')}
            </Button>
          </div>
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
