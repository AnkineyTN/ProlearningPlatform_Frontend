import { useState } from 'react';
import { Search, FileText, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from "@/components/theme/mode-toggle";
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
                <div className='flex items-start justify-between mb-6 gap-10'>
                    <div className="bg-card w-full rounded-2xl p-6 shadow-sm border border-card-secondary mb-6">
                        <div className="flex justify-between items-start">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-card-secondary rounded-lg flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-foreground" />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-foreground mb-1">Software Engineering</h1>
                                    <p className="text-sm text-muted-foreground">Comprehensive software engineering concepts and practices for modern development</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button className="p-2 bg-card hover:bg-card-secondary rounded-lg transition-colors cursor-pointer">
                                    <Pencil className="w-5 h-5 text-muted-foreground" />
                                </Button>
                                <Button className="p-2 bg-card hover:bg-card-secondary rounded-lg transition-colors cursor-pointer">
                                    <Trash2 className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4">
                        <ModeToggle />
                    </div>
                </div>

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