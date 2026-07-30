import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mapI18nToAiApiLanguage } from '@/lib/utils';

import NoteReferenceLinksInput from './ai-tab/NoteReferenceLinksInput';
import { type AIPrivacy, type NoteAIGenerateData } from './ai-tab/types';
import { Globe } from 'lucide-react';

const TOPIC_MAX_LENGTH = 100;

type Props = {
  isLoading?: boolean;
  onValidityChange: (valid: boolean) => void;
  onDataChange: (data: NoteAIGenerateData) => void;
};

const CreateNoteAITab = ({
  isLoading,
  onValidityChange,
  onDataChange,
}: Props) => {
  const { t, i18n } = useTranslation();

  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [referenceLinks, setReferenceLinks] = useState<string[]>(['']);
  const [areReferenceLinksValid, setAreReferenceLinksValid] = useState(true);
  const [privacy, setPrivacy] = useState<AIPrivacy>('PUBLIC');
  const [language, setLanguage] = useState(() =>
    mapI18nToAiApiLanguage(i18n.language),
  );

  const valid = topic.trim().length > 0 && areReferenceLinksValid;

  useEffect(() => {
    onValidityChange(valid);
  }, [valid, onValidityChange]);

  useEffect(() => {
    onDataChange({
      topic: topic.trim(),
      description: description.trim(),
      referenceLinks: referenceLinks.map((s) => s.trim()).filter(Boolean),
      language,
      privacy,
    });
  }, [topic, description, referenceLinks, language, privacy, onDataChange]);

  return (
    <div className='space-y-6'>
      <div>
        <div className='flex items-baseline justify-between gap-2 mb-2'>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground'>
            {t('modal.ai.note.topicLabel', { defaultValue: 'Topic' })}
            <span className='text-destructive ml-1'>*</span>
          </Label>
          <span className='text-xs text-muted-foreground shrink-0'>
            {t('modal.charCount', {
              current: topic.length,
              max: TOPIC_MAX_LENGTH,
              defaultValue: '{{current}}/{{max}}',
            })}
          </span>
        </div>
        <Input
          type='text'
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          disabled={isLoading}
          maxLength={TOPIC_MAX_LENGTH}
          placeholder={t('modal.ai.note.topicPlaceholder', {
            defaultValue: 'E.g. The French Revolution, Binary search trees…',
          })}
          className='h-11 px-3.5 rounded-lg bg-[var(--pl-bg-sunken)]'
        />
      </div>

      <div>
        <div className='flex items-baseline justify-between mb-2'>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground'>
            {t('modal.description')}
          </Label>
        </div>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
          rows={3}
          placeholder={t('modal.ai.note.descriptionPlaceholder', {
            defaultValue:
              'Add context — what to cover, depth, audience, sections to include…',
          })}
          className='w-full px-3.5 py-3 rounded-lg bg-[var(--pl-bg-sunken)] resize-y min-h-[90px]'
        />
      </div>

      <div>
        <div className='flex items-baseline justify-between mb-2'>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground'>
            {t('modal.ai.note.referenceLinksLabel', {
              defaultValue: 'Reference links',
            })}
          </Label>
          <p className='text-xs text-muted-foreground italic mt-1.5'>
            <Globe className='inline w-3 h-3 mr-1' />
            {t('modal.ai.webUrlsHintMax', {
              defaultValue: 'Up to {{count}} links',
              count: 3,
            })}
          </p>
        </div>
        <NoteReferenceLinksInput
          links={referenceLinks}
          onChange={setReferenceLinks}
          disabled={isLoading}
          maxLinks={3}
          onValidityChange={setAreReferenceLinksValid}
        />
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2 block'>
            {t('modal.ai.language', { defaultValue: 'Language' })}
          </Label>
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as typeof language)}
            disabled={isLoading}
          >
            <SelectTrigger className='w-full h-11 bg-[var(--pl-bg-sunken)]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='English'>English</SelectItem>
              <SelectItem value='Vietnamese'>Vietnamese</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2 block'>
            {t('modal.privacy')}
          </Label>
          <Select
            value={privacy}
            onValueChange={(v) => setPrivacy(v as AIPrivacy)}
            disabled={isLoading}
          >
            <SelectTrigger className='w-full h-11 bg-[var(--pl-bg-sunken)]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='PRIVATE'>{t('modal.private')}</SelectItem>
              <SelectItem value='PUBLIC'>{t('modal.public')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CreateNoteAITab;
