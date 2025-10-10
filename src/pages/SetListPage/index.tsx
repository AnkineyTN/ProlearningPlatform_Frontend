import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import SetCard from '@/components/cards/SetCard';
import HeaderSet from '@/components/header/HeaderSet';
import CreateNewModal from '@/components/modals/CreateNewModal';
import { Button } from '@/components/ui/button';

export default function SetListPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const sets = [
        {
            title: "Machine Learning Cơ bản",
            code: "CS101",
            instructor: "tbc by 1 x 2025",
            progress: 85,
            duration: "5 hours",
            flashcards: 3,
            tests: 2,
            audio: "4",
            video: "8 tài liệu",
            lastUpdated: "2 hours ago",
            date: "16 Sep 2025"
        },
        {
            title: "Machine Learning Cơ bản",
            code: "CS102",
            instructor: "tbc by 12 x 2025",
            progress: 85,
            duration: "5 hours",
            flashcards: 3,
            tests: 2,
            audio: "5",
            video: "4 tài liệu",
            lastUpdated: "2 hours ago",
            date: "16 Sep 2025"
        },
        {
            title: "Machine Learning Cơ bản",
            code: "CS101",
            instructor: "tbc by 1 x 2025",
            progress: 95,
            duration: "5 hours",
            flashcards: 3,
            tests: 2,
            audio: "6",
            video: "18 tài liệu",
            lastUpdated: "2 hours ago",
            date: "16 Sep 2025"
        },
        {
            title: "Machine Learning Cơ bản",
            code: "CS102",
            instructor: "tbc by 12 x 2025",
            progress: 95,
            duration: "5 hours",
            flashcards: 3,
            tests: 2,
            audio: "6",
            video: "18 tài liệu",
            lastUpdated: "2 hours ago",
            date: "16 Sep 2025"
        }
    ];

    const totalPages = 5;

    const handleCreateSet = (newSet: any) => {
        console.log('New set created:', newSet);
        // Xử lý tạo set mới ở đây
    };

    const handleSetAccess = (setId: string) => {
        console.log('Access set with ID:', setId);
        // Xử lý truy cập set ở đây
        navigate(`/sets/${setId}`);
    }

    return (
        <div className={`min-h-screen p-8`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <HeaderSet onSearch={(query) => console.log(query)} />

                {/* Tabs and View Toggle */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <span className={`text-lg font-medium mr-4`}>
                            Your Set
                        </span>
                        <Button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${activeTab === 'all'
                                ? 'bg-foreground text-background'
                                : 'bg-card text-muted-foreground hover:bg-card-secondary'
                                }`}
                        >
                            All <span className="ml-1">16</span>
                        </Button>
                        <Button
                            onClick={() => setActiveTab('completed')}
                            className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${activeTab === 'completed'
                                ? 'bg-foreground text-background'
                                : 'bg-card text-muted-foreground hover:bg-card-secondary'
                                }`}
                        >
                            Completed <span className="ml-1">5</span>
                        </Button>
                        <Button
                            onClick={() => setActiveTab('progress')}
                            className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors ${activeTab === 'progress'
                                ? 'bg-foreground text-background'
                                : 'bg-card text-muted-foreground hover:bg-card-secondary'
                                }`}
                        >
                            In progress <span className="ml-1">11</span>
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setIsModalOpen(true)}
                            className="ml-2 px-4 py-2 cursor-pointer bg-card text-foreground rounded-lg font-medium flex items-center gap-2 hover:bg-card-secondary transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            New set
                        </Button>
                    </div>
                </div>

                {/* Sets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {sets.map((set, idx) => (
                        <SetCard key={idx} set={set} onAccess={handleSetAccess} />
                    ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-4">
                    <Button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-card-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                    </Button>

                    <span className={`font-medium`}>
                        {currentPage}/{totalPages}
                    </span>

                    <Button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-card-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* New Set Modal */}
            <CreateNewModal
                type="Set"
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreateSet}
            />
        </div>
    );
}