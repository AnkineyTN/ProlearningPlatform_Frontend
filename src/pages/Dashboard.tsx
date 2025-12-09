import { useState } from 'react';
import { useSetData } from '@/hooks/useSets';
import { ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Checklist from '@/components/cards/CheckListCard';
import SetCard, { type Set } from '@/components/cards/SetCard';
import CalendarCard from '@/components/cards/CalendarCard';
import Header from '@/components/header/HeaderDashboard';
import { useDeleteSet, useUpdateSet } from '@/hooks/useSets';
import { type UpdateSetPayload } from '@/services/types/set.types';
import CreateNewModal from '@/components/modals/CreateNewModal';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { getTimeAgo } from "@/lib/utils";

const Dashboard = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const deleteSetMutation = useDeleteSet();
    const updateSetMutation = useUpdateSet();
    const [selectedSet, setSelectedSet] = useState<Set | null>(null);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [checklistItems, setChecklistItems] = useState([
        { label: 'Study for 2000 minutes', checked: false },
        { label: 'Sleep...', checked: false },
        { label: 'Complete 2 reading exercise', checked: false },
        { label: 'Complete 2 reading exercise', checked: false }
    ]);
    const page = 0;
    const size = 4;
    const sort = [{ property: 'id', direction: 'ASC' }];

    const { data: setData } = useSetData({ page, size, sort });
    const sets: Set[] = (setData?.data.data || []).map((item: any) => ({
        id: item.id,
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
        updated_at: getTimeAgo(item.updatedAt),
        created_at: new Date(item.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        }),
    }));

    const handleDeleteSet = async (id: number) => {
        try {
            await deleteSetMutation.mutateAsync(id);
            toast.success("Set deleted successfully");
        } catch (error) {
            console.error('Error deleting set:', error);
            toast.error("Failed to delete set");
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

    const handleViewSets = () => {
        navigate("/sets");
    };

    const handleSetAccess = (setId: number) => {
        navigate(`/sets/${setId}`);
    };

    const handleViewNotes = () => {
        navigate("/notes");
    };

    // const handleAccessNote = (id: string) => {
    //     navigate(`/note/${id}`);
    // };

    const handleChecklistChange = (idx: number, checked: boolean) => {
        const newItems = [...checklistItems];
        newItems[idx].checked = checked;
        setChecklistItems(newItems);
    };
    const completionRate = Math.round(
        (checklistItems.filter(item => item.checked).length / checklistItems.length) * 100
    );
    return (
        <div className="min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <Header onSearch={(val) => console.log('Search:', val)} title={t('header.welcome')} />

                <div className="grid grid-cols-3 gap-12">
                    {/* Left Column */}
                    <div className="col-span-2 space-y-8">
                        <Checklist
                            items={checklistItems}
                            onItemChange={handleChecklistChange}
                            completionRate={completionRate}
                        />
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{t('dashboard.yourSets')}</h2>
                            <button onClick={handleViewSets} className="text-sm flex items-center gap-1 hover:underline cursor-pointer">
                                {t('dashboard.viewAll')} <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {sets.map((set: Set) => (
                                <SetCard
                                    key={set.id} set={set}
                                    onAccess={handleSetAccess}
                                    onDelete={handleDeleteSet}
                                    onUpdate={handleUpdateSet} />
                            ))}
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">{t('dashboard.recentNotes')}</h2>
                            <button onClick={handleViewNotes} className="text-sm flex items-center gap-1 hover:underline cursor-pointer">
                                {t('dashboard.viewAll')} <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Calendar */}
                        <CalendarCard />
                    </div>
                </div>
            </div>
            {/* Update Modal */}
            {selectedSet && (
                <CreateNewModal
                    isUpdateMode={true}
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
                        privacy: 'Public', // hoặc lấy từ set nếu có field này
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;