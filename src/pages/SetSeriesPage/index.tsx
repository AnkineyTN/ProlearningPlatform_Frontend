/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react'
import AISourceModal from '@/components/modals/AISourceModal';
import ExamAISourceModal from '@/components/modals/ExamAISourceModal';
import CreateMethodModal from '@/components/modals/CreateMethodModal';
import CreateNewModal from '@/components/modals/CreateNewModal';
import {
  useDeleteFlashcard,
  useGenerateFlashcardsFromFiles,
  useGenerateFlashcardsFromNotes,
  useGenerateFlashcardsFromWeb,
  useUpdateFlashcard,
} from '@/hooks/useFlashcards';
import {
  useDeleteExam,
  useUpdateExam,
  useGenerateExamFromFiles,
  useGenerateExamFromNotes,
  useGenerateExamFromWeb,
  useGenerateExamFromExistingExam,
} from '@/hooks/useExams';
import { useCreateNote, useDeleteNote, useUpdateNote } from '@/hooks/useNotes';
import type { ExamAIDifficultyDistribution } from '@/services/types/exam.types';

import FlashcardListPage from './components/FlashcardListPage';
import HeaderSetDetails from './components/HeaderSetDetails';
import MindmapListPage from './components/MindmapListPage';
import NoteListPage from './components/NoteListPage';
import ExamListPage from './components/ExamListPage';

import type { Note } from '@/components/cards/NoteCard';
import type { Flashcard } from '@/components/cards/FlashCard';
import type { ExamCardData } from '@/components/cards/ExamCard';
import { cn } from '@/lib/utils';

interface SetSeriesPageProps {
  setId: string;
}

export default function SetSeriesPage({ setId }: SetSeriesPageProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const tabMap: Record<string, string> = {
    Notes: 'notes',
    Flashcards: 'flashcards',
    Exams: 'exams',
    Mindmaps: 'mindmaps',
    Records: 'records',
  };

  const path = location.pathname.toLowerCase();
  let initialTab = 'Notes';
  if (path.includes(`/sets/${setId}/flashcards`)) initialTab = 'Flashcards';
  else if (path.includes(`/sets/${setId}/exams`)) initialTab = 'Exams';
  else if (path.includes(`/sets/${setId}/mindmaps`)) initialTab = 'Mindmaps';
  else if (path.includes(`/sets/${setId}/records`)) initialTab = 'Records';
  else if (path.includes(`/sets/${setId}/notes`)) initialTab = 'Notes';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(
    null,
  );
  const [selectedExam, setSelectedExam] = useState<ExamCardData | null>(null);

  const updateFlashcardMutation = useUpdateFlashcard();
  const deleteFlashcardMutation = useDeleteFlashcard();
  const deleteExamMutation = useDeleteExam();
  const updateExamMutation = useUpdateExam();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const generateFlashcardsMutation = useGenerateFlashcardsFromNotes();
  const generateFlashcardsFromFilesMutation = useGenerateFlashcardsFromFiles();
  const generateFlashcardsFromWebMutation = useGenerateFlashcardsFromWeb();
  const generateExamFromFilesMutation = useGenerateExamFromFiles();
  const generateExamFromNotesMutation = useGenerateExamFromNotes();
  const generateExamFromWebMutation = useGenerateExamFromWeb();
  const generateExamFromExistingExamMutation = useGenerateExamFromExistingExam();

  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAISourceModalOpen, setIsAISourceModalOpen] = useState(false);
  const [isExamAISourceModalOpen, setIsExamAISourceModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const tabs = ['Notes', 'Flashcards', 'Exams', 'Mindmaps'];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    const slug = tabMap[tab] || tab.toLowerCase();
    navigate(`/sets/${setId}/${slug}`);
  };

  const handleCreateButtonClick = () => {
    if (activeTab === 'Notes') {
      setIsCreateModalOpen(true);
    } else {
      setIsMethodModalOpen(true);
    }
  };

  const handleSelectManual = () => setIsCreateModalOpen(true);

  const handleSelectAI = () => {
    if (activeTab === 'Exams') {
      setIsExamAISourceModalOpen(true);
    } else {
      setIsAISourceModalOpen(true);
    }
  };

  const handleBackFromCreate = () => {
    setIsCreateModalOpen(false);
    if (activeTab !== 'Notes') {
      setIsMethodModalOpen(true);
    }
  };

  const handleBackFromAISource = () => {
    setIsAISourceModalOpen(false);
    setIsExamAISourceModalOpen(false);
    setIsMethodModalOpen(true);
  };

  const handleAISourceSubmit = async (data: {
    source: 'notes' | 'files' | 'web';
    selectedItems: unknown[];
    language: string;
    freeText: string;
    urls?: string[];
  }) => {
    if (activeTab === 'Flashcards') {
      try {
        let result;

        if (data.source === 'notes') {
          result = await generateFlashcardsMutation.mutateAsync({
            setId: Number(setId),
            noteIds: data.selectedItems as number[],
            language: data.language,
            freeText: data.freeText,
          });
        } else if (data.source === 'files') {
          result = await generateFlashcardsFromFilesMutation.mutateAsync({
            setId: Number(setId),
            files: data.selectedItems as File[],
            language: data.language,
            freeText: data.freeText,
          });
        } else if (data.source === 'web' && data.urls?.length) {
          result = await generateFlashcardsFromWebMutation.mutateAsync({
            setId: Number(setId),
            urls: data.urls,
            language: data.language,
            freeText: data.freeText,
          });
        }

        if (result) {
          const flashcardsContent = result.data.content;
          const flashcards = flashcardsContent.split(';').map((card) => {
            const [frontCard, backCard] = card.split('|');
            return { frontCard: frontCard?.trim(), backCard: backCard?.trim() };
          });

          setIsAISourceModalOpen(false);

          const description =
            data.source === 'notes'
              ? `Generated from ${data.selectedItems.length} note(s)`
              : data.source === 'files'
                ? `Generated from ${data.selectedItems.length} file(s)`
                : `Generated from ${data.urls?.length ?? 0} URL(s)`;

          navigate(`/sets/${setId}/flashcards/editor`, {
            state: {
              title: 'AI Generated Flashcards',
              description,
              privacy: 'PRIVATE',
              generatedFlashcards: flashcards,
            },
          });
        }
      } catch (error) {
        console.error('Error generating flashcards:', error);
        toast.error('Failed to generate flashcards. Please try again.');
      }
    }
  };

  const handleExamAISubmit = async (data: {
    source: 'notes' | 'files' | 'web' | 'similar';
    noteIds?: number[];
    files?: File[];
    urls?: string[];
    questionCounts: { MCQ: number; TF: number; ESS: number };
    difficulty: ExamAIDifficultyDistribution;
    language: string;
    freeText: string;
  }) => {
    try {
      let result;

      if (data.source === 'notes' && data.noteIds) {
        result = await generateExamFromNotesMutation.mutateAsync({
          setId: Number(setId),
          noteIds: data.noteIds,
          questionCounts: data.questionCounts,
          language: data.language,
          difficulty: data.difficulty,
          freeText: data.freeText,
        });
      } else if (data.source === 'files' && data.files) {
        result = await generateExamFromFilesMutation.mutateAsync({
          setId: Number(setId),
          files: data.files,
          questionCounts: data.questionCounts,
          language: data.language,
          difficulty: data.difficulty,
          freeText: data.freeText,
        });
      } else if (data.source === 'web' && data.urls?.length) {
        result = await generateExamFromWebMutation.mutateAsync({
          setId: Number(setId),
          urls: data.urls,
          questionCounts: data.questionCounts,
          language: data.language,
          difficulty: data.difficulty,
          freeText: data.freeText,
        });
      } else if (data.source === 'similar' && data.files?.length) {
        result = await generateExamFromExistingExamMutation.mutateAsync({
          setId: Number(setId),
          file: data.files[0],
          description: data.freeText?.trim() || undefined,
        });
      }

      if (!result) return;

      setIsExamAISourceModalOpen(false);

      const content = result.data?.content ?? '';
      const sourceDesc =
        data.source === 'notes'
          ? `${data.noteIds?.length ?? 0} note(s)`
          : data.source === 'similar'
            ? `sample exam (${data.files?.[0]?.name ?? 'file'})`
            : data.source === 'files'
              ? `${data.files?.length ?? 0} file(s)`
              : `${data.urls?.length ?? 0} URL(s)`;

      navigate(`/sets/${setId}/exams/editor`, {
        state: {
          title: '',
          description: `Generated from ${sourceDesc}`,
          privacy: 'PRIVATE',
          aiContent: content,
        },
      });
    } catch (error) {
      console.error('Error generating exam with AI:', error);
      toast.error('Failed to generate exam. Please try again.');
    }
  };

  const handleCreate = async (data: {
    title: string;
    description: string;
    privacy: string;
  }) => {
    switch (activeTab) {
      case 'Notes':
        try {
          await createNoteMutation.mutateAsync({
            title: data.title,
            description: data.description,
            privacy: data.privacy.toUpperCase(),
            setId: Number(setId),
          });
          setIsCreateModalOpen(false);
        } catch (error) {
          console.error('Error creating note:', error);
          toast.error('Failed to create note. Please try again.');
        }
        break;
      case 'Flashcards':
        try {
          setIsCreateModalOpen(false);
          navigate(`/sets/${setId}/flashcards/editor`, {
            state: {
              title: data.title,
              description: data.description,
              privacy: data.privacy.toUpperCase(),
            },
          });
        } catch (error) {
          console.error('Error navigating to flashcard editor:', error);
          toast.error('Failed to create flashcard. Please try again.');
        }
        break;
      case 'Exams':
        try {
          setIsCreateModalOpen(false);
          navigate(`/sets/${setId}/exams/editor`, {
            state: {
              title: data.title,
              description: data.description,
              privacy: data.privacy.toUpperCase(),
            },
          });
        } catch (error) {
          console.error('Error navigating to exam editor:', error);
          toast.error('Failed to create exam. Please try again.');
        }
        break;
      case 'Mindmaps':
      case 'Records':
        break;
      default:
        console.log('New item created:', data);
        setIsCreateModalOpen(false);
    }
  };

  const handleUpdateFlashcard = (flashcard: Flashcard) => {
    setSelectedFlashcard(flashcard);
    setIsUpdateModalOpen(true);
    setActiveTab('Flashcards');
  };

  const handleUpdate = (note: Note) => {
    setSelectedNote(note);
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (data: any) => {
    if (selectedNote) {
      try {
        const payload = {
          title: data.title,
          privacy: data.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
          description: data.description,
        };

        await updateNoteMutation.mutateAsync({
          setId: Number(setId),
          id: selectedNote.id,
          payload,
        });
        toast.success('Note updated successfully');
        setIsUpdateModalOpen(false);
        setSelectedNote(null);
      } catch (error) {
        console.error('Error updating note:', error);
        toast.error('Failed to update note. Please try again.');
      }
    }

    if (selectedFlashcard) {
      try {
        const payload = {
          title: data.title,
          privacy: data.privacy.toUpperCase() as 'PUBLIC' | 'PRIVATE',
          description: data.description,
        };

        await updateFlashcardMutation.mutateAsync({
          setId: Number(setId),
          flashcardId: selectedFlashcard.id,
          payload,
        });
        toast.success('Flashcard updated successfully');
        setIsUpdateModalOpen(false);
        setSelectedFlashcard(null);
      } catch (error) {
        console.error('Error updating flashcard:', error);
        toast.error('Failed to update flashcard. Please try again.');
      }
    }

    if (selectedExam) {
      try {
        const payload = {
          title: data.title,
          description: data.description,
          privacy: data.privacy.toUpperCase() as 'PUBLIC' | 'PRIVATE',
        };

        await updateExamMutation.mutateAsync({
          setId: Number(setId),
          examId: selectedExam.id,
          data: payload,
        });
        toast.success('Exam updated successfully');
        setIsUpdateModalOpen(false);
        setSelectedExam(null);
      } catch (error) {
        console.error('Error updating exam:', error);
        toast.error('Failed to update exam. Please try again.');
      }
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNoteMutation.mutateAsync({
        setId: Number(setId),
        noteId: id,
      });
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note. Please try again.');
    }
  };

  const handleDeleteFlashcard = async (id: number | string) => {
    try {
      await deleteFlashcardMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: id,
      });
      toast.success('Flashcard deleted successfully');
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard. Please try again.');
    }
  };

  const handleUpdateExam = (exam: ExamCardData) => {
    setSelectedExam(exam);
    setIsUpdateModalOpen(true);
    setActiveTab('Exams');
  };

  const handleDeleteExam = async (id: number | string) => {
    try {
      await deleteExamMutation.mutateAsync({
        setId: Number(setId),
        examId: id,
      });
      toast.success('Exam deleted successfully');
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam. Please try again.');
    }
  };

  const isGenerating =
    generateFlashcardsMutation.isPending ||
    generateFlashcardsFromFilesMutation.isPending ||
    generateFlashcardsFromWebMutation.isPending ||
    generateExamFromFilesMutation.isPending ||
    generateExamFromNotesMutation.isPending ||
    generateExamFromWebMutation.isPending;

  return (
    <div className='min-h-screen bg-[var(--pl-bg)] transition-[background] duration-300'>
      <HeaderSetDetails setId={setId} />

      {/* Tabs */}
      <div className='px-10 border-b border-b-[var(--pl-border)] flex gap-0.5 sticky top-0 bg-[var(--pl-bg)] z-10'>
        {tabs.map((tab) => {
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={cn(
                'px-[18px] py-[14px] flex items-center gap-2 border-t-0 border-l-0 border-r-0 border-b-2 bg-transparent cursor-pointer whitespace-nowrap transition-[color] duration-150 text-[13.5px] -mb-px',
                active
                  ? 'border-b-[var(--pl-accent)] text-[var(--pl-text)] font-semibold'
                  : 'border-b-transparent text-[var(--pl-text-muted)] font-normal',
              )}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Action Bar */}
      <div className='px-10 pt-5 flex items-center'>
        <button
          onClick={handleCreateButtonClick}
          disabled={createNoteMutation.isPending || isGenerating}
          className={cn(
            'flex items-center gap-1 px-[18px] py-[9px] bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] rounded-full font-semibold text-[13px] border-0 cursor-pointer transition-[opacity] duration-150',
            (createNoteMutation.isPending || isGenerating) &&
              'opacity-55 cursor-not-allowed',
          )}
        >
          <Plus className='size-4'/>  
          {isGenerating
            ? t('set.actions.generating')
            : createNoteMutation.isPending
              ? t('set.actions.creating')
              : t(
                  `set.actions.new${activeTab.slice(0, -1)}` as
                    | 'set.actions.newNote'
                    | 'set.actions.newFlashcard'
                    | 'set.actions.newExam'
                    | 'set.actions.newMindmap'
                    | 'set.actions.newRecord',
                  { defaultValue: t('set.actions.newItem') },
                )}
        </button>
      </div>

      {/* Content Grid */}
      <div className='px-10'>
        {activeTab === 'Notes' && (
          <NoteListPage
            setId={Number(setId)}
            onUpdate={handleUpdate}
            onDelete={(noteId) => handleDeleteNote(noteId)}
          />
        )}
        {activeTab === 'Flashcards' && (
          <FlashcardListPage
            setId={Number(setId)}
            onUpdate={handleUpdateFlashcard}
            onDelete={(flashcardId) => handleDeleteFlashcard(flashcardId)}
          />
        )}
        {activeTab === 'Mindmaps' && <MindmapListPage />}
        {activeTab === 'Exams' && (
          <ExamListPage
            setId={Number(setId)}
            onUpdate={handleUpdateExam}
            onDelete={handleDeleteExam}
          />
        )}
      </div>

      {/* Modals */}
      <CreateMethodModal
        type={activeTab.slice(0, -1)}
        isOpen={isMethodModalOpen}
        onClose={() => setIsMethodModalOpen(false)}
        onSelectManual={handleSelectManual}
        onSelectAI={handleSelectAI}
      />

      <AISourceModal
        setId={Number(setId)}
        currentPage={0}
        pageSize={6}
        type={activeTab.slice(0, -1)}
        isOpen={isAISourceModalOpen}
        onClose={() => setIsAISourceModalOpen(false)}
        onBack={handleBackFromAISource}
        onSubmit={handleAISourceSubmit}
        isLoading={
          generateFlashcardsMutation.isPending ||
          generateFlashcardsFromFilesMutation.isPending ||
          generateFlashcardsFromWebMutation.isPending
        }
      />

      <ExamAISourceModal
        setId={Number(setId)}
        isOpen={isExamAISourceModalOpen}
        onClose={() => setIsExamAISourceModalOpen(false)}
        onBack={handleBackFromAISource}
        onSubmit={handleExamAISubmit}
        isLoading={
          generateExamFromFilesMutation.isPending ||
          generateExamFromNotesMutation.isPending ||
          generateExamFromWebMutation.isPending ||
          generateExamFromExistingExamMutation.isPending
        }
      />

      <CreateNewModal
        type={activeTab.slice(0, -1)}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBack={activeTab !== 'Notes' ? handleBackFromCreate : undefined}
        onSubmit={handleCreate}
      />

      {isUpdateModalOpen &&
        (selectedNote || selectedFlashcard || selectedExam) && (
          <CreateNewModal
            type={
              selectedExam
                ? 'Exam'
                : selectedFlashcard
                  ? 'Flashcard'
                  : activeTab.slice(0, -1)
            }
            isOpen={isUpdateModalOpen}
            onClose={() => {
              setIsUpdateModalOpen(false);
              setSelectedNote(null);
              setSelectedFlashcard(null);
              setSelectedExam(null);
            }}
            onSubmit={handleUpdateSubmit}
            initialData={{
              title:
                selectedNote?.title ||
                selectedFlashcard?.title ||
                selectedExam?.title ||
                '',
              description:
                selectedNote?.description ||
                selectedFlashcard?.description ||
                selectedExam?.description ||
                '',
              privacy:
                (
                  selectedNote?.privacy ||
                  selectedFlashcard?.privacy ||
                  selectedExam?.privacy ||
                  'PUBLIC'
                )
                  .charAt(0)
                  .toUpperCase() +
                (
                  selectedNote?.privacy ||
                  selectedFlashcard?.privacy ||
                  selectedExam?.privacy ||
                  'public'
                )
                  .slice(1)
                  .toLowerCase(),
            }}
            isUpdateMode={true}
          />
        )}
    </div>
  );
}
