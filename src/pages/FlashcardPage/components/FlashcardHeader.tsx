import { BookOpen, Edit, MoreVertical, Share2, SwatchBook, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ShareDialog } from '@/components/collaboration/ShareDialog';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import type { CollabRole } from '@/services/types/collaboration.types';
import type { FlashcardDetailResponse } from '@/services/types/flashcard.types';
import { useAuth } from '@/hooks/useAuth';
import { useBackTo } from '@/hooks/useBackTo';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FlashcardHeaderProps {
  setId: number;
  flashcardId: number;
  title: string;
  description: string;
  setTitle?: string;
  userRole?: CollabRole;
  isFavorited?: boolean;
  onDeleteFlashcard?: () => void;
  isDeletingFlashcard?: boolean;
}

export default function FlashcardHeader({
  setId,
  flashcardId,
  title,
  description,
  setTitle,
  userRole = 'OWNER',
  isFavorited = false,
  onDeleteFlashcard,
  isDeletingFlashcard = false,
}: FlashcardHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const currentUserId = useAuth().user?.id;
  const [shareOpen, setShareOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();

  const backTo = useBackTo();

  const handleClick = () => {
    navigate(backTo ?? `/sets/${setId}/flashcards`);
  };

  return (
    <div className='border-b'>
      <div className='max-w-5xl mx-auto px-6 py-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-end gap-4'>
            <div className='flex items-center gap-4'>
              <SwatchBook className='w-8 h-8' />
              <h1 className='text-3xl font-bold font-[family-name:var(--font-display)]'>
                {title}
              </h1>
            </div>
            <div
              className='flex items-center gap-2 cursor-pointer hover:underline'
              onClick={handleClick}
            >
              <BookOpen className='w-5 h-5 text-muted-foreground' />
              {setTitle && (
                <span className='text-muted-foreground text-sm'>
                  {setTitle}
                </span>
              )}
            </div>
          </div>
          <div className='flex items-center gap-3 shrink-0'>
            <FavoriteButton
              type='FLASHCARD'
              id={flashcardId}
              isFavorited={isFavorited}
              onToggled={(next) => {
                queryClient.setQueryData(
                  ['flashcard-detail', setId, flashcardId],
                  (old?: FlashcardDetailResponse) =>
                    old
                      ? { ...old, data: { ...old.data, isFavorited: next } }
                      : old,
                );
              }}
              className='h-9 w-9 rounded-lg border border-[var(--pl-border)]'
            />
            <Button
              size='sm'
              className='flex h-9 w-9 items-center justify-center hover:bg-[var(--pl-bg-hover)] place-items-center rounded-lg border border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] cursor-pointer'
              onClick={() => setShareOpen(true)}
            >
              <Share2 className='size-4' />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size='sm'
                  className='flex h-9 w-9 items-center justify-center place-items-center rounded-lg border border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] cursor-pointer hover:bg-[var(--pl-bg-hover)]'
                >
                  <MoreVertical className='size-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='min-w-[120px]'>
                <DropdownMenuItem
                  onSelect={() =>
                    navigate(`/sets/${setId}/flashcards/${flashcardId}/update`)
                  }
                >
                  <Edit className='size-3.5' />
                  {t('modal.updateButton')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant='destructive'
                  disabled={isDeletingFlashcard}
                  onSelect={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className='size-3.5' />
                  {t('modal.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className='text-sm text-muted-foreground'>{description}</div>
      </div>
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        setId={setId}
        resourceType='flashcards'
        resourceId={flashcardId}
        userRole={userRole}
        currentUserId={currentUserId}
      />
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          onDeleteFlashcard?.();
          setShowDeleteDialog(false);
        }}
        title='Delete Flashcard'
        itemName={t('modal.thisFlashcard')}
      />
    </div>
  );
}
