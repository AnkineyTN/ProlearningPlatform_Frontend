import { ArrowLeft, FileText, Loader2, Upload, X, FileX } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import NoteCardSelect from '@/components/cards/NoteCardSelect';
import { Button } from '@/components/ui/button';
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

export type ExamAIDifficulty = 'easy' | 'medium' | 'hard';

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
    source: 'notes' | 'files';
    noteIds?: number[];
    files?: File[];
    questionCounts: { MCQ: number; TF: number; ESS: number };
    language: string;
    difficulty: ExamAIDifficulty;
    specialRequirements?: string;
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
  const [activeTab, setActiveTab] = useState<'notes' | 'files'>('notes');
  const [selectedNotes, setSelectedNotes] = useState<number[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [mcqCount, setMcqCount] = useState(5);
  const [tfCount, setTfCount] = useState(3);
  const [essCount, setEssCount] = useState(2);
  const [language, setLanguage] = useState('English');
  const [difficulty, setDifficulty] = useState<ExamAIDifficulty>('medium');
  const [specialRequirements, setSpecialRequirements] = useState('');

  const { data: notesData } = useNotesBySet(setId, 0, 20);
  const notes = notesData?.items || [];

  if (!isOpen) return null;

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

  const totalQuestions = mcqCount + tfCount + essCount;
  const hasSource =
    (activeTab === 'notes' && selectedNotes.length > 0) ||
    (activeTab === 'files' && uploadedFiles.length > 0);
  const canSubmit = hasSource && totalQuestions > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const questionCounts = { MCQ: mcqCount, TF: tfCount, ESS: essCount };
    const trimmedSpecial = specialRequirements.trim();
    const payload = {
      questionCounts,
      language,
      difficulty,
      ...(trimmedSpecial ? { specialRequirements: trimmedSpecial } : {}),
    };
    if (activeTab === 'notes') {
      onSubmit({ source: 'notes', noteIds: selectedNotes, ...payload });
    } else {
      onSubmit({ source: 'files', files: uploadedFiles, ...payload });
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black opacity-50' onClick={onClose} />

      <div className='relative bg-background rounded-lg shadow-xl w-full max-w-4xl mx-4 px-10 py-8 max-h-[90vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold'>Generate Exam with AI</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className={`p-1 rounded transition-colors ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-card cursor-pointer'
            }`}
          >
            <X className='w-6 h-6' />
          </button>
        </div>

        {/* Tabs */}
        <div className='flex gap-2 mb-6 border-b border-border'>
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
                  PDF, DOCX, TXT (Maximum 3 files)
                </p>
                <label className='inline-block'>
                  <input
                    type='file'
                    multiple
                    onChange={(e) => {
                      if (!isLoading) handleFileUpload(e);
                    }}
                    className='hidden'
                    accept='.pdf,.docx,.txt,.doc'
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
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className='flex items-center justify-between p-2 bg-card rounded border border-border'
                    >
                      <span className='text-sm truncate'>{file.name}</span>
                      <button
                        onClick={() =>
                          setUploadedFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        disabled={isLoading}
                        className='text-muted-foreground hover:text-foreground cursor-pointer'
                      >
                        <X className='w-4 h-4' />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Question Counts */}
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
            Total: {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
          </p>
        </div>
        <div className='flex gap-2'>
          {/* Difficulty */}
          <div className='mb-6 w-full'>
            <Label className='text-sm font-medium mb-2 block'>
              {t('modal.ai.difficulty', { defaultValue: 'Difficulty' })}
            </Label>
            <Select
              value={difficulty}
              onValueChange={(v) => setDifficulty(v as ExamAIDifficulty)}
              disabled={isLoading}
            >
              <SelectTrigger className='w-full'>
                <SelectValue
                  placeholder={t('modal.ai.difficultyPlaceholder', {
                    defaultValue: 'Select difficulty',
                  })}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='easy'>
                  {t('modal.ai.difficultyEasy', { defaultValue: 'Easy' })}
                </SelectItem>
                <SelectItem value='medium'>
                  {t('modal.ai.difficultyMedium', { defaultValue: 'Medium' })}
                </SelectItem>
                <SelectItem value='hard'>
                  {t('modal.ai.difficultyHard', { defaultValue: 'Hard' })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Language */}
          <div className='mb-6 w-full'>
            <Label className='text-sm font-medium mb-2 block'>Language</Label>
            <Input
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder='e.g. English, Vietnamese'
              disabled={isLoading}
            />
          </div>{' '}
        </div>

        {/* Special requirements */}
        <div className='mb-6'>
          <Label className='text-sm font-medium mb-2 block'>
            {t('modal.ai.specialRequirements', {
              defaultValue: 'Special requirements (optional)',
            })}
          </Label>
          <Textarea
            value={specialRequirements}
            onChange={(e) => setSpecialRequirements(e.target.value)}
            placeholder={t('modal.ai.specialRequirementsPlaceholder', {
              defaultValue:
                'E.g. focus on definitions, avoid trick questions, align with chapter 3…',
            })}
            disabled={isLoading}
            rows={4}
            className='resize-y min-h-[100px]'
          />
        </div>

        {/* Actions */}
        <div className='flex justify-end gap-3'>
          <Button
            onClick={onBack}
            disabled={isLoading}
            className={`px-6 py-2 border border-border rounded-lg bg-background text-foreground transition-colors flex items-center gap-2 ${
              isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-card cursor-pointer'
            }`}
          >
            <ArrowLeft className='w-4 h-4' />
            {t('modal.back')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isLoading}
            className='px-6 py-2 bg-foreground text-background rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed'
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
        </div>
      </div>
    </div>
  );
};

export default ExamAISourceModal;
