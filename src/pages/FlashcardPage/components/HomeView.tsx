import {
  Brain,
  Blocks,
  ClipboardList,
  Heart,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useUploadImageFile } from '@/hooks/useImageUpload';
import FlipFlashcard from './FlipFlashcard';
import type { Card as CardData } from '@/services/types/flashcard.types';

type HomeViewProps = {
  setId: number;
  flashcardId: number | string;
  flashcards: CardData[];
  onCardClick: (index: number) => void;
  onStudy: () => void;
  onMatching: () => void;
  onPracticeWithExam: () => void;
  isPracticeWithExamLoading?: boolean;
  isFlipped: boolean;
  currentCardIndex: number;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onUpdateCard: (data: {
    id: number;
    frontCard: string;
    backCard: string;
    imageAssetId?: number | null;
    cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
  }) => void;
  onDeleteCard: (cardId: number) => void;
  isUpdating?: boolean;
  onDeleteFlashcard?: () => void;
  isDeletingFlashcard?: boolean;
  onShuffle: () => void;
  onCardAnswer: (isCorrect: boolean) => void;
  sessionProgress?: {
    completedCount: number;
    progressPercent: number;
  };
};

const HomeView = ({
  setId,
  flashcards,
  flashcardId,
  onCardClick,
  onStudy,
  onMatching,
  onPracticeWithExam,
  isPracticeWithExamLoading = false,
  isFlipped,
  currentCardIndex,
  onFlip,
  onPrevious,
  onNext,
  onShuffle,
  onUpdateCard,
  onDeleteCard,
  onDeleteFlashcard,
  isUpdating = false,
  onCardAnswer,
}: HomeViewProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [deleteCardId, setDeleteCardId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{
    frontCard: string;
    backCard: string;
    imageUrl?: string;
    imageAssetId?: number;
    imageRemoved: boolean;
  }>({
    frontCard: '',
    backCard: '',
    imageUrl: undefined,
    imageAssetId: undefined,
    imageRemoved: false,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteCardDialog, setShowDeleteCardDialog] = useState(false);
  const uploadImageMutation = useUploadImageFile();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDeleteFlashcard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowDeleteDialog(true);
  };

  const handleUpdate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    navigate(`/sets/${setId}/flashcards/${flashcardId}/update`);
  };

  const handleEditCard = (card: CardData, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCardId(card.id);
    setEditData({
      frontCard: card.frontCard,
      backCard: card.backCard,
      imageUrl: card.imageUrl || undefined,
      imageAssetId: undefined,
      imageRemoved: false,
    });
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCardId(null);
    setEditData({
      frontCard: '',
      backCard: '',
      imageUrl: undefined,
      imageAssetId: undefined,
      imageRemoved: false,
    });
  };

  const handleSaveEdit = async (card: CardData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!editData.frontCard.trim() || !editData.backCard.trim()) {
      toast.error('Front and back card cannot be empty');
      return;
    }
    await onUpdateCard({
      id: card.id,
      frontCard: editData.frontCard.trim(),
      backCard: editData.backCard.trim(),
      imageAssetId: editData.imageRemoved ? null : editData.imageAssetId,
      cardStatus: card.cardStatus,
    });
    setEditingCardId(null);
    setEditData({
      frontCard: '',
      backCard: '',
      imageUrl: undefined,
      imageAssetId: undefined,
      imageRemoved: false,
    });
  };

  const handleDeleteCard = (cardId: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setShowMenu(false);
    setDeleteCardId(cardId);
    setShowDeleteCardDialog(true);
  };

  const handleConfirmDeleteCard = () => {
    if (deleteCardId == null) return;
    onDeleteCard(deleteCardId);
    setShowDeleteCardDialog(false);
    setDeleteCardId(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      setEditData((prev) => ({
        ...prev,
        imageUrl: result.url,
        imageAssetId: result.assetId,
        imageRemoved: false,
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditData((prev) => ({
      ...prev,
      imageUrl: undefined,
      imageAssetId: undefined,
      imageRemoved: true,
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      <div className='max-w-5xl mx-auto p-6'>
        {/* Action bar */}
        <div className='flex items-center gap-2 mb-2'>
          <Button onClick={onStudy} className='gap-2 text-sm' size='sm'>
            <Brain className='w-4 h-4' />
            Study
          </Button>
          <Button onClick={onMatching} className='gap-2 text-sm' size='sm'>
            <Blocks className='w-4 h-4' />
            Matching
          </Button>
          <Button
            onClick={onPracticeWithExam}
            disabled={isPracticeWithExamLoading}
            className='gap-2 text-sm'
            size='sm'
          >
            {isPracticeWithExamLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <ClipboardList className='w-4 h-4' />
            )}
            Practice with Exam
          </Button>

          <div className='ml-auto flex items-center gap-1'>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-muted-foreground hover:text-foreground'
            >
              <Heart className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-muted-foreground hover:text-foreground'
            >
              <Share2 className='w-4 h-4' />
            </Button>
            {/* More dropdown */}
            <div className='relative' ref={menuRef}>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 text-muted-foreground hover:text-foreground'
                onClick={handleMoreClick}
              >
                <MoreVertical className='w-4 h-4' />
              </Button>
              {showMenu && (
                <div className='absolute right-0 mt-1.5 w-40 bg-[var(--pl-bg)] border border-border rounded-xl shadow-xl z-20 overflow-hidden py-1'>
                  <button
                    onClick={handleUpdate}
                    className='w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors cursor-pointer'
                  >
                    <Edit className='w-3.5 h-3.5 text-muted-foreground' />
                    Update
                  </button>
                  <div className='my-1 border-t border-border' />
                  <button
                    onClick={handleDeleteFlashcard}
                    className='w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer'
                  >
                    <Trash2 className='w-3.5 h-3.5' />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flip card preview */}
        <div className='mb-8'>
          <FlipFlashcard
            isFlipped={isFlipped}
            flashcards={flashcards}
            currentCardIndex={currentCardIndex}
            onFlip={onFlip}
            onPrevious={onPrevious}
            onNext={onNext}
            onShuffle={onShuffle}
            onCardAnswer={onCardAnswer}
          />
        </div>

        {/* Card list header */}
        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-[family-name:var(--font-display)] text-xl font-medium tracking-tight'>
            Cards
            <span className='font-[family-name:var(--font-mono-pl)] text-sm font-normal text-muted-foreground ml-2'>
              ({flashcards.length})
            </span>
          </h2>
        </div>

        {/* Hidden file input */}
        <Input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleFileChange}
          className='hidden'
        />

        {/* Cards */}
        <div className='space-y-2'>
          {flashcards.map((card, index) => (
            <div
              key={card.id}
              className={`bg-[var(--pl-bg-elev)] border rounded-xl transition-all ${
                editingCardId === card.id
                  ? 'border-[var(--pl-accent)] shadow-md'
                  : 'border-border hover:border-border/80 cursor-pointer hover:shadow-sm'
              }`}
              onClick={() => editingCardId !== card.id && onCardClick(index)}
            >
              {editingCardId === card.id ? (
                /* Edit mode */
                <div
                  className='p-5 space-y-4'
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className='flex gap-6'>
                    <div className='flex-1 max-w-55'>
                      <label className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block font-medium'>
                        Term
                      </label>
                      <Textarea
                        value={editData.frontCard}
                        onChange={(e) =>
                          setEditData((p) => ({
                            ...p,
                            frontCard: e.target.value,
                          }))
                        }
                        placeholder='Enter term'
                        className='min-h-[80px] resize-none bg-background border-border focus:border-primary text-sm'
                        autoFocus
                      />
                    </div>
                    <div className='w-px bg-border self-stretch' />
                    <div className='flex-1'>
                      <label className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block font-medium'>
                        Definition
                      </label>
                      <Textarea
                        value={editData.backCard}
                        onChange={(e) =>
                          setEditData((p) => ({
                            ...p,
                            backCard: e.target.value,
                          }))
                        }
                        placeholder='Enter definition'
                        className='min-h-[80px] resize-none bg-background border-border focus:border-primary text-sm'
                      />
                    </div>
                    {/* Image */}
                    <div className='flex flex-col justify-center'>
                      {editData.imageUrl ? (
                        <div className='relative group'>
                          <img
                            src={editData.imageUrl}
                            alt='Card'
                            className='w-20 h-20 mt-6 object-cover rounded-lg border border-border'
                          />
                          <button
                            onClick={handleRemoveImage}
                            className='absolute top-4 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'
                          >
                            <X className='w-3 h-3' />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            fileInputRef.current?.click();
                          }}
                          disabled={uploadImageMutation.isPending}
                          className='w-16 h-16 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-50 cursor-pointer'
                        >
                          {uploadImageMutation.isPending ? (
                            <Loader2 className='w-5 h-5 animate-spin' />
                          ) : (
                            <>
                              <ImageIcon className='w-5 h-5' />
                              <span className='text-[10px] uppercase tracking-wide'>
                                Image
                              </span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className='flex justify-end gap-2 pt-1'>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={handleCancelEdit}
                      className='gap-1.5 text-xs'
                    >
                      <X className='w-3.5 h-3.5' />
                      Cancel
                    </Button>
                    <Button
                      size='sm'
                      onClick={(e) => handleSaveEdit(card, e)}
                      disabled={
                        isUpdating ||
                        !editData.frontCard.trim() ||
                        !editData.backCard.trim()
                      }
                      className='gap-1.5 text-xs'
                    >
                      <Check className='w-3.5 h-3.5' />
                      {isUpdating ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                </div>
              ) : (
                /* View mode */
                <div className='p-4 flex items-start gap-4'>
                  <span className='font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground/60 mt-0.5 w-5 flex-shrink-0 text-right'>
                    {index + 1}
                  </span>
                  <div className='flex-1 min-w-0 max-w-45'>
                    <p className='font-medium text-sm leading-snug'>
                      {card.frontCard}
                    </p>
                  </div>
                  <div className='w-px bg-border self-stretch mx-2' />
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm text-muted-foreground leading-snug'>
                      {card.backCard}
                    </p>
                  </div>
                  {card.imageUrl && (
                    <img
                      src={card.imageUrl}
                      alt='Flashcard'
                      className='w-12 h-12 object-cover rounded-lg border border-border flex-shrink-0'
                    />
                  )}
                  {/* Card actions */}
                  <div className='flex gap-1 flex-shrink-0'>
                    <Button
                      className='h-7 w-7 hover:bg-[var(--pl-bg-hover)] place-items-center rounded-lg bg-transparent text-[var(--pl-text-muted)] cursor-pointer'
                      onClick={(e) => handleEditCard(card, e)}
                      title='Edit card'
                    >
                      <Edit className='w-2 h-2' />
                    </Button>
                    <button
                      className='w-7 h-7 rounded-lg text-[var(--pl-danger)] place-items-center hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer'
                      onClick={(e) => handleDeleteCard(card.id, e)}
                      title='Delete card'
                    >
                      <Trash2 className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Make card actions visible on hover via group */}
      <style>{`.group:hover .opacity-0 { opacity: 1; }`}</style>

      <DeleteConfirmDialog
        isOpen={showDeleteCardDialog}
        onClose={() => setShowDeleteCardDialog(false)}
        onConfirm={handleConfirmDeleteCard}
        title='Delete Card'
        itemName={t('modal.thisCard')}
      />
      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={() => {
          if (onDeleteFlashcard) onDeleteFlashcard();
          setShowDeleteDialog(false);
        }}
        title='Delete Flashcard'
        itemName={t('modal.thisFlashcard')}
      />
    </>
  );
};

export default HomeView;
