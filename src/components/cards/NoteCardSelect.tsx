import { FileText, Clock } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useState } from 'react';

export interface Note {
    id: number;
    title: string;
    description: string;
    privacy: string;
    timeAgo: string;
    created_at: string;
}

interface NoteCardSelectProps {
    note: Note;
    onSelected: (id: number) => void;
}

export default function NoteCardSelect({ note, onSelected }: NoteCardSelectProps) {
    const [checked, setChecked] = useState(false);

    const handleCheckedChange = (val: boolean) => {
        setChecked(!!val);
        // notify parent of selection toggle
        onSelected(note.id);
    };

    return (
        <div className={`rounded-xl p-5 shadow-sm cursor-pointer ${checked ? 'bg-card-secondary' : 'bg-card'}`}>
            <div className="flex justify-between items-start mb-3">
                <FileText className="w-5 h-5" />
                <Checkbox checked={checked} onCheckedChange={handleCheckedChange} />
            </div>

            <h2 className="font-semibold mb-1">{note.title}</h2 >
            <p className="text-sm text-muted-foreground mb-4">{note.description}</p>
            <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {note.timeAgo}
                </span>
                <span>{note.created_at}</span>
            </div>
        </div>
    );
};