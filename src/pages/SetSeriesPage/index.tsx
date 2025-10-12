import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import HeaderSetDetails from './components/HeaderSetDetails';
import CreateNewModal from '@/components/modals/CreateNewModal';
import FlashcardListPage from './components/FlashcardListPage';
import MindmapListPage from './components/MindmapListPage';
import NoteListPage from './components/NoteListPage';
import TestListPage from './components/TestListPage';
import RecordListPage from './components/RecordListPage';

interface HeaderProps {
    onSearch?: (query: string) => void;
}

export default function SetSeriesPage({ onSearch }: HeaderProps) {
    const [activeTab, setActiveTab] = useState('Notes');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const tabs = ['Notes', 'Flashcards', 'Mindmaps', 'Tests', 'Records'];
    // const navigate = useNavigate();

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
    }

    const handleCreate = (newElement: any) => {
        console.log('New created:', newElement);
        // Xử lý tạo set mới ở đây
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
                    <Button className="bg-foreground text-background px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors" onClick={() => setIsModalOpen(true)}>
                        + Create a new {activeTab.slice(0, -1).toLowerCase()}
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
                {/* Notes Grid */}
                {activeTab === 'Notes' && <NoteListPage />}
                {activeTab === 'Flashcards' && <FlashcardListPage />}
                {activeTab === 'Mindmaps' && <MindmapListPage />}
                {activeTab === 'Tests' && <TestListPage />}
                {activeTab === 'Records' && <RecordListPage />}

                <CreateNewModal
                    type={activeTab.slice(0, -1)}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleCreate}
                />
            </div>
        </div>
    );
}