import { FilePen, MoreVertical, Clock } from "lucide-react";
import DropdownMenu from "./DropdownMenu";
import { useState, useRef, useEffect } from "react";
import DeleteConfirmDialog from "@/components/modals/DeleteConfirmDialog";

export type ExamCardData = {
  id: number | string;
  title: string;
  description?: string;
  numQuestions?: number;
  duration?: number;
  createdAt?: string;
  privacy?: "PUBLIC" | "PRIVATE";
};

type Props = {
  exam: ExamCardData;
  onAccess: (id: string) => void;
  onUpdate: (exam: ExamCardData) => void;
  onDelete: (examId: number | string) => void;
};

const ExamCard = ({ exam, onAccess, onUpdate, onDelete }: Props) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    onDelete(exam.id);
    setShowDeleteDialog(false);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onUpdate(exam);
  };

  const handleClick = () => {
    if (!showMenu && !showDeleteDialog) {
      onAccess(String(exam.id));
    }
  };

  const preview =
    exam.description?.slice(0, 80) ?? "No description";
  const date = exam.createdAt
    ? new Date(exam.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div
      className='bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow'
      onClick={handleClick}
    >
      <div className='flex justify-between items-start mb-3'>
        <FilePen className='w-5 h-5' />
        <div className='relative' ref={menuRef}>
          <button
            onClick={handleMoreClick}
            className='hover:bg-card-secondary p-1 rounded cursor-pointer transition-colors'
            title='More options'
          >
            <MoreVertical className='w-4 h-4' />
          </button>
          {showMenu && (
            <DropdownMenu onUpdate={handleUpdate} onDelete={handleDelete} />
          )}
        </div>
      </div>
      <h2 className='font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap'>
        {exam.title}
      </h2>
      <p className='text-xs text-muted-foreground mb-3 overflow-hidden text-ellipsis whitespace-nowrap'>
        {exam.numQuestions ?? 0} questions
      </p>
      <p className='text-sm text-muted-foreground mb-4 overflow-hidden text-ellipsis whitespace-nowrap'>
        {preview}
        {preview.length >= 80 ? '...' : ''}
      </p>
      <div className='flex justify-between items-center text-xs text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <Clock className='w-3 h-3' /> Duration: {exam.duration ?? 30} min
        </span>
        <span>{date}</span>
      </div>
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Exam'
        itemName={`"${exam.title}"`}
      />
    </div>
  );
};

export default ExamCard;
