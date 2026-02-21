import {
  BookOpen,
  Clock,
  FileText,
  Headphones,
  MoreVertical,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import DeleteConfirmDialog from "@/components/modals/DeleteConfirmDialog";

import { Button } from "../ui/button";
import DropdownMenu from "./DropdownMenu";

export type Set = {
  id: number;
  title: string;
  description: string;
  numNotes: number;
  code: string;
  duration: string;
  flashcards: number;
  tests: number;
  audio: number;
  video: string | number;
  progress: number;
  updated_at: string;
  created_at: string;
}

type Props = {
  set: Set;
  onAccess: (id: number) => void;
  onDelete?: (id: number) => void;
  onUpdate?: (set: Set) => void;
};

const SetCard = ({ set, onAccess, onDelete, onUpdate }: Props) => {
  const { t } = useTranslation();
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

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = () => {
    if (onDelete) {
      onDelete(set.id);
    }
    setShowDeleteDialog(false);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onUpdate) {
      onUpdate(set);
    }
  };

  const handleCardClick = () => {
    if (!showMenu && !showDeleteDialog) {
      onAccess(set.id);
    }
  };

  return (
    <div
      className='bg-card rounded-xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow'
      onClick={handleCardClick}
    >
      <div className='flex justify-between items-start mb-2'>
        <BookOpen className='w-5 h-5' />

        {/* More Options Button with Dropdown */}
        <div className='relative' ref={menuRef}>
          <Button
            onClick={handleMoreClick}
            variant='ghost'
            className='p-1 rounded cursor-pointer transition-colors'
            title='More options'
          >
            <MoreVertical className='w-4 h-4' />
          </Button>

          {/* Dropdown Menu */}
          {showMenu && (
            <DropdownMenu
              onUpdate={handleUpdate}
              onDelete={handleDeleteClick}
            />
          )}
        </div>
      </div>

      <h3 className='font-semibold mb-1 overflow-hidden text-ellipsis whitespace-nowrap'>
        {set.title}
      </h3>
      <p className='text-sm text-muted-foreground mb-4 line-clamp-2 overflow-hidden text-ellipsis whitespace-nowrap'>
        {set.description ? set.description : t("modal.noDescription")}
      </p>

      <div className='flex gap-4 text-xs text-muted-foreground mb-4 flex-wrap min-h-[16px]'>
        {set.flashcards > 0 && (
          <span className='flex items-center gap-1 text-text-purple'>
            <FileText className='w-3 h-3' /> {set.flashcards} flashcard
          </span>
        )}
        {set.numNotes > 0 && (
          <span className='flex items-center gap-1 text-text-pinked'>
            <FileText className='w-3 h-3' /> {set.numNotes} notes
          </span>
        )}
        {set.audio > 0 && (
          <span className='flex items-center gap-1'>
            <Headphones className='w-3 h-3' /> {set.audio} audio
          </span>
        )}
        {set.tests > 0 && (
          <span className='flex items-center gap-1'>
            <FileText className='w-3 h-3' />
            {set.tests} tests
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {/* <div className="w-full bg-card-secondary rounded-full h-2 mb-3">
                <div
                    className={`bg-foreground h-2 rounded-full transition-all w-[${set.progress}px]`}
                />
            </div> */}

      <div className='flex justify-between items-center text-xs text-muted-foreground'>
        <span className='flex items-center gap-1'>
          <Clock className='w-3 h-3' /> {set.updated_at}
        </span>
        <span>{set.created_at}</span>
      </div>
      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={t("modal.deleteConfirmationTitle")}
        itemName={`"${set.title}"`}
      />
    </div>
  );
};

export default SetCard;
