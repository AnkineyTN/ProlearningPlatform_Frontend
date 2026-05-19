import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Plus, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type {
  PreviewChapter,
  PreviewTopic,
} from '@/services/types/roadmap.types';

import { tempKey } from './shared';

export const ChapterEditor = ({
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
    <div className='rounded-[12px] overflow-hidden bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'>
      <div className='flex items-center gap-3 p-4'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setOpen(!open)}
          className={`shrink-0 transition-transform h-auto w-auto p-0 bg-transparent hover:bg-transparent text-[var(--pl-text-faint)] ${
            open ? 'rotate-90' : 'rotate-0'
          }`}
        >
          <ChevronRight size={14} />
        </Button>
        <span className='shrink-0 text-[10.5px] tracking-[0.14em] uppercase px-2 py-[2px] rounded-full bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] font-[var(--font-mono-pl)]'>
          {t('roadmap.create.chapter', { n: index + 1 })}
        </span>
        <input
          value={chapter.chapter_title}
          onChange={(e) => onChange({ chapter_title: e.target.value })}
          className='flex-1 bg-transparent outline-none text-[14.5px] font-medium text-[var(--pl-text)]'
        />
        <span className='text-[11.5px] text-[var(--pl-text-faint)]'>
          {t('roadmap.create.topicsCount', { count: chapter.topics.length })}
        </span>
        <Button
          variant='ghost'
          size='icon'
          onClick={onRemove}
          className='h-auto w-auto p-1 rounded-md hover:bg-[var(--pl-bg-hover)]'
          title={t('roadmap.create.deleteChapter')}
        >
          <Trash2 size={13} className='text-[var(--pl-text-faint)]' />
        </Button>
      </div>

      {open && (
        <div className='px-4 pb-4 pt-3 flex flex-col gap-3 border-t border-[var(--pl-border)]'>
          <textarea
            value={chapter.objective}
            onChange={(e) => onChange({ objective: e.target.value })}
            placeholder={t('roadmap.create.objectiveLabel')}
            rows={2}
            className='w-full px-3 py-2 rounded-[8px] text-[12.5px] resize-none outline-none bg-[var(--pl-bg)] border border-[var(--pl-border)] text-[var(--pl-text-muted)]'
          />

          <div className='flex flex-col gap-2'>
            {chapter.topics.map((topic, ti) => (
              <div
                key={topic.topic_id || ti}
                className='flex flex-col gap-1.5 px-3 py-2.5 rounded-[8px] bg-[var(--pl-bg)] border border-[var(--pl-border)]'
              >
                <div className='flex items-center gap-2'>
                  <span className='text-[11px] w-5 text-center shrink-0 font-[var(--font-mono-pl)] text-[var(--pl-text-faint)]'>
                    {ti + 1}
                  </span>
                  <input
                    value={topic.topic_title}
                    onChange={(e) =>
                      updateTopic(ti, { topic_title: e.target.value })
                    }
                    className='flex-1 bg-transparent outline-none text-[13px] font-medium text-[var(--pl-text)]'
                  />
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => removeTopic(ti)}
                    className='h-auto w-auto p-1 rounded-md hover:bg-[var(--pl-bg-hover)]'
                  >
                    <X size={12} className='text-[var(--pl-text-faint)]' />
                  </Button>
                </div>
                <input
                  value={topic.description}
                  onChange={(e) =>
                    updateTopic(ti, { description: e.target.value })
                  }
                  placeholder={t('roadmap.create.descriptionLabel')}
                  className='w-full bg-transparent outline-none text-[11.5px] pl-7 text-[var(--pl-text-muted)]'
                />
              </div>
            ))}
            <Button
              onClick={addTopic}
              variant='ghost'
              className='justify-center gap-1.5 py-2 rounded-[8px] text-[11.5px] h-auto bg-transparent text-[var(--pl-text-muted)] border border-dashed border-[var(--pl-border)] hover:bg-[var(--pl-bg-hover)]'
            >
              <Plus size={11} /> {t('roadmap.create.addTopic')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
