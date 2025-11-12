import { useState } from 'react';
import { useSetData } from '@/hooks/useSets';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Checklist from '@/components/cards/CheckListCard';
import SetCard, { type Set } from '@/components/cards/SetCard';
import Header from '@/components/header/HeaderDashboard';
import { useDeleteSet, useUpdateSet } from '@/hooks/useSets';
import { type UpdateSetPayload } from '@/services/types/set.types';
import CreateNewModal from '@/components/modals/CreateNewModal';
import { useTranslation } from 'react-i18next';

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

    const calendar = [
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [1, 2, 3, 4, 5, 6, 7],
        [8, 9, 10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19, 20, 21],
        [22, 23, 24, 25, 26, 27, 28],
        [29, 30, '', '', '', '', '']
    ];

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
                <Header onSearch={(val) => console.log('Search:', val)} />

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
                        {/* <div className="grid grid-cols-2 gap-4">
                            {notes.map((note, idx) => (
                                <NoteCard key={idx} note={note} onAccess={handleAccessNote} />
                            ))}
                        </div> */}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <div className="rounded-xl p-6 shadow-sm text-center">
                            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-orange-100">
                                <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=300&h=300&fit=crop" alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <h3 className="font-semibold text-lg">Augusta</h3>
                            <p className="text-sm text-muted-foreground">augusta@wave.com</p>
                        </div>

                        {/* Calendar */}
                        <div className="rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold">Your Calendar</h3>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <button className="p-1 hover:bg-card-secondary rounded" title="Previous month">
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="font-semibold">September</span>
                                <button className="p-1 hover:bg-card-secondary rounded" title="Next month">
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                                {calendar[0].map((day, idx) => (
                                    <div key={idx} className="font-semibold text-muted-foreground py-2">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            {calendar.slice(1).map((week, weekIdx) => (
                                <div key={weekIdx} className="grid grid-cols-7 gap-1 text-center">
                                    {week.map((day, dayIdx) => (
                                        <div
                                            key={dayIdx}
                                            className={`py-2 text-sm rounded-full ${day === 15 ? 'bg-gray-900 text-white font-semibold' :
                                                day ? 'hover:bg-card-secondary cursor-pointer' : ''
                                                }`}
                                        >
                                            {day}
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <div className="mt-6 pt-4 border-t">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold">Target study time</span>
                                    <span className="text-xl font-bold">08h 30m</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
                        privacy: 'PUBLIC', // hoặc lấy từ set nếu có field này
                    }}
                />
            )}
        </div>
    );
};

export default Dashboard;