/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import CreateNewModal from '@/components/modals/CreateNewModal';
import type { AISubmitData } from '@/components/modals/CreateAITab';
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
} from '@/hooks/useExams';
import { useCreateNote, useDeleteNote, useUpdateNote } from '@/hooks/useNotes';
import type { ExamAIDifficultyDistribution } from '@/services/types/exam.types';

import FlashcardListPage from './components/FlashcardListPage';
import HeaderSetDetails from './components/HeaderSetDetails';
import NoteListPage from './components/NoteListPage';
import ExamListPage from './components/ExamListPage';

import type { Note } from '@/components/cards/NoteCard';
import type { Flashcard } from '@/components/cards/FlashCard';
import type { ExamCardData } from '@/components/cards/ExamCard';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ResourceFiltersBar,
  type ListCreateMethodFilter,
  type ListPrivacyFilter,
  type ListSortOption,
} from '@/components/lists/ResourceFiltersBar';

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
    Records: 'records',
  };

  const path = location.pathname.toLowerCase();
  let initialTab = 'Notes';
  if (path.includes(`/sets/${setId}/flashcards`)) initialTab = 'Flashcards';
  else if (path.includes(`/sets/${setId}/exams`)) initialTab = 'Exams';
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

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const tabs = ['Notes', 'Flashcards', 'Exams'];

  // Per-tab filter state (lifted out of list pages so the filter bar can
  // sit on the same row as the "+ New" button).
  const [notesSearch, setNotesSearch] = useState('');
  const [notesPrivacy, setNotesPrivacy] = useState<ListPrivacyFilter>('');

  const [flashcardsSearch, setFlashcardsSearch] = useState('');
  const [flashcardsPrivacy, setFlashcardsPrivacy] =
    useState<ListPrivacyFilter>('');
  const [flashcardsMethod, setFlashcardsMethod] =
    useState<ListCreateMethodFilter>('');
  const [flashcardsSort, setFlashcardsSort] =
    useState<ListSortOption>('id,DESC');

  const [examsSearch, setExamsSearch] = useState('');
  const [examsPrivacy, setExamsPrivacy] = useState<ListPrivacyFilter>('');
  const [examsMethod, setExamsMethod] = useState<ListCreateMethodFilter>('');
  const [examsSort, setExamsSort] = useState<ListSortOption>('id,DESC');

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    const slug = tabMap[tab] || tab.toLowerCase();
    navigate(`/sets/${setId}/${slug}`);
  };

  const handleCreateButtonClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleAISubmit = async (data: AISubmitData) => {
    if (activeTab === 'Flashcards') {
      try {
        let result;
        if (data.source === 'notes' && data.noteIds) {
          result = await generateFlashcardsMutation.mutateAsync({
            setId: Number(setId),
            noteIds: data.noteIds,
            language: data.language,
            freeText: data.freeText,
          });
        } else if (data.source === 'files' && data.files) {
          result = await generateFlashcardsFromFilesMutation.mutateAsync({
            setId: Number(setId),
            files: data.files,
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
            return {
              frontCard: frontCard?.trim(),
              backCard: backCard?.trim(),
            };
          });

          setIsCreateModalOpen(false);

          const description =
            data.source === 'notes'
              ? `Generated from ${data.noteIds?.length ?? 0} note(s)`
              : data.source === 'files'
                ? `Generated from ${data.files?.length ?? 0} file(s)`
                : `Generated from ${data.urls?.length ?? 0} URL(s)`;

          navigate(`/sets/${setId}/flashcards/editor`, {
            state: {
              title: data.title || 'AI Generated Flashcards',
              description,
              privacy: data.privacy,
              generatedFlashcards: flashcards,
            },
          });
        }
      } catch (error) {
        console.error('Error generating flashcards:', error);
        toast.error('Failed to generate flashcards. Please try again.');
      }
      return;
    }

    if (activeTab === 'Exams') {
      try {
        let result;
        const questionCounts = data.questionCounts ?? {
          MCQ: 0,
          TF: 0,
          ESS: 0,
        };
        const difficulty: ExamAIDifficultyDistribution = data.difficulty ?? {
          Easy: 50,
          Medium: 30,
          Hard: 20,
        };

        if (data.source === 'notes' && data.noteIds) {
          result = await generateExamFromNotesMutation.mutateAsync({
            setId: Number(setId),
            noteIds: data.noteIds,
            questionCounts,
            language: data.language,
            difficulty,
            freeText: data.freeText,
          });
        } else if (data.source === 'files' && data.files) {
          result = await generateExamFromFilesMutation.mutateAsync({
            setId: Number(setId),
            files: data.files,
            questionCounts,
            language: data.language,
            difficulty,
            freeText: data.freeText,
          });
        } else if (data.source === 'web' && data.urls?.length) {
          result = await generateExamFromWebMutation.mutateAsync({
            setId: Number(setId),
            urls: data.urls,
            questionCounts,
            language: data.language,
            difficulty,
            freeText: data.freeText,
          });
        }

        if (!result) return;

        setIsCreateModalOpen(false);

        const content = result.data?.content ?? '';
        const sourceDesc =
          data.source === 'notes'
            ? `${data.noteIds?.length ?? 0} note(s)`
            : data.source === 'files'
              ? `${data.files?.length ?? 0} file(s)`
              : `${data.urls?.length ?? 0} URL(s)`;

        navigate(`/sets/${setId}/exams/editor`, {
          state: {
            title: data.title || '',
            description: `Generated from ${sourceDesc}`,
            privacy: data.privacy,
            aiContent: content,
          },
        });
      } catch (error) {
        console.error('Error generating exam with AI:', error);
        toast.error('Failed to generate exam. Please try again.');
      }
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
    <div className='min-h-screen bg-[var(--pl-bg)] transition-[background] duration-300 pb-10'>
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

      {/* Action Bar — "+ New" + inline filters */}
      <div className='px-10 pt-5 flex items-center gap-3 flex-wrap'>
        <Button
          size='sm'
          onClick={handleCreateButtonClick}
          disabled={createNoteMutation.isPending || isGenerating}
          className={cn(
            'font-semibold gap-1',
            (createNoteMutation.isPending || isGenerating) &&
              'opacity-55 cursor-not-allowed',
          )}
        >
          <Plus className='size-4' />
          {isGenerating
            ? t('set.actions.generating')
            : createNoteMutation.isPending
              ? t('set.actions.creating')
              : t(
                  `set.actions.new${activeTab.slice(0, -1)}` as
                    | 'set.actions.newNote'
                    | 'set.actions.newFlashcard'
                    | 'set.actions.newExam',
                  { defaultValue: t('set.actions.newItem') },
                )}
        </Button>
        <div className='w-px h-5 bg-[var(--pl-border)] shrink-0 mx-0.5' />

        {activeTab === 'Notes' && (
          <ResourceFiltersBar
            className='py-0'
            searchValue={notesSearch}
            onSearchChange={setNotesSearch}
            privacy={notesPrivacy}
            onPrivacyChange={setNotesPrivacy}
          />
        )}
        {activeTab === 'Flashcards' && (
          <ResourceFiltersBar
            className='py-0'
            searchValue={flashcardsSearch}
            onSearchChange={setFlashcardsSearch}
            privacy={flashcardsPrivacy}
            onPrivacyChange={setFlashcardsPrivacy}
            createMethod={flashcardsMethod}
            onCreateMethodChange={setFlashcardsMethod}
            sort={flashcardsSort}
            onSortChange={setFlashcardsSort}
          />
        )}
        {activeTab === 'Exams' && (
          <ResourceFiltersBar
            className='py-0'
            searchValue={examsSearch}
            onSearchChange={setExamsSearch}
            privacy={examsPrivacy}
            onPrivacyChange={setExamsPrivacy}
            createMethod={examsMethod}
            onCreateMethodChange={setExamsMethod}
            sort={examsSort}
            onSortChange={setExamsSort}
          />
        )}
      </div>

      {/* Content Grid */}
      <div className='px-10 pt-4'>
        {activeTab === 'Notes' && (
          <NoteListPage
            setId={Number(setId)}
            search={notesSearch}
            privacy={notesPrivacy}
            onUpdate={handleUpdate}
            onDelete={(noteId) => handleDeleteNote(noteId)}
          />
        )}
        {activeTab === 'Flashcards' && (
          <FlashcardListPage
            setId={Number(setId)}
            search={flashcardsSearch}
            privacy={flashcardsPrivacy}
            createMethod={flashcardsMethod}
            sort={flashcardsSort}
            onUpdate={handleUpdateFlashcard}
            onDelete={(flashcardId) => handleDeleteFlashcard(flashcardId)}
          />
        )}
        {activeTab === 'Exams' && (
          <ExamListPage
            setId={Number(setId)}
            search={examsSearch}
            privacy={examsPrivacy}
            createMethod={examsMethod}
            sort={examsSort}
            onUpdate={handleUpdateExam}
            onDelete={handleDeleteExam}
          />
        )}
      </div>

      {/* Modals */}
      <CreateNewModal
        type={activeTab.slice(0, -1)}
        setId={Number(setId)}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreate}
        showAITab={activeTab === 'Flashcards' || activeTab === 'Exams'}
        onSubmitAI={handleAISubmit}
        isGenerating={
          generateFlashcardsMutation.isPending ||
          generateFlashcardsFromFilesMutation.isPending ||
          generateFlashcardsFromWebMutation.isPending ||
          generateExamFromFilesMutation.isPending ||
          generateExamFromNotesMutation.isPending ||
          generateExamFromWebMutation.isPending
        }
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
