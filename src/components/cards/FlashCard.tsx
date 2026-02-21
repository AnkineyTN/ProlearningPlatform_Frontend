import { SwatchBook, MoreVertical, Clock } from "lucide-react";
import DropdownMenu from "./DropdownMenu";
import { useState, useRef, useEffect } from "react";
import DeleteConfirmDialog from "@/components/modals/DeleteConfirmDialog";

export interface Flashcard {
  id: number | string;
  title: string;
  description: string;
  time: string;
  created_at: string;
  privacy: "PUBLIC" | "PRIVATE";
}

type Props = {
  flashcard: Flashcard;
  onAccess: (id: number | string) => void;
  onUpdate: (flashcard: Flashcard) => void;
  onDelete: (flashcardId: number | string) => void;
};

const FlashCard = ({ flashcard, onAccess, onUpdate, onDelete }: Props) => {
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
    onDelete(flashcard.id);
    setShowDeleteDialog(false);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onUpdate) {
      onUpdate(flashcard);
    }
  };

  const handleClick = () => {
    if (!showMenu && !showDeleteDialog) {
      onAccess(flashcard.id);
    }
  };

  return (
    <div
      className='bg-card rounded-xl p-5 shadow-sm cursor-pointer'
      onClick={handleClick}
    >
      <div className='flex justify-between items-start mb-3'>
        <SwatchBook className='w-5 h-5 text-text-purple' />
        <div className='relative' ref={menuRef}>
          <button
            onClick={handleMoreClick}
            className='hover:bg-card-secondary p-1 rounded cursor-pointer transition-colors'
            title='More options'
          >
            <MoreVertical className='w-4 h-4' />
          </button>
          {/* Dropdown Menu */}
          {showMenu && (
            <DropdownMenu onUpdate={handleUpdate} onDelete={handleDelete} />
          )}
        </div>
      </div>
      <h2 className='font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap'>
        {flashcard.title}
      </h2>
      <p className='text-sm text-muted-foreground mb-4 overflow-hidden text-ellipsis whitespace-nowrap'>
        {flashcard.description}
      </p>
      <div className='flex justify-between items-center text-xs text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <Clock className='w-3 h-3' /> {flashcard.time}
        </span>
        <span>{flashcard.created_at}</span>
      </div>
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title='Delete Flashcard'
        itemName={`"${flashcard.title}"`}
      />
    </div>
  );
};

export default FlashCard;
