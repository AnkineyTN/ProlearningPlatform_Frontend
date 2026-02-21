import { FilePen, MoreVertical, Clock } from 'lucide-react';

export type Test = {
    title: string;
    category: string;
    preview: string;
    time: string;
    date: string;
}

const TestCard = ({ test, onAccess }: { test: Test, onAccess: (id: string) => void }) => {
    const handleClick = () => {
        onAccess(test.title); // Giả sử 'title' là ID của test
    }
    return (
        <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer" onClick={handleClick}>
            <div className="flex justify-between items-start mb-3">
                <FilePen className="w-5 h-5" />
                <button className="hover:bg-card-secondary p-1 rounded cursor-pointer" title="More options">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
            <h2 className="font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap">{test.title}</h2 >
            <p className="text-xs text-muted-foreground mb-3 overflow-hidden text-ellipsis whitespace-nowrap">{test.category}</p>
            <p className="text-sm text-muted-foreground mb-4 overflow-hidden text-ellipsis whitespace-nowrap">{test.preview}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {test.time}
                </span>
                <span>{test.date}</span>
            </div>
        </div>
    );
};

export default TestCard;
