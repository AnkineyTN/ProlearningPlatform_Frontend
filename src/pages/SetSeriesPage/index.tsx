import { useState } from 'react';
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

interface HeaderProps {
    onSearch?: (query: string) => void;
    setId: string;
}

export default function SetSeriesPage({ onSearch, setId }: HeaderProps) {
    const [activeTab, setActiveTab] = useState('Notes');
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);

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
            // For Notes, go directly to create modal
            setIsCreateModalOpen(true);
        } else {
            // For other tabs, show method selection modal
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
        // TODO: Implement AI generation logic here
        // This would call your AI generation API with the selected source
        setIsAISourceModalOpen(false);
    };

    const handleCreate = async (data: { title: string; description: string; privacy: string }) => {
        if (activeTab === 'Notes' && setId) {
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
        } else {
            // For other tabs (Flashcards, Tests, etc.)
            console.log('New item created:', data);
            // TODO: Implement create logic for other types
            setIsCreateModalOpen(false);
        }
    };

    const handleUpdate = (note: Note) => {
        setSelectedNote(note);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async (data: any) => {
        if (!selectedNote) return;

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
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteNoteMutation.mutateAsync(id);
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header Card */}
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
                        onDelete={(noteId) => handleDelete(noteId)}
                    />
                )}
                {activeTab === 'Flashcards' && <FlashcardListPage />}
                {activeTab === 'Mindmaps' && <MindmapListPage />}
                {activeTab === 'Tests' && <TestListPage />}
                {activeTab === 'Records' && <RecordListPage />}

                {/* Method Selection Modal (for Flashcards, Tests, etc.) */}
                <CreateMethodModal
                    type={activeTab.slice(0, -1)}
                    isOpen={isMethodModalOpen}
                    onClose={() => setIsMethodModalOpen(false)}
                    onSelectManual={handleSelectManual}
                    onSelectAI={handleSelectAI}
                />

                {/* AI Source Selection Modal */}
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

                {/* Manual Create Modal */}
                <CreateNewModal
                    type={activeTab.slice(0, -1)}
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onBack={activeTab !== 'Notes' ? handleBackFromCreate : undefined}
                    onSubmit={handleCreate}
                />

                {/* Update Modal */}
                {isUpdateModalOpen && selectedNote && (
                    <CreateNewModal
                        type={activeTab.slice(0, -1)}
                        isOpen={isUpdateModalOpen}
                        onClose={() => setIsUpdateModalOpen(false)}
                        onSubmit={handleUpdateSubmit}
                        initialData={{
                            title: selectedNote.title,
                            description: selectedNote.description,
                            privacy: selectedNote.privacy.charAt(0).toUpperCase() + selectedNote.privacy.slice(1).toLowerCase(),
                        }}
                    />
                )}
            </div>
        </div>
    );
}