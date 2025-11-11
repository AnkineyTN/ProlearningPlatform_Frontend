import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Thêm import này
import { useCreateNote, useDeleteNote, useUpdateNote } from '@/hooks/useNotes';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HeaderSetDetails from './components/HeaderSetDetails';
import CreateNewModal from '@/components/modals/CreateNewModal';
import CreateMethodModal from '@/components/modals/CreateMethodModal';
import AISourceModal from '@/components/modals/AISourceModal';
import FlashcardListPage from './components/FlashcardListPage';
import MindmapListPage from './components/MindmapListPage';
import NoteListPage from './components/NoteListPage';
import TestListPage from './components/TestListPage';
import RecordListPage from './components/RecordListPage';
import type { Note } from '@/components/cards/NoteCard';
import { useUpdateFlashcard, useDeleteFlashcard } from '@/hooks/useFlashcards';
import type { Flashcard } from '@/components/cards/FlashCard';

interface HeaderProps {
    onSearch?: (query: string) => void;
    setId: string;
}

export default function SetSeriesPage({ onSearch, setId }: HeaderProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('Notes');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [selectedFlashcard, setSelectedFlashcard] = useState<Flashcard | null>(null);
    const updateFlashcardMutation = useUpdateFlashcard();
    const deleteFlashcardMutation = useDeleteFlashcard();

    // Modal states
    const [isMethodModalOpen, setIsMethodModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAISourceModalOpen, setIsAISourceModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

    const tabs = ['Notes', 'Flashcards', 'Mindmaps', 'Tests', 'Records'];

    const createNoteMutation = useCreateNote();
    const updateNoteMutation = useUpdateNote();
    const deleteNoteMutation = useDeleteNote();

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    };

    const handleCreateButtonClick = () => {
        if (activeTab === 'Notes') {
            setIsCreateModalOpen(true);
        } else {
            setIsMethodModalOpen(true);
        }
    };

    const handleSelectManual = () => {
        setIsCreateModalOpen(true);
    };

    const handleSelectAI = () => {
        setIsAISourceModalOpen(true);
    };

    const handleBackFromCreate = () => {
        setIsCreateModalOpen(false);
        if (activeTab !== 'Notes') {
            setIsMethodModalOpen(true);
        }
    };

    const handleBackFromAISource = () => {
        setIsAISourceModalOpen(false);
        setIsMethodModalOpen(true);
    };

    const handleAISourceSubmit = async (data: { source: 'notes' | 'files'; selectedItems: any[] }) => {
        console.log('AI Generation with:', data);
        setIsAISourceModalOpen(false);
    };

    const handleCreate = async (data: { title: string; description: string; privacy: string }) => {
        switch (activeTab) {
            case 'Notes':
                try {
                    await createNoteMutation.mutateAsync({
                        title: data.title,
                        description: data.description,
                        privacy: data.privacy.toUpperCase(),
                        setId: Number(setId)
                    });
                    setIsCreateModalOpen(false);
                } catch (error) {
                    console.error('Error creating note:', error);
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
                        }
                    });
                } catch (error) {
                    console.error('Error navigating to flashcard editor:', error);
                }
                break;
            case 'Mindmaps':
            case 'Tests':
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
                    id: selectedNote.id,
                    payload
                });
                setIsUpdateModalOpen(false);
                setSelectedNote(null);
            } catch (error) {
                console.error('Error updating note:', error);
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
                    payload
                });
                setIsUpdateModalOpen(false);
                setSelectedFlashcard(null);
            } catch (error) {
                console.error('Error updating flashcard:', error);
            }
        }
    };

    const handleDeleteNote = async (id: number) => {
        try {
            await deleteNoteMutation.mutateAsync(id);
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleDeleteFlashcard = async (id: number | string) => {
        try {
            await deleteFlashcardMutation.mutateAsync({ setId: Number(setId), flashcardId: id });
        } catch (error) {
            console.error('Error deleting flashcard:', error);
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                <HeaderSetDetails />

                {/* Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {tabs.map((tab) => (
                        <Button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={`cursor-pointer px-6 py-2 rounded-full text-foreground text-sm border border-ring font-medium transition-colors whitespace-nowrap ${activeTab === tab
                                ? 'border-blue-500 bg-card-selected hover:bg-muted'
                                : 'border-ring bg-card hover:bg-secondary'
                                }`}
                        >
                            {tab}
                        </Button>
                    ))}
                </div>

                {/* Action Bar */}
                <div className="flex justify-between items-center mb-6">
                    <Button
                        className="bg-foreground text-background px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors disabled:opacity-50"
                        onClick={handleCreateButtonClick}
                        disabled={createNoteMutation.isPending}
                    >
                        {createNoteMutation.isPending
                            ? 'Creating...'
                            : `+ Create a new ${activeTab.slice(0, -1).toLowerCase()}`
                        }
                    </Button>
                    <div className="relative">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search..."
                                onChange={(e) => onSearch?.(e.target.value)}
                                className="bg-card pl-10 pr-4 py-2 w-80 rounded-full border border-muted-foreground"
                            />
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
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
                {activeTab === 'Tests' && <TestListPage />}
                {activeTab === 'Records' && <RecordListPage />}

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
                />

                <CreateNewModal
                    type={activeTab.slice(0, -1)}
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onBack={activeTab !== 'Notes' ? handleBackFromCreate : undefined}
                    onSubmit={handleCreate}
                />

                {isUpdateModalOpen && (selectedNote || selectedFlashcard) && (
                    <CreateNewModal
                        type={activeTab.slice(0, -1)}
                        isOpen={isUpdateModalOpen}
                        onClose={() => {
                            setIsUpdateModalOpen(false);
                            setSelectedNote(null);
                            setSelectedFlashcard(null);
                        }}
                        onSubmit={handleUpdateSubmit}
                        initialData={{
                            title: selectedNote?.title || selectedFlashcard?.title || '',
                            description: selectedNote?.description || selectedFlashcard?.description || '',
                            privacy: (selectedNote?.privacy || selectedFlashcard?.privacy || 'PUBLIC')
                                .charAt(0).toUpperCase() +
                                (selectedNote?.privacy || selectedFlashcard?.privacy || 'public')
                                    .slice(1).toLowerCase(),
                        }}
                    />
                )}
            </div>
        </div>
    );
}