/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
import type { Note } from '@/components/cards/NoteCard';
import type { Flashcard } from '@/components/cards/FlashCard';
import type { ExamCardData } from '@/components/cards/ExamCard';
import type {
  ListCreateMethodFilter,
  ListPrivacyFilter,
  ListSortOption,
} from '@/components/lists/ResourceFiltersBar';

interface UseSetSeriesHandlersParams {
  setId: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function useSetSeriesHandlers({
  setId,
  activeTab,
  setActiveTab,
}: UseSetSeriesHandlersParams) {
  const navigate = useNavigate();

  // --- Selected items for the update modal ---
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(
    null,
  );
  const [selectedExam, setSelectedExam] = useState<ExamCardData | null>(null);

  // --- Modal visibility ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // --- Per-tab filter state ---
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

  // --- Mutations ---
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

  // --- Computed flags ---
  const isGenerating =
    generateFlashcardsMutation.isPending ||
    generateFlashcardsFromFilesMutation.isPending ||
    generateFlashcardsFromWebMutation.isPending ||
    generateExamFromFilesMutation.isPending ||
    generateExamFromNotesMutation.isPending ||
    generateExamFromWebMutation.isPending;

  const isCreatingNote = createNoteMutation.isPending;

  // --- Handlers ---

  const handleCreateButtonClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleAISubmit = async (data: AISubmitData) => {
    if (activeTab === 'Flashcards') {
      try {
        let result;
        if (data.source === 'notes' && data.notes) {
          result = await generateFlashcardsMutation.mutateAsync({
            setId: Number(setId),
            notes: data.notes,
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
            result.data.description ||
            (data.source === 'notes'
              ? `Generated from ${data.notes?.length ?? 0} note(s)`
              : data.source === 'files'
                ? `Generated from ${data.files?.length ?? 0} file(s)`
                : `Generated from ${data.urls?.length ?? 0} URL(s)`);

          navigate(`/sets/${setId}/flashcards/editor`, {
            state: {
              title:
                data.title || result.data.title || 'AI Generated Flashcards',
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

        if (data.source === 'notes' && data.notes) {
          result = await generateExamFromNotesMutation.mutateAsync({
            setId: Number(setId),
            notes: data.notes,
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
            ? `${data.notes?.length ?? 0} note(s)`
            : data.source === 'files'
              ? `${data.files?.length ?? 0} file(s)`
              : `${data.urls?.length ?? 0} URL(s)`;

        navigate(`/sets/${setId}/exams/editor`, {
          state: {
            title: data.title || result.data?.title || '',
            description:
              result.data?.description || `Generated from ${sourceDesc}`,
            privacy: data.privacy,
            duration: result.data?.duration,
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

  const handleCloseUpdateModal = () => {
    setIsUpdateModalOpen(false);
    setSelectedNote(null);
    setSelectedFlashcard(null);
    setSelectedExam(null);
  };

  return {
    // Modal state
    isCreateModalOpen,
    setIsCreateModalOpen,
    isUpdateModalOpen,

    // Selected items
    selectedNote,
    selectedFlashcard,
    selectedExam,

    // Filter state — Notes
    notesSearch,
    setNotesSearch,
    notesPrivacy,
    setNotesPrivacy,

    // Filter state — Flashcards
    flashcardsSearch,
    setFlashcardsSearch,
    flashcardsPrivacy,
    setFlashcardsPrivacy,
    flashcardsMethod,
    setFlashcardsMethod,
    flashcardsSort,
    setFlashcardsSort,

    // Filter state — Exams
    examsSearch,
    setExamsSearch,
    examsPrivacy,
    setExamsPrivacy,
    examsMethod,
    setExamsMethod,
    examsSort,
    setExamsSort,

    // Computed flags
    isGenerating,
    isCreatingNote,

    // Handlers
    handleCreateButtonClick,
    handleAISubmit,
    handleCreate,
    handleUpdate,
    handleUpdateFlashcard,
    handleUpdateSubmit,
    handleDeleteNote,
    handleDeleteFlashcard,
    handleUpdateExam,
    handleDeleteExam,
    handleCloseUpdateModal,
  };
}
