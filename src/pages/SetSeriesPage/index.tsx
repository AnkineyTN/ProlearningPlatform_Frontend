import { useState } from 'react';
import { Search, FileText, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// import { useNavigate } from 'react-router-dom';
import { ModeToggle } from "@/components/theme/mode-toggle";
import FlashcardListPage from './components/FlashcardListPage';
import MindmapListPage from './components/MindmapListPage';
import NoteListPage from './components/NoteListPage';
import TestListPage from './components/TestListPage';
import RecordListPage from './components/RecordListPage';

interface HeaderProps {
    onSearch?: (query: string) => void;
}

export default function SetSeriesPage({ onSearch }: HeaderProps) {
    const [currentPage, setCurrentPage] = useState(1);
    const [activeTab, setActiveTab] = useState('Notes');
    const tabs = ['Notes', 'Flashcards', 'Mindmaps', 'Tests', 'Records'];
    // const navigate = useNavigate();

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        // navigate(`/${tab.toLowerCase()}`);
    }

    const notes = [
        {
            id: 1,
            title: 'OOP Interview Question',
            category: '20 Sep 2025',
            preview: 'Supervised learning is a machine learning method in which an algorithm learns from...',
            time: '2 hours ago',
            date: '16 Sep 2025'
        },
        {
            id: 2,
            title: 'Stack and Queue',
            category: '15 Sep 2025',
            preview: 'Stack is a LIFO (Last In First Out) data structure, while Queue is FIFO (First In Fir...',
            time: '2 hours ago',
            date: '16 Sep 2025'
        },
        {
            id: 3,
            title: 'Supervised Learning Algo...',
            category: '01 Sep 2025',
            preview: 'Supervised learning is a machine learning method in which an algorithm learns from...',
            time: '2 hours ago',
            date: '16 Sep 2025'
        },
        {
            id: 4,
            title: 'Supervised Learning Algo...',
            category: '10 Aug 2025',
            preview: 'Supervised learning is a machine learning method in which an algorithm learns from...',
            time: '2 hours ago',
            date: '16 Sep 2025'
        },
        {
            id: 5,
            title: 'Stack and Queue',
            category: '22 Jul 2025',
            preview: 'Stack is a LIFO (Last In First Out) data structure, while Queue is FIFO (First In Fir...',
            time: '2 hours ago',
            date: '16 Sep 2025'
        },
        {
            id: 6,
            title: 'Supervised Learning Algo...',
            category: '20 Jun 2025',
            preview: 'Supervised learning is a machine learning method in which an algorithm learns from...',
            time: '2 hours ago',
            date: '16 Sep 2025'
        }
    ];

    const totalPages = 5;

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
                    <Button className="bg-foreground text-background px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors">
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
                {activeTab === 'Notes' && <NoteListPage onSearch={onSearch} />}
                {activeTab === 'Flashcards' && <FlashcardListPage onSearch={onSearch} />}
                {activeTab === 'Mindmaps' && <MindmapListPage onSearch={onSearch} />}
                {activeTab === 'Tests' && <TestListPage onSearch={onSearch} />}
                {activeTab === 'Records' && <RecordListPage onSearch={onSearch} />}
            </div>
        </div>
    );
}