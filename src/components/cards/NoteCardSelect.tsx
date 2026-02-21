import { FileText, Clock } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

export interface Note {
  id: number;
  title: string;
  description: string;
  privacy: string;
  timeAgo: string;
  created_at: string;
}

type Props = {
  note: Note;
  onSelected: (id: number) => void;
  isSelected?: boolean;
};

const NoteCardSelect = ({ note, onSelected, isSelected }: Props) => {
  const [checked, setChecked] = useState(isSelected);
  const handleCheckedChange = (val: boolean) => {
    setChecked(!!val);
    onSelected(note.id);
  };

  return (
    <div
      className={`rounded-xl p-5 shadow-sm cursor-pointer ${checked ? "bg-card-secondary" : "bg-card"}`}
      onClick={() => handleCheckedChange(!checked)}
    >
      <div className='flex justify-between items-start mb-3'>
        <FileText className='w-5 h-5' />
        <Checkbox checked={checked} />
      </div>

      <h2 className='font-semibold mb-1'>{note.title}</h2>
      <p className='text-sm text-muted-foreground mb-4'>{note.description}</p>
      <div className='flex justify-between items-center text-xs text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <Clock className='w-3 h-3' /> {note.timeAgo}
        </span>
        <span>{note.created_at}</span>
      </div>
    </div>
  );
};

export default NoteCardSelect;
