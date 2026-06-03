import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Label } from '@/components/ui/label';
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [webUrlsText, setWebUrlsText] = useState('');

  const [aiTitle, setAiTitle] = useState('');
  const [aiPrivacy, setAiPrivacy] = useState<AIPrivacy>('PRIVATE');
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
    () =>
      webUrlsText
        .split(/\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    [webUrlsText],
  );

  const isExam = type === 'Exam';
  const totalQuestions = counts.MCQ + counts.TF + counts.ESS;
  const difficultySum = difficulty.Easy + difficulty.Medium + difficulty.Hard;
  const hasSource =
    (source === 'notes' && selectedNotes.length > 0) ||
    (source === 'files' && uploadedFiles.length > 0) ||
    (source === 'web' && webUrls.length > 0);
  const valid = isExam
    ? hasSource && totalQuestions > 0 && difficultySum === 100
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
      />

      <div>
        <Label className='text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-2.5 block'>
          {t('modal.ai.contentLabel', { defaultValue: 'Content' })}
        </Label>
        {source === 'notes' && (
          <AINotesGrid
            setId={setId}
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
            value={webUrlsText}
            onChange={setWebUrlsText}
            urls={webUrls}
            disabled={isLoading}
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

      {isExam && (
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
