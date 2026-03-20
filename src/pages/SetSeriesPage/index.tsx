/* eslint-disable @typescript-eslint/no-explicit-any */
import { Search } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import AISourceModal from "@/components/modals/AISourceModal";
import ExamAISourceModal from "@/components/modals/ExamAISourceModal";
import CreateMethodModal from "@/components/modals/CreateMethodModal";
import CreateNewModal from "@/components/modals/CreateNewModal";
import DeleteConfirmDialog from "@/components/modals/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeleteFlashcard,
  useGenerateFlashcardsFromFiles,
  useGenerateFlashcardsFromNotes,
  useUpdateFlashcard,
} from "@/hooks/useFlashcards";
import { useDeleteExam, useUpdateExam, useGenerateExamFromFiles, useGenerateExamFromNotes } from "@/hooks/useExams";
import { useCreateNote, useDeleteNote, useUpdateNote } from "@/hooks/useNotes";
import { useDeleteSet } from "@/hooks/useSets";

import FlashcardListPage from "./components/FlashcardListPage";
import HeaderSetDetails from "./components/HeaderSetDetails";
import MindmapListPage from "./components/MindmapListPage";
import NoteListPage from "./components/NoteListPage";
import RecordListPage from "./components/RecordListPage";
import ExamListPage from "./components/ExamListPage";

import type { Note } from "@/components/cards/NoteCard";
import type { Flashcard } from "@/components/cards/FlashCard";
import type { ExamCardData } from "@/components/cards/ExamCard";
interface HeaderProps {
  onSearch?: (query: string) => void;
  setId: string;
}

export default function SetSeriesPage({ onSearch, setId }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Map UI tab labels to route slugs
  const tabMap: Record<string, string> = {
    Notes: 'notes',
    Flashcards: 'flashcards',
    Exams: 'exams',
    Mindmaps: 'mindmaps',
    Records: 'records',
  };

  // Determine initial tab from current pathname (so route and UI stay in sync)
  const path = location.pathname.toLowerCase();
  let initialTab = "Notes";
  if (path.includes(`/sets/${setId}/flashcards`)) initialTab = "Flashcards";
  else if (path.includes(`/sets/${setId}/exams`)) initialTab = "Exams";
  else if (path.includes(`/sets/${setId}/mindmaps`)) initialTab = "Mindmaps";
  else if (path.includes(`/sets/${setId}/records`)) initialTab = "Records";
  else if (path.includes(`/sets/${setId}/notes`)) initialTab = "Notes";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(
    null,
  );
  const [selectedExam, setSelectedExam] = useState<ExamCardData | null>(null);

  // Mutations
  const updateFlashcardMutation = useUpdateFlashcard();
  const deleteFlashcardMutation = useDeleteFlashcard();
  const deleteExamMutation = useDeleteExam();
  const updateExamMutation = useUpdateExam();
  const deleteSetMutation = useDeleteSet();
  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();
  const generateFlashcardsMutation = useGenerateFlashcardsFromNotes();
  const generateFlashcardsFromFilesMutation = useGenerateFlashcardsFromFiles();
  const generateExamFromFilesMutation = useGenerateExamFromFiles();
  const generateExamFromNotesMutation = useGenerateExamFromNotes();

  // Modal states
  const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAISourceModalOpen, setIsAISourceModalOpen] = useState(false);
  const [isExamAISourceModalOpen, setIsExamAISourceModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const tabs = ['Notes', 'Flashcards', 'Exams', 'Mindmaps', 'Records'];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    const slug = tabMap[tab] || tab.toLowerCase();
    navigate(`/sets/${setId}/${slug}`);
  };

  const handleCreateButtonClick = () => {
    if (activeTab === "Notes") {
      setIsCreateModalOpen(true);
    } else {
      setIsMethodModalOpen(true);
    }
  };

  const handleSelectManual = () => {
    setIsCreateModalOpen(true);
  };

  const handleSelectAI = () => {
    if (activeTab === "Exams") {
      setIsExamAISourceModalOpen(true);
    } else {
      setIsAISourceModalOpen(true);
    }
  };

  const handleBackFromCreate = () => {
    setIsCreateModalOpen(false);
    if (activeTab !== "Notes") {
      setIsMethodModalOpen(true);
    }
  };

  const handleBackFromAISource = () => {
    setIsAISourceModalOpen(false);
    setIsExamAISourceModalOpen(false);
    setIsMethodModalOpen(true);
  };

  const handleAISourceSubmit = async (data: {
    source: "notes" | "files";
    selectedItems: unknown[];
  }) => {
    if (activeTab === "Flashcards") {
      try {
        let result;

        if (data.source === "notes") {
          // Call the API to generate flashcards from notes
          result = await generateFlashcardsMutation.mutateAsync({
            setId: Number(setId),
            noteIds: data.selectedItems as number[],
          });
        } else if (data.source === "files") {
          // Call the API to generate flashcards from files
          result = await generateFlashcardsFromFilesMutation.mutateAsync({
            setId: Number(setId),
            files: data.selectedItems as File[],
          });
        }

        if (result) {
          // Parse the content string to extract flashcards
          const flashcardsContent = result.data.content;
          const flashcards = flashcardsContent.split(";").map((card) => {
            const [frontCard, backCard] = card.split("|");
            return { frontCard: frontCard?.trim(), backCard: backCard?.trim() };
          });

          // Close the modal
          setIsAISourceModalOpen(false);

          // Navigate to editor with generated flashcards
          navigate(`/sets/${setId}/flashcards/editor`, {
            state: {
              title: "AI Generated Flashcards",
              description:
                data.source === "notes"
                  ? `Generated from ${data.selectedItems.length} note(s)`
                  : `Generated from ${data.selectedItems.length} file(s)`,
              privacy: "PRIVATE",
              generatedFlashcards: flashcards,
            },
          });
        }
      } catch (error) {
        console.error("Error generating flashcards:", error);
        toast.error("Failed to generate flashcards. Please try again.");
        // You might want to show an error toast here
      }
    }
  };

  const handleExamAISubmit = async (data: {
    source: "notes" | "files";
    noteIds?: number[];
    files?: File[];
    questionCounts: { MCQ: number; TF: number; ESS: number };
    language: string;
  }) => {
    try {
      let result;

      if (data.source === "notes" && data.noteIds) {
        result = await generateExamFromNotesMutation.mutateAsync({
          setId: Number(setId),
          noteIds: data.noteIds,
          questionCounts: data.questionCounts,
          language: data.language,
        });
      } else if (data.source === "files" && data.files) {
        result = await generateExamFromFilesMutation.mutateAsync({
          setId: Number(setId),
          files: data.files,
          questionCounts: data.questionCounts,
          language: data.language,
        });
      }

      if (!result) return;

      setIsExamAISourceModalOpen(false);

      const content = result.data?.data?.content ?? "";
      const sourceDesc =
        data.source === "notes"
          ? `${data.noteIds?.length ?? 0} note(s)`
          : `${data.files?.length ?? 0} file(s)`;

      navigate(`/sets/${setId}/exams/editor`, {
        state: {
          title: "",
          description: `Generated from ${sourceDesc}`,
          privacy: "PRIVATE",
          aiContent: content,
        },
      });
    } catch (error) {
      console.error("Error generating exam with AI:", error);
      toast.error("Failed to generate exam. Please try again.");
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
    setActiveTab("Flashcards");
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
          privacy: data.privacy === "PUBLIC" ? "PUBLIC" : "PRIVATE",
          description: data.description,
        };

        await updateNoteMutation.mutateAsync({
          id: selectedNote.id,
          payload,
        });
        toast.success("Note updated successfully");
        setIsUpdateModalOpen(false);
        setSelectedNote(null);
      } catch (error) {
        console.error("Error updating note:", error);
        toast.error("Failed to update note. Please try again.");
      }
    }

    if (selectedFlashcard) {
      try {
        const payload = {
          title: data.title,
          privacy: data.privacy.toUpperCase() as "PUBLIC" | "PRIVATE",
          description: data.description,
        };

        await updateFlashcardMutation.mutateAsync({
          setId: Number(setId),
          flashcardId: selectedFlashcard.id,
          payload,
        });
        toast.success("Flashcard updated successfully");
        setIsUpdateModalOpen(false);
        setSelectedFlashcard(null);
      } catch (error) {
        console.error("Error updating flashcard:", error);
        toast.error("Failed to update flashcard. Please try again.");
      }
    }

    if (selectedExam) {
      try {
        const payload = {
          title: data.title,
          description: data.description,
          privacy: data.privacy.toUpperCase() as "PUBLIC" | "PRIVATE",
        };

        await updateExamMutation.mutateAsync({
          setId: Number(setId),
          examId: selectedExam.id,
          data: payload,
        });
        toast.success("Exam updated successfully");
        setIsUpdateModalOpen(false);
        setSelectedExam(null);
      } catch (error) {
        console.error("Error updating exam:", error);
        toast.error("Failed to update exam. Please try again.");
      }
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await deleteNoteMutation.mutateAsync(id);
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      toast.error("Failed to delete note. Please try again.");
    }
  };

  const handleDeleteFlashcard = async (id: number | string) => {
    try {
      await deleteFlashcardMutation.mutateAsync({
        setId: Number(setId),
        flashcardId: id,
      });
      toast.success("Flashcard deleted successfully");
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Failed to delete flashcard. Please try again.");
    }
  };

  const handleUpdateExam = (exam: ExamCardData) => {
    setSelectedExam(exam);
    setIsUpdateModalOpen(true);
    setActiveTab("Exams");
  };

  const handleDeleteExam = async (id: number | string) => {
    try {
      await deleteExamMutation.mutateAsync({
        setId: Number(setId),
        examId: id,
      });
      toast.success("Exam deleted successfully");
    } catch (error) {
      console.error("Error deleting exam:", error);
      toast.error("Failed to delete exam. Please try again.");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSetMutation.mutateAsync(Number(setId));
      setShowDeleteDialog(false);
      navigate("/sets");
    } catch (error) {
      console.error("Error deleting set:", error);
      toast.error("Failed to delete set. Please try again.");
    }
  };

  return (
    <div className='min-h-screen p-6'>
      <div className='max-w-7xl mx-auto'>
        <HeaderSetDetails onDelete={handleDeleteClick} />

        {/* Tabs */}
        <div className='flex gap-2 mb-6 overflow-x-auto'>
          {tabs.map((tab) => (
            <Button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`cursor-pointer px-6 py-2 rounded-full text-foreground text-sm border border-ring font-medium transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "font-semibold text-text-pinked border-pink-500 bg-bg-pinked hover:bg-bg-pinked-selected"
                  : "border-ring bg-card hover:bg-card-secondary"
              }`}
            >
              {tab}
            </Button>
          ))}
        </div>

        {/* Action Bar */}
        <div className='flex justify-between items-center mb-6'>
          <Button
            className='bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-50'
            onClick={handleCreateButtonClick}
            disabled={
              createNoteMutation.isPending ||
              generateFlashcardsMutation.isPending ||
              generateFlashcardsFromFilesMutation.isPending ||
              generateExamFromFilesMutation.isPending ||
              generateExamFromNotesMutation.isPending
            }
          >
            {generateFlashcardsMutation.isPending ||
            generateFlashcardsFromFilesMutation.isPending ||
            generateExamFromFilesMutation.isPending ||
            generateExamFromNotesMutation.isPending
              ? "Generating with AI..."
              : createNoteMutation.isPending
                ? "Creating..."
                : `+ Create a new ${activeTab.slice(0, -1).toLowerCase()}`}
          </Button>
          <div className='relative'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
              <Input
                type='text'
                placeholder='Search...'
                onChange={(e) => onSearch?.(e.target.value)}
                className='bg-card pl-10 pr-4 py-2 w-80 rounded-full border border-muted-foreground'
              />
            </div>
          </div>
        </div>

        {/* Content Grid */}
        {activeTab === "Notes" && (
          <NoteListPage
            setId={Number(setId)}
            onUpdate={handleUpdate}
            onDelete={(noteId) => handleDeleteNote(noteId)}
          />
        )}
        {activeTab === "Flashcards" && (
          <FlashcardListPage
            setId={Number(setId)}
            onUpdate={handleUpdateFlashcard}
            onDelete={(flashcardId) => handleDeleteFlashcard(flashcardId)}
          />
        )}
        {activeTab === "Mindmaps" && <MindmapListPage />}
        {activeTab === "Exams" && (
          <ExamListPage
            setId={Number(setId)}
            onUpdate={handleUpdateExam}
            onDelete={handleDeleteExam}
          />
        )}
        {activeTab === "Records" && <RecordListPage />}

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
            generateFlashcardsFromFilesMutation.isPending
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
            generateExamFromNotesMutation.isPending
          }
        />

        <CreateNewModal
          type={activeTab.slice(0, -1)}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onBack={activeTab !== "Notes" ? handleBackFromCreate : undefined}
          onSubmit={handleCreate}
        />

        {isUpdateModalOpen &&
          (selectedNote || selectedFlashcard || selectedExam) && (
            <CreateNewModal
              type={
                selectedExam
                  ? "Exam"
                  : selectedFlashcard
                    ? "Flashcard"
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
                  "",
                description:
                  selectedNote?.description ||
                  selectedFlashcard?.description ||
                  selectedExam?.description ||
                  "",
                privacy:
                  (
                    selectedNote?.privacy ||
                    selectedFlashcard?.privacy ||
                    selectedExam?.privacy ||
                    "PUBLIC"
                  )
                    .charAt(0)
                    .toUpperCase() +
                  (
                    selectedNote?.privacy ||
                    selectedFlashcard?.privacy ||
                    selectedExam?.privacy ||
                    "public"
                  )
                    .slice(1)
                    .toLowerCase(),
              }}
              isUpdateMode={true}
            />
          )}
        <DeleteConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
          title={t("modal.deleteConfirmationTitle")}
          itemName={`"Software Engineering"`}
        />
      </div>
    </div>
  );
}
