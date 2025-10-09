import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import Checklist from '@/components/cards/CheckListCard';
import SetCard from '@/components/cards/SetCard';
import NoteCard from '@/components/cards/NoteCard';
import Header from '@/components/header/HeaderDashboard';

const Dashboard = () => {
    const navigate = useNavigate();
    const [checklistItems, setChecklistItems] = useState([
        { label: 'Study for 2000 minutes', checked: false },
        { label: 'Sleep...', checked: false },
        { label: 'Complete 2 reading exercise', checked: false },
        { label: 'Complete 2 reading exercise', checked: false }
    ]);

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

    const notes = [
        {
            title: "Supervised Learning Algorithms",
            category: "Machine Learning Basic",
            preview: "Supervised learning is a machine learning method in which an algorithm learns from labe...",
            time: "2 hours ago",
            date: "16 Sep 2025"
        },
        {
            title: "Stack and Queue",
            category: "Data Structures",
            preview: "Stack is a LIFO (Last In First Out) data structure, while Queue is FIFO (First In First Out). Impleme...",
            time: "2 hours ago",
            date: "16 Sep 2025"
        }
    ];

    const calendar = [
        ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        [1, 2, 3, 4, 5, 6, 7],
        [8, 9, 10, 11, 12, 13, 14],
        [15, 16, 17, 18, 19, 20, 21],
        [22, 23, 24, 25, 26, 27, 28],
        [29, 30, '', '', '', '', '']
    ];

    const handleViewSets = () => {
        navigate("/sets");
    };

    const handleViewNotes = () => {
        navigate("/notes");
    };

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
                            <h2 className="text-xl font-bold">Your Sets</h2>
                            <button onClick={handleViewSets} className="text-sm flex items-center gap-1 hover:underline cursor-pointer">
                                View all <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {sets.map((set, idx) => (
                                <SetCard key={idx} set={set} />
                            ))}
                        </div>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Recent notes</h2>
                            <button onClick={handleViewNotes} className="text-sm flex items-center gap-1 hover:underline cursor-pointer">
                                View all <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {notes.map((note, idx) => (
                                <NoteCard key={idx} note={note} />
                            ))}
                        </div>
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
        </div>
    );
};

export default Dashboard;