/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiErrorMessage, getApiError } from '@/lib/apiError';
import { usePersistedState } from '@/hooks/usePersistedState';
import type { AISubmitData } from '@/components/modals/CreateAITab';
import type { NoteAIGenerateData } from '@/components/modals/ai-tab/types';
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
  useGenerateExamFromExistingExam,
  useGenerateExamFromFiles,
  useGenerateExamFromNotes,
  useGenerateExamFromWeb,
} from '@/hooks/useExams';
import {
  useAIGenerateNote,
  useCreateNote,
  useDeleteNote,
  useUpdateNote,
} from '@/hooks/useNotes';
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
  const { t } = useTranslation();

  // --- Selected items for the update modal ---
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(
    null,
  );
  const [selectedExam, setSelectedExam] = useState<ExamCardData | null>(null);

  // --- Modal visibility ---
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isUploadNoteModalOpen, setIsUploadNoteModalOpen] = useState(false);

  // --- Per-tab filter state ---
  // Sort/privacy/method selections persist per-Set in localStorage so a
  // refresh (or revisiting the set) keeps the user's chosen view.
  const [notesSearch, setNotesSearch] = useState('');
  const [notesPrivacy, setNotesPrivacy] = usePersistedState<ListPrivacyFilter>(
    `set-${setId}-notes-privacy`,
    '',
  );
  const [notesSort, setNotesSort] = usePersistedState<ListSortOption>(
    `set-${setId}-notes-sort`,
    'id,DESC',
  );

  const [flashcardsSearch, setFlashcardsSearch] = useState('');
  const [flashcardsPrivacy, setFlashcardsPrivacy] =
    usePersistedState<ListPrivacyFilter>(
      `set-${setId}-flashcards-privacy`,
      '',
    );
  const [flashcardsMethod, setFlashcardsMethod] =
    usePersistedState<ListCreateMethodFilter>(
      `set-${setId}-flashcards-method`,
      '',
    );
  const [flashcardsSort, setFlashcardsSort] =
    usePersistedState<ListSortOption>(
      `set-${setId}-flashcards-sort`,
      'id,DESC',
    );

  const [examsSearch, setExamsSearch] = useState('');
  const [examsPrivacy, setExamsPrivacy] = usePersistedState<ListPrivacyFilter>(
    `set-${setId}-exams-privacy`,
    '',
  );
  const [examsMethod, setExamsMethod] = usePersistedState<ListCreateMethodFilter>(
    `set-${setId}-exams-method`,
    '',
  );
  const [examsSort, setExamsSort] = usePersistedState<ListSortOption>(
    `set-${setId}-exams-sort`,
    'id,DESC',
  );

  // --- Mutations ---
  const updateFlashcardMutation = useUpdateFlashcard();
  const deleteFlashcardMutation = useDeleteFlashcard();
  const deleteExamMutation = useDeleteExam();
  const updateExamMutation = useUpdateExam();
  const createNoteMutation = useCreateNote();
  const aiGenerateNoteMutation = useAIGenerateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const generateFlashcardsMutation = useGenerateFlashcardsFromNotes();
  const generateFlashcardsFromFilesMutation = useGenerateFlashcardsFromFiles();
  const generateFlashcardsFromWebMutation = useGenerateFlashcardsFromWeb();
  const generateExamFromFilesMutation = useGenerateExamFromFiles();
  const generateExamFromNotesMutation = useGenerateExamFromNotes();
  const generateExamFromWebMutation = useGenerateExamFromWeb();
  const generateExamFromExistingExamMutation = useGenerateExamFromExistingExam();

  // --- Computed flags ---
  const isGenerating =
    generateFlashcardsMutation.isPending ||
    generateFlashcardsFromFilesMutation.isPending ||
    generateFlashcardsFromWebMutation.isPending ||
    generateExamFromFilesMutation.isPending ||
    generateExamFromNotesMutation.isPending ||
    generateExamFromWebMutation.isPending ||
    generateExamFromExistingExamMutation.isPending ||
    aiGenerateNoteMutation.isPending;

  const isCreatingNote = createNoteMutation.isPending;

  // --- Handlers ---

  const handleCreateButtonClick = () => {
    setIsCreateModalOpen(true);
  };

  const handleNoteAISubmit = async (data: NoteAIGenerateData) => {
    try {
      const result = await aiGenerateNoteMutation.mutateAsync({
        setId: Number(setId),
        data: {
          topic: data.topic,
          description: data.description,
          reference_links: data.referenceLinks,
          language: data.language as 'English' | 'Vietnamese',
          privacy: data.privacy,
        },
      });

      const noteId = result.data?.data?.noteId;
      setIsCreateModalOpen(false);

      if (noteId) {
        toast.success(t('set.handlers.noteGenerated'));
        navigate(`/sets/${setId}/notes/${noteId}`);
      }
    } catch (error) {
      console.error('Error generating note with AI:', error);
      toast.error(apiErrorMessage(error, t('set.handlers.generateNoteError')));
    }
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
              ? t('set.handlers.generatedFromNotes', { count: data.notes?.length ?? 0 })
              : data.source === 'files'
                ? t('set.handlers.generatedFromFiles', { count: data.files?.length ?? 0 })
                : t('set.handlers.generatedFromUrls', { count: data.urls?.length ?? 0 }));

          navigate(`/sets/${setId}/flashcards/editor`, {
            state: {
              title:
                data.title || result.data.title || t('set.handlers.aiFlashcardsTitle'),
              description,
              privacy: data.privacy,
              generatedFlashcards: flashcards,
            },
          });
        }
      } catch (error) {
        console.error('Error generating flashcards:', error);
        toast.error(
          apiErrorMessage(error, t('set.handlers.generateFlashcardsError')),
        );
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
        } else if (data.source === 'existing-exam' && data.files?.[0]) {
          result = await generateExamFromExistingExamMutation.mutateAsync({
            setId: Number(setId),
            file: data.files[0],
            description: data.freeText,
          });
        }

        if (!result) return;

        setIsCreateModalOpen(false);

        const content = result.data?.content ?? '';

        navigate(`/sets/${setId}/exams/editor`, {
          state: {
            title: data.title || result.data?.title || '',
            description:
              result.data?.description ||
              (data.source === 'notes'
                ? t('set.handlers.generatedFromNotes', { count: data.notes?.length ?? 0 })
                : data.source === 'files'
                  ? t('set.handlers.generatedFromFiles', { count: data.files?.length ?? 0 })
                  : data.source === 'existing-exam'
                    ? t('set.handlers.generatedFromExistingExam')
                    : t('set.handlers.generatedFromUrls', { count: data.urls?.length ?? 0 })),
            privacy: data.privacy,
            duration: result.data?.duration,
            aiContent: content,
          },
        });
      } catch (error) {
        console.error('Error generating exam with AI:', error);
        toast.error(apiErrorMessage(error, t('set.handlers.generateExamError')));
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
          if (getApiError(error).status === 404) {
            toast.error(t('set.handlers.setNotFound'));
            setIsCreateModalOpen(false);
            navigate('/sets');
            return;
          }
          toast.error(apiErrorMessage(error, t('set.handlers.createNoteError')));
          throw error;
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
          toast.error(t('set.handlers.createFlashcardError'));
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
          toast.error(t('set.handlers.createExamError'));
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
        toast.success(t('set.handlers.noteUpdated'));
        setIsUpdateModalOpen(false);
        setSelectedNote(null);
      } catch (error) {
        console.error('Error updating note:', error);
        toast.error(apiErrorMessage(error, t('set.handlers.updateNoteError')));
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
        toast.success(t('set.handlers.flashcardUpdated'));
        setIsUpdateModalOpen(false);
        setSelectedFlashcard(null);
      } catch (error) {
        console.error('Error updating flashcard:', error);
        toast.error(
          apiErrorMessage(error, t('set.handlers.updateFlashcardError')),
        );
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
        toast.success(t('set.handlers.examUpdated'));
        setIsUpdateModalOpen(false);
        setSelectedExam(null);
      } catch (error) {
        console.error('Error updating exam:', error);
        toast.error(apiErrorMessage(error, t('set.handlers.updateExamError')));
      }
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNoteMutation.mutateAsync({
        setId: Number(setId),
        noteId: id,
      });
      toast.success(t('set.handlers.noteDeleted'));
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error(apiErrorMessage(error, t('set.handlers.deleteNoteError')));
    }
  };

  const handleDeleteFlashcard = async (id: number | string) => {
    try {
      await deleteFlashcardMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: id,
      });
      toast.success(t('set.handlers.flashcardDeleted'));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error(apiErrorMessage(error, t('set.handlers.deleteFlashcardError')));
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
      toast.success(t('set.handlers.examDeleted'));
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error(apiErrorMessage(error, t('set.handlers.deleteExamError')));
    }
  };

  const clearNotesFilters = () => {
    setNotesSearch('');
    setNotesPrivacy('');
    setNotesSort('id,DESC');
  };

  const clearFlashcardsFilters = () => {
    setFlashcardsSearch('');
    setFlashcardsPrivacy('');
    setFlashcardsMethod('');
    setFlashcardsSort('id,DESC');
  };

  const clearExamsFilters = () => {
    setExamsSearch('');
    setExamsPrivacy('');
    setExamsMethod('');
    setExamsSort('id,DESC');
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
    isUploadNoteModalOpen,
    setIsUploadNoteModalOpen,

    // Selected items
    selectedNote,
    selectedFlashcard,
    selectedExam,

    // Filter state — Notes
    notesSearch,
    setNotesSearch,
    notesPrivacy,
    setNotesPrivacy,
    notesSort,
    setNotesSort,

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
    handleNoteAISubmit,
    handleCreate,
    handleUpdate,
    handleUpdateFlashcard,
    handleUpdateSubmit,
    handleDeleteNote,
    handleDeleteFlashcard,
    handleUpdateExam,
    handleDeleteExam,
    handleCloseUpdateModal,
    clearNotesFilters,
    clearFlashcardsFilters,
    clearExamsFilters,
  };
}
