import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useNotesBySet } from '@/hooks/useNotes';
import { mapI18nToAiApiLanguage } from '@/lib/utils';

import AIExamSettings, { type QuestionCounts } from './ai-tab/AIExamSettings';
import AIFileUploader from './ai-tab/AIFileUploader';
import AINotesGrid from './ai-tab/AINotesGrid';
import AISettingsCard from './ai-tab/AISettingsCard';
import AISourcePicker from './ai-tab/AISourcePicker';
import AITitlePrivacyRow from './ai-tab/AITitlePrivacyRow';
import AIWebUrlInput from './ai-tab/AIWebUrlInput';
import {
  DEFAULT_DIFFICULTY,
  type AIPrivacy,
  type AISource,
  type AISubmitData,
  type NoteAIInput,
} from './ai-tab/types';

import type { ExamAIDifficultyDistribution } from '@/services/types/exam.types';

export type { AISubmitData } from './ai-tab/types';

const NOTES_PAGE_SIZE = 6;

type Props = {
  type: 'Flashcard' | 'Exam';
  setId: number;
  isLoading?: boolean;
  onValidityChange: (valid: boolean) => void;
  onDataChange: (data: AISubmitData) => void;
};

const CreateAITab = ({
  type,
  setId,
  isLoading,
  onValidityChange,
  onDataChange,
}: Props) => {
  const { t, i18n } = useTranslation();
  const [source, setSource] = useState<AISource>('notes');
  const [selectedNotes, setSelectedNotes] = useState<NoteAIInput[]>([]);
  const [notesPage, setNotesPage] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [webUrlsInput, setWebUrlsInput] = useState<string[]>(['']);
  const [existingExamFile, setExistingExamFile] = useState<File[]>([]);

  const { data: notesData } = useNotesBySet(setId, {
    page: notesPage,
    size: NOTES_PAGE_SIZE,
  });
  const notes = notesData?.items || [];
  const notesTotalPage = notesData?.totalPage || 1;

  const [aiTitle, setAiTitle] = useState('');
  const [aiPrivacy, setAiPrivacy] = useState<AIPrivacy>('PUBLIC');
  const [language, setLanguage] = useState(() =>
    mapI18nToAiApiLanguage(i18n.language),
  );
  const [freeText, setFreeText] = useState('');

  const [counts, setCounts] = useState<QuestionCounts>({
    MCQ: 5,
    TF: 3,
    ESS: 2,
  });
  const [difficulty, setDifficulty] =
    useState<ExamAIDifficultyDistribution>(DEFAULT_DIFFICULTY);

  const webUrls = useMemo(
    () => webUrlsInput.map((s) => s.trim()).filter(Boolean),
    [webUrlsInput],
  );

  const isExam = type === 'Exam';
  const totalQuestions = counts.MCQ + counts.TF + counts.ESS;
  const difficultySum = difficulty.Easy + difficulty.Medium + difficulty.Hard;
  const hasSource =
    (source === 'notes' && selectedNotes.length > 0) ||
    (source === 'files' && uploadedFiles.length > 0) ||
    (source === 'web' && webUrls.length > 0) ||
    (source === 'existing-exam' && existingExamFile.length > 0);
  const valid = isExam
    ? source === 'existing-exam'
      ? hasSource
      : hasSource && totalQuestions > 0 && difficultySum === 100
    : hasSource;

  useEffect(() => {
    onValidityChange(valid);
  }, [valid, onValidityChange]);

  useEffect(() => {
    const data: AISubmitData = {
      source,
      title: aiTitle.trim(),
      privacy: aiPrivacy,
      language,
      freeText: freeText.trim(),
    };
    if (source === 'notes') data.notes = selectedNotes;
    if (source === 'files') data.files = uploadedFiles;
    if (source === 'web') data.urls = webUrls;
    if (source === 'existing-exam') data.files = existingExamFile;
    if (isExam) {
      data.questionCounts = counts;
      data.difficulty = difficulty;
    }
    onDataChange(data);
  }, [
    source,
    selectedNotes,
    uploadedFiles,
    webUrls,
    existingExamFile,
    aiTitle,
    aiPrivacy,
    language,
    freeText,
    isExam,
    counts,
    difficulty,
    onDataChange,
  ]);

  const toggleNote = (id: number, documentUrls: string[]) =>
    setSelectedNotes((prev) =>
      prev.some((n) => n.note_id === id)
        ? prev.filter((n) => n.note_id !== id)
        : [...prev, { note_id: id, document_urls: documentUrls }],
    );

  const handleDocumentToggle = (noteId: number, docUrl: string) =>
    setSelectedNotes((prev) =>
      prev.map((n) =>
        n.note_id !== noteId
          ? n
          : {
              ...n,
              document_urls: n.document_urls.includes(docUrl)
                ? n.document_urls.filter((u) => u !== docUrl)
                : [...n.document_urls, docUrl],
            },
      ),
    );

  return (
    <div className='space-y-6'>
      <AISourcePicker
        value={source}
        onChange={setSource}
        disabled={isLoading}
        showExistingExam={isExam}
      />

      <div>
        <div className='flex items-center justify-between mb-2.5'>
          <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground'>
            {t('modal.ai.contentLabel', { defaultValue: 'Content' })}
          </Label>
          {source === 'notes' && notesTotalPage > 1 && (
            <div className='flex items-center gap-1.5'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={notesPage <= 0 || isLoading}
                onClick={() => setNotesPage((p) => Math.max(0, p - 1))}
                className='h-[26px] w-[26px] p-0'
              >
                <ChevronLeft className='w-3 h-3' />
              </Button>
              <span className='text-xs text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                {t('modal.ai.notesPageOf', {
                  current: notesPage + 1,
                  total: notesTotalPage,
                  defaultValue: '{{current}}/{{total}}',
                })}
              </span>
              <Button
                type='button'
                variant='outline'
                size='sm'
                disabled={notesPage >= notesTotalPage - 1 || isLoading}
                onClick={() =>
                  setNotesPage((p) => Math.min(notesTotalPage - 1, p + 1))
                }
                className='h-[26px] w-[26px] p-0'
              >
                <ChevronRight className='w-3 h-3' />
              </Button>
            </div>
          )}
        </div>
        {source === 'notes' && (
          <AINotesGrid
            notes={notes}
            selectedNotes={selectedNotes}
            onToggle={toggleNote}
            onDocumentToggle={handleDocumentToggle}
            disabled={isLoading}
          />
        )}
        {source === 'files' && (
          <AIFileUploader
            files={uploadedFiles}
            onChange={setUploadedFiles}
            disabled={isLoading}
          />
        )}
        {source === 'web' && (
          <AIWebUrlInput
            urls={webUrlsInput}
            onChange={setWebUrlsInput}
            disabled={isLoading}
          />
        )}
        {source === 'existing-exam' && (
          <AIFileUploader
            files={existingExamFile}
            onChange={setExistingExamFile}
            disabled={isLoading}
            maxFiles={1}
          />
        )}
      </div>

      <AITitlePrivacyRow
        title={aiTitle}
        onTitleChange={setAiTitle}
        privacy={aiPrivacy}
        onPrivacyChange={setAiPrivacy}
        disabled={isLoading}
      />

      {isExam && source !== 'existing-exam' && (
        <AIExamSettings
          counts={counts}
          onCountsChange={setCounts}
          difficulty={difficulty}
          onDifficultyChange={setDifficulty}
          disabled={isLoading}
        />
      )}

      <AISettingsCard
        language={language}
        onLanguageChange={(v) => setLanguage(v as typeof language)}
        freeText={freeText}
        onFreeTextChange={setFreeText}
        disabled={isLoading}
      />
    </div>
  );
};

export default CreateAITab;
