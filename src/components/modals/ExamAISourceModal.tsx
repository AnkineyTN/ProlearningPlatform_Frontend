import {
  ArrowLeft,
  Download,
  FileText,
  Link2,
  Loader2,
  Upload,
  X,
  FileX,
  Repeat2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import NoteCardSelect from '@/components/cards/NoteCardSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useNotesBySet } from '@/hooks/useNotes';

import type { ExamAIDifficultyDistribution } from '@/services/types/exam.types';

const DEFAULT_DIFFICULTY: ExamAIDifficultyDistribution = {
  Easy: 50,
  Medium: 30,
  Hard: 20,
};

const EXAM_AI_LANGUAGES = ['English', 'Vietnamese'] as const;
export type ExamAILanguage = (typeof EXAM_AI_LANGUAGES)[number];

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
}

type ExamAISourceModalProps = {
  setId: number;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  onSubmit: (data: {
    source: 'notes' | 'files' | 'web' | 'similar';
    noteIds?: number[];
    files?: File[];
    urls?: string[];
    questionCounts: { MCQ: number; TF: number; ESS: number };
    difficulty: ExamAIDifficultyDistribution;
    language: ExamAILanguage;
    freeText: string;
  }) => void;
  isLoading?: boolean;
};

const ExamAISourceModal = ({
  setId,
  isOpen,
  onClose,
  onBack,
  onSubmit,
  isLoading,
}: ExamAISourceModalProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<
    'notes' | 'files' | 'web' | 'similar'
  >('notes');
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [webUrlsText, setWebUrlsText] = useState('');

  const [mcqCount, setMcqCount] = useState(5);
  const [tfCount, setTfCount] = useState(3);
  const [essCount, setEssCount] = useState(2);
  const [language, setLanguage] = useState<ExamAILanguage>('English');
  const [diffEasy, setDiffEasy] = useState(DEFAULT_DIFFICULTY.Easy);
  const [diffMedium, setDiffMedium] = useState(DEFAULT_DIFFICULTY.Medium);
  const [diffHard, setDiffHard] = useState(DEFAULT_DIFFICULTY.Hard);
  const [freeText, setFreeText] = useState('');
  const [sampleFile, setSampleFile] = useState<File | null>(null);
  const [similarDesc, setSimilarDesc] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState<string | null>(null);

  const getFileKind = (file: File): 'pdf' | 'txt' | 'download' => {
    const name = file.name.toLowerCase();
    if (file.type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
    if (file.type.startsWith('text/') || name.endsWith('.txt')) return 'txt';
    return 'download';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileClick = async (file: File) => {
    const kind = getFileKind(file);
    if (kind === 'pdf') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPreviewText(null);
      setPreviewFile(file);
    } else if (kind === 'txt') {
      const text = await file.text();
      setPreviewUrl(null);
      setPreviewText(text);
      setPreviewFile(file);
    } else {
      downloadFile(file);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPreviewText(null);
    setPreviewFile(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const { data: notesData } = useNotesBySet(setId, { page: 0, size: 20 });
  const notes = notesData?.items || [];

  const handleNoteSelect = (noteId: number) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId],
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      if (filesArray.length > 3) {
        toast.error('Maximum 3 files allowed');
        setUploadedFiles(filesArray.slice(0, 3));
      } else {
        setUploadedFiles(filesArray);
      }
    }
  };

  const webUrls = webUrlsText
    .split(/\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  const totalQuestions = mcqCount + tfCount + essCount;
  const difficultySum = diffEasy + diffMedium + diffHard;
  const difficultyValid = difficultySum === 100;
  const hasSource =
    (activeTab === 'notes' && selectedNotes.length > 0) ||
    (activeTab === 'files' && uploadedFiles.length > 0) ||
    (activeTab === 'web' && webUrls.length > 0) ||
    (activeTab === 'similar' && sampleFile !== null);
  const canSubmit =
    activeTab === 'similar'
      ? hasSource
      : hasSource && totalQuestions > 0 && difficultyValid;

  const clampPct = (n: number) =>
    Number.isFinite(n) ? Math.min(100, Math.max(0, Math.round(n))) : 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const questionCounts = { MCQ: mcqCount, TF: tfCount, ESS: essCount };
    const difficulty: ExamAIDifficultyDistribution = {
      Easy: clampPct(diffEasy),
      Medium: clampPct(diffMedium),
      Hard: clampPct(diffHard),
    };
    const payload = {
      questionCounts,
      language,
      difficulty,
      freeText: freeText.trim(),
    };
    if (activeTab === 'notes') {
      onSubmit({ source: 'notes', noteIds: selectedNotes, ...payload });
    } else if (activeTab === 'files') {
      onSubmit({ source: 'files', files: uploadedFiles, ...payload });
    } else if (activeTab === 'web') {
      onSubmit({ source: 'web', urls: webUrls, ...payload });
    } else if (activeTab === 'similar' && sampleFile) {
      onSubmit({
        source: 'similar',
        files: [sampleFile],
        ...payload,
        freeText: similarDesc.trim(),
      });
    }
  };

  return (
    <>
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isLoading) onClose();
      }}
    >
      <DialogContent
        className='w-full max-w-4xl sm:max-w-4xl px-10 py-8 max-h-[90vh] overflow-y-auto'
        showCloseButton={!isLoading}
        onEscapeKeyDown={(e) => {
          if (isLoading) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isLoading) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            Generate Exam with AI
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className='flex gap-2 mb-2 border-b border-border'>
          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'notes'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className='flex items-center gap-2'>
              <FileText className='w-4 h-4' />
              {t('modal.ai.fromNotes')}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Upload className='w-4 h-4' />
              {t('modal.ai.uploadFiles')}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'web'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Link2 className='w-4 h-4' />
              {t('modal.ai.fromWeb', { defaultValue: 'Web URL' })}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('similar')}
            className={`px-4 py-2 font-medium transition-colors cursor-pointer ${
              activeTab === 'similar'
                ? 'text-foreground border-b-2 border-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className='flex items-center gap-2'>
              <Repeat2 className='w-4 h-4' />
              {t('modal.ai.similarExam', { defaultValue: 'Similar Exam' })}
            </div>
          </button>
        </div>

        {/* Source Content */}
        <div className='min-h-[200px] mb-6'>
          {activeTab === 'notes' && (
            <div>
              {notes.length === 0 ? (
                <div className='flex flex-col justify-center items-center py-12 gap-2'>
                  <FileX className='text-muted-foreground mx-auto mb-1 text-6xl w-12 h-12' />
                  <div className='text-muted-foreground text-lg'>
                    No notes found
                  </div>
                </div>
              ) : (
                <>
                  <p className='text-sm text-muted-foreground mb-4'>
                    {t('modal.ai.selectNotes', { type: 'exam' })}
                  </p>
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {notes.map((note) => (
                      <NoteCardSelect
                        key={note.id}
                        note={{
                          id: note.id,
                          title: note.title,
                          description:
                            note.description || 'No description available...',
                          privacy: note.privacy,
                          timeAgo: getTimeAgo(note.updated_at),
                          created_at: new Date(
                            note.created_at,
                          ).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          }),
                        }}
                        onSelected={() => {
                          if (!isLoading) handleNoteSelect(note.id);
                        }}
                        isSelected={selectedNotes.includes(note.id)}
                      />
                    ))}
                  </div>
                </>
              )}
              {selectedNotes.length > 0 && (
                <p className='text-sm text-muted-foreground mt-3'>
                  {selectedNotes.length} note
                  {selectedNotes.length > 1 ? 's' : ''} {t('modal.ai.selected')}
                </p>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className='flex flex-col items-center justify-center'>
              <div className='w-full border-2 border-dashed border-ring rounded-lg p-6 text-center hover:border-foreground transition-colors'>
                <Upload className='w-10 h-10 mx-auto mb-3 text-muted-foreground' />
                <p className='text-sm text-muted-foreground mb-3'>
                  PDF, DOCX, PPTX, TXT (Maximum 3 files)
                </p>
                <label className='inline-block'>
                  <input
                    type='file'
                    multiple
                    onChange={(e) => {
                      if (!isLoading) handleFileUpload(e);
                    }}
                    className='hidden'
                    accept='.pdf,.docx,.txt,.doc,.pptx'
                    disabled={isLoading}
                  />
                  <span
                    className={`px-4 py-2 bg-foreground text-background rounded-lg inline-block text-sm ${
                      isLoading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:opacity-90 transition-opacity'
                    }`}
                  >
                    {t('modal.ai.chooseFiles')}
                  </span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className='w-full mt-3 space-y-2'>
                  {uploadedFiles.map((file, index) => {
                    const kind = getFileKind(file);
                    const actionLabel =
                      kind === 'download'
                        ? t('modal.ai.downloadToOpen', {
                            defaultValue: 'Click to download',
                          })
                        : t('modal.ai.clickToPreview', {
                            defaultValue: 'Click to preview',
                          });
                    return (
                      <button
                        key={index}
                        type='button'
                        onClick={() => handleFileClick(file)}
                        title={actionLabel}
                        className='w-full flex items-center justify-between gap-2 p-2 bg-[var(--pl-bg)] hover:bg-[var(--pl-bg-elevated)] rounded border border-border cursor-pointer text-left'
                      >
                        <div className='flex items-center gap-2 min-w-0 flex-1'>
                          {kind === 'download' ? (
                            <Download className='w-4 h-4 shrink-0 text-muted-foreground' />
                          ) : (
                            <FileText className='w-4 h-4 shrink-0 text-muted-foreground' />
                          )}
                          <span className='text-sm truncate'>{file.name}</span>
                          <span className='text-xs text-muted-foreground shrink-0'>
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                        <span
                          role='button'
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isLoading) {
                              setUploadedFiles((prev) =>
                                prev.filter((_, i) => i !== index),
                              );
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              e.preventDefault();
                              if (!isLoading) {
                                setUploadedFiles((prev) =>
                                  prev.filter((_, i) => i !== index),
                                );
                              }
                            }
                          }}
                          className='text-muted-foreground hover:text-foreground cursor-pointer shrink-0'
                        >
                          <X className='w-4 h-4' />
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'web' && (
            <div className='w-full'>
              <p className='text-sm text-muted-foreground mb-2'>
                {t('modal.ai.webUrlsHint', {
                  defaultValue: 'Enter one URL per line (https://…)',
                })}
              </p>
              <Textarea
                value={webUrlsText}
                onChange={(e) => setWebUrlsText(e.target.value)}
                placeholder='https://example.com/article'
                disabled={isLoading}
                rows={5}
                className='resize-y min-h-[100px] font-mono text-sm'
              />
              {webUrls.length > 0 && (
                <p className='text-sm text-muted-foreground mt-2'>
                  {webUrls.length} URL{webUrls.length !== 1 ? 's' : ''}{' '}
                  {t('modal.ai.selected')}
                </p>
              )}
            </div>
          )}

          {activeTab === 'similar' && (
            <div className='flex flex-col gap-5'>
              <div>
                <p className='text-sm text-muted-foreground mb-3'>
                  {t('modal.ai.similarExamHint', {
                    defaultValue:
                      'Upload a sample exam file. The AI will generate a brand-new exam with similar topics and difficulty — no questions will be copied.',
                  })}
                </p>
                <div className='w-full border-2 border-dashed border-ring rounded-lg p-6 text-center hover:border-foreground transition-colors'>
                  <Repeat2 className='w-10 h-10 mx-auto mb-3 text-muted-foreground' />
                  <p className='text-sm text-muted-foreground mb-3'>
                    {t('modal.ai.similarExamFileHint', {
                      defaultValue: 'PDF, DOCX, PPTX, TXT (1 file only)',
                    })}
                  </p>
                  <label className='inline-block'>
                    <input
                      type='file'
                      onChange={(e) => {
                        if (!isLoading && e.target.files?.[0]) {
                          setSampleFile(e.target.files[0]);
                        }
                      }}
                      className='hidden'
                      accept='.pdf,.docx,.txt,.doc,.pptx'
                      disabled={isLoading}
                    />
                    <span
                      className={`px-4 py-2 bg-foreground text-background rounded-lg inline-block text-sm ${
                        isLoading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:opacity-90 transition-opacity'
                      }`}
                    >
                      {t('modal.ai.chooseFile', {
                        defaultValue: 'Choose File',
                      })}
                    </span>
                  </label>
                </div>

                {sampleFile && (() => {
                  const kind = getFileKind(sampleFile);
                  const actionLabel =
                    kind === 'download'
                      ? t('modal.ai.downloadToOpen', {
                          defaultValue: 'Click to download',
                        })
                      : t('modal.ai.clickToPreview', {
                          defaultValue: 'Click to preview',
                        });
                  return (
                    <button
                      type='button'
                      onClick={() => handleFileClick(sampleFile)}
                      title={actionLabel}
                      className='w-full mt-3 flex items-center justify-between gap-2 p-2 bg-[var(--pl-bg-sunken)] hover:bg-[var(--pl-bg-elevated)] rounded border border-border cursor-pointer text-left'
                    >
                      <div className='flex items-center gap-2 min-w-0 flex-1'>
                        {kind === 'download' ? (
                          <Download className='w-4 h-4 shrink-0 text-muted-foreground' />
                        ) : (
                          <FileText className='w-4 h-4 shrink-0 text-muted-foreground' />
                        )}
                        <span className='text-sm truncate'>
                          {sampleFile.name}
                        </span>
                        <span className='text-xs text-muted-foreground shrink-0'>
                          {formatFileSize(sampleFile.size)}
                        </span>
                      </div>
                      <span
                        role='button'
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isLoading) setSampleFile(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.stopPropagation();
                            e.preventDefault();
                            if (!isLoading) setSampleFile(null);
                          }
                        }}
                        className='text-muted-foreground hover:text-foreground cursor-pointer ml-2 shrink-0'
                      >
                        <X className='w-4 h-4' />
                      </span>
                    </button>
                  );
                })()}
              </div>

              <div>
                <Label className='text-sm font-medium mb-2 block'>
                  {t('modal.ai.similarExamDesc', {
                    defaultValue: 'Additional description (optional)',
                  })}
                </Label>
                <Textarea
                  value={similarDesc}
                  onChange={(e) => setSimilarDesc(e.target.value)}
                  placeholder={t('modal.ai.similarExamDescPlaceholder', {
                    defaultValue:
                      'E.g. Focus on calculus problems, skip the essay section, increase difficulty slightly, add more real-world application questions…',
                  })}
                  disabled={isLoading}
                  rows={4}
                  className='resize-y min-h-[100px]'
                />
              </div>
            </div>
          )}
        </div>

        {/* Question Counts, Difficulty, Language, freeText — hidden for Similar Exam tab */}
        {activeTab !== 'similar' && (
          <>
            <div className='mb-6'>
              <Label className='text-sm font-medium mb-3 block'>
                Number of Questions by Type
              </Label>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <label className='text-xs text-muted-foreground mb-1 block'>
                    Multiple Choice
                  </label>
                  <Input
                    type='number'
                    min={0}
                    max={20}
                    value={mcqCount}
                    onChange={(e) =>
                      setMcqCount(Math.max(0, Number(e.target.value)))
                    }
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className='text-xs text-muted-foreground mb-1 block'>
                    True / False
                  </label>
                  <Input
                    type='number'
                    min={0}
                    max={20}
                    value={tfCount}
                    onChange={(e) =>
                      setTfCount(Math.max(0, Number(e.target.value)))
                    }
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className='text-xs text-muted-foreground mb-1 block'>
                    Essay
                  </label>
                  <Input
                    type='number'
                    min={0}
                    max={10}
                    value={essCount}
                    onChange={(e) =>
                      setEssCount(Math.max(0, Number(e.target.value)))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
              <p className='text-xs text-muted-foreground mt-2'>
                Total: {totalQuestions} question
                {totalQuestions !== 1 ? 's' : ''}
              </p>
            </div>
            {/* Difficulty distribution (must total 100%) */}
            <div className='mb-6'>
              <div className='flex flex-wrap items-end justify-between gap-2 mb-2'>
                <Label className='text-sm font-medium block mb-0'>
                  {t('modal.ai.difficultyMix', {
                    defaultValue:
                      'Difficulty mix (% — Easy + Medium + Hard = 100)',
                  })}
                </Label>
                <button
                  type='button'
                  onClick={() => {
                    setDiffEasy(DEFAULT_DIFFICULTY.Easy);
                    setDiffMedium(DEFAULT_DIFFICULTY.Medium);
                    setDiffHard(DEFAULT_DIFFICULTY.Hard);
                  }}
                  disabled={isLoading}
                  className='text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground disabled:opacity-50'
                >
                  {t('modal.ai.difficultyReset', {
                    defaultValue: 'Reset to 50 / 30 / 20',
                  })}
                </button>
              </div>
              <div className='grid grid-cols-3 gap-4'>
                <div>
                  <label className='text-xs text-muted-foreground mb-1 block'>
                    {t('modal.ai.difficultyEasy', { defaultValue: 'Easy' })}
                  </label>
                  <Input
                    type='number'
                    min={0}
                    max={100}
                    value={diffEasy}
                    onChange={(e) =>
                      setDiffEasy(Math.max(0, Number(e.target.value)))
                    }
                    disabled={isLoading}
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
                    value={diffMedium}
                    onChange={(e) =>
                      setDiffMedium(Math.max(0, Number(e.target.value)))
                    }
                    disabled={isLoading}
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
                    value={diffHard}
                    onChange={(e) =>
                      setDiffHard(Math.max(0, Number(e.target.value)))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
              <p
                className={`text-xs mt-2 ${
                  difficultyValid ? 'text-muted-foreground' : 'text-destructive'
                }`}
              >
                {t('modal.ai.difficultySumHint', {
                  sum: difficultySum,
                  defaultValue: 'Current total: {{sum}}% — must equal 100%',
                })}
              </p>
            </div>

            <div className='mb-6'>
              <Label className='text-sm font-medium mb-2 block'>Language</Label>
              <Select
                value={language}
                onValueChange={(v) => setLanguage(v as ExamAILanguage)}
                disabled={isLoading}
              >
                <SelectTrigger className='w-full'>
                  <SelectValue placeholder='Language' />
                </SelectTrigger>
                <SelectContent>
                  {EXAM_AI_LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* freeText — maps to freeText (note/file) or free_text (web) on API */}
            <div className='mb-6'>
              <Label className='text-sm font-medium mb-2 block'>
                {t('modal.ai.freeText', {
                  defaultValue: 'Additional instructions for the AI (optional)',
                })}
              </Label>
              <Textarea
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                placeholder={t('modal.ai.freeTextPlaceholder', {
                  defaultValue:
                    'E.g. focus on definitions, avoid trick questions, align with chapter 3…',
                })}
                disabled={isLoading}
                rows={4}
                className='resize-y min-h-[100px]'
              />
            </div>
          </>
        )}

        <DialogFooter>
          <Button
            onClick={onBack}
            variant={'ghost'}
            disabled={isLoading}
          >
            <ArrowLeft className='w-4 h-4' />
            {t('modal.back')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            variant={"default"}
          >
            {isLoading ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin text-muted-foreground' />
                <span>{t('modal.ai.generating') || 'Generating...'}</span>
              </>
            ) : (
              <>{t('modal.generateWithAI')}</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {previewFile && (
      <Dialog
        open={!!previewFile}
        onOpenChange={(open) => {
          if (!open) closePreview();
        }}
      >
        <DialogContent className='w-full max-w-4xl sm:max-w-4xl px-6 py-6'>
          <DialogHeader>
            <DialogTitle className='text-lg font-semibold truncate pr-6'>
              {previewFile.name}
            </DialogTitle>
          </DialogHeader>
          <div className='w-full h-[70vh] mt-2'>
            {previewUrl && (
              <iframe
                src={previewUrl}
                title={previewFile.name}
                className='w-full h-full rounded border border-border'
              />
            )}
            {previewText !== null && (
              <pre className='w-full h-full overflow-auto whitespace-pre-wrap break-words text-sm p-4 bg-[var(--pl-bg-sunken)] rounded border border-border font-mono'>
                {previewText}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )}
    </>
  );
};

export default ExamAISourceModal;
