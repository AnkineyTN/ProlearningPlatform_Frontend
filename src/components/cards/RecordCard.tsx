import { FileAudio, MoreVertical, Clock } from 'lucide-react';

export interface Record {
    title: string;
    category: string;
    preview: string;
    time: string;
    date: string;
}

export default function RecordCard({ record, onAccess }: { record: Record, onAccess: (id: string) => void }) {
    const handleClick = () => {
        onAccess(record.title); // Giả sử 'title' là ID của record
    }

    return (
        <div className="bg-card rounded-xl p-5 shadow-sm cursor-pointer" onClick={handleClick}>
            <div className="flex justify-between items-start mb-3">
                <FileAudio className="w-5 h-5" />
                <button className="hover:bg-card-secondary p-1 rounded cursor-pointer" title="More options">
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>
            <h2 className="font-semibold mb-1">{record.title}</h2 >
            <p className="text-xs text-muted-foreground mb-3">{record.category}</p>
            <p className="text-sm text-muted-foreground mb-4">{record.preview}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {record.time}
                </span>
                <span>{record.date}</span>
            </div>
        </div>
    );
};