import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import SetCard from '@/components/cards/SetCard';
import HeaderSet from '@/components/header/HeaderSet';
import CreateNewModal from '@/components/modals/CreateNewModal';
import { Button } from '@/components/ui/button';
import { useDeleteSet, useUpdateSet, useSetData, useCreateSet } from '@/hooks/useSets';
import { type Set } from '@/components/cards/SetCard';
import { type CreateSetPayload, type UpdateSetPayload } from '@/services/types/set.types';

const TABS = [
    { id: 'all', label: 'All', count: 16 },
    { id: 'completed', label: 'Completed', count: 5 },
    { id: 'progress', label: 'In progress', count: 11 },
] as const;

const PAGE_SIZE = 4;
const SORT_CONFIG = [{ property: 'id', direction: 'ASC' }];

const mapSetData = (items: any[]): Set[] =>
    items.map(item => ({
        id: item.id ?? '',
        title: item.title,
        code: item.code,
        progress: item.progress,
        duration: item.duration,
        flashcards: item.flashcards,
        tests: item.tests,
        audio: item.audio,
        video: item.video,
        lastUpdated: item.lastUpdated,
        date: item.date,
        description: item.description ?? '',
        numNotes: item.numNotes ?? 0,
    }));

export default function SetListPage() {
    const [activeTab, setActiveTab] = useState('all');
    // Start from 0 to match API (0-indexed)
    const [currentPage, setCurrentPage] = useState(0);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedSet, setSelectedSet] = useState<Set | null>(null);

    const navigate = useNavigate();
    const createSetMutation = useCreateSet();
    const deleteSetMutation = useDeleteSet();
    const updateSetMutation = useUpdateSet();

    // Fetch data based on currentPage state
    const { data: setData } = useSetData({
        page: currentPage,
        size: PAGE_SIZE,
        sort: SORT_CONFIG,
    });

    const sets = mapSetData(setData?.data.data || []);
    const totalPages = setData?.data.size || 1;

    // Handlers
    const handleCreateSet = async (data: any) => {
        try {
            const payload: CreateSetPayload = {
                ...data,
                privacy: data.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
            };

            await createSetMutation.mutateAsync(payload);
            setIsCreateModalOpen(false);
        } catch (error) {
            console.error('Error creating set:', error);
        }
    };

    const handleDeleteSet = async (id: number) => {
        try {
            await deleteSetMutation.mutateAsync(id);
        } catch (error) {
            console.error('Error deleting set:', error);
        }
    };

    const handleUpdateSet = (set: Set) => {
        setSelectedSet(set);
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async (data: any) => {
        if (!selectedSet) return;

        try {
            const payload: UpdateSetPayload = {
                ...data,
                privacy: data.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
            };

            await updateSetMutation.mutateAsync({
                id: selectedSet.id,
                payload,
            });
            setIsUpdateModalOpen(false);
            setSelectedSet(null);
        } catch (error) {
            console.error('Error updating set:', error);
        }
    };

    const handleSetAccess = (setId: number) => {
        navigate(`/sets/${setId}`);
    };

    const handleSearch = (query: string) => {
        console.log('Search query:', query);
    };

    const handlePageChange = (direction: 'prev' | 'next') => {
        setCurrentPage(prev =>
            direction === 'prev'
                ? Math.max(0, prev - 1)
                : Math.min(totalPages - 1, prev + 1)
        );
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-7xl mx-auto">
                <HeaderSet onSearch={handleSearch} />

                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-medium mr-4">Your Set</span>
                        {TABS.map(tab => (
                            <Button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${activeTab === tab.id
                                    ? 'bg-foreground text-background'
                                    : 'bg-card text-muted-foreground hover:bg-card-secondary'
                                    }`}
                            >
                                {tab.label} <span className="ml-1">{tab.count}</span>
                            </Button>
                        ))}
                    </div>

                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        disabled={createSetMutation.isPending}
                        className="px-4 py-2 bg-card text-foreground rounded-lg font-medium flex items-center gap-2 hover:bg-card-secondary transition-colors disabled:opacity-50"
                    >
                        <Plus className="w-5 h-5" />
                        {createSetMutation.isPending ? 'Creating...' : 'New set'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {sets.map((set) => (
                        <SetCard
                            key={set.id}
                            set={set}
                            onAccess={handleSetAccess}
                            onDelete={handleDeleteSet}
                            onUpdate={handleUpdateSet}
                        />
                    ))}
                </div>

                <div className="flex justify-center items-center gap-4">
                    <Button
                        variant="ghost"
                        onClick={() => handlePageChange('prev')}
                        disabled={currentPage === 0}
                        className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>

                    <span className="font-medium">
                        {currentPage + 1}/{totalPages}
                    </span>

                    <Button
                        variant="ghost"
                        onClick={() => handlePageChange('next')}
                        disabled={currentPage === totalPages - 1}
                        className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Create Modal */}
            <CreateNewModal
                type="Set"
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSet}
            />

            {/* Update Modal */}
            {selectedSet && (
                <CreateNewModal
                    type="Set"
                    isOpen={isUpdateModalOpen}
                    onClose={() => {
                        setIsUpdateModalOpen(false);
                        setSelectedSet(null);
                    }}
                    onSubmit={handleUpdateSubmit}
                    initialData={{
                        title: selectedSet.title,
                        description: selectedSet.description,
                        privacy: 'PUBLIC',
                    }}
                />
            )}
        </div>
    );
}