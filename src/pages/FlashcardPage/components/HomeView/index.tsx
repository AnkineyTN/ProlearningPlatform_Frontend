import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import { Input } from '@/components/ui/input';

import FlipFlashcard from '../FlipFlashcard';
import ActionBar from './ActionBar';
import CardListItem from './CardListItem';
import { useCardEdit } from './useCardEdit';

import type { Card as CardData } from '@/services/types/flashcard.types';
type HomeViewProps = {
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
  onUpdateCard: (data: {
    id: number;
    frontCard: string;
    backCard: string;
    imageAssetId?: number | null;
    cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
  }) => void;
  onDeleteCard: (cardId: number) => void;
  isUpdating?: boolean;
  onShuffle: () => void;
  onCardAnswer: (isCorrect: boolean) => void;
  sessionProgress?: {
    completedCount: number;
    progressPercent: number;
  };
};

export default function HomeView({
  flashcards,
  onCardClick,
  onStudy,
  onMatching,
  onPracticeWithExam,
  isPracticeWithExamLoading = false,
  isFlipped,
  currentCardIndex,
  onFlip,
  onPrevious,
  onShuffle,
  onUpdateCard,
  onDeleteCard,
  isUpdating = false,
  onCardAnswer,
}: HomeViewProps) {
  const { t } = useTranslation();
  const edit = useCardEdit(onUpdateCard);

  const [deleteCardId, setDeleteCardId] = useState<number | null>(null);
  const [showDeleteCardDialog, setShowDeleteCardDialog] = useState(false);

  const requestDeleteCard = (cardId: number) => {
    setDeleteCardId(cardId);
    setShowDeleteCardDialog(true);
  };

  const confirmDeleteCard = () => {
    if (deleteCardId == null) return;
    onDeleteCard(deleteCardId);
    setShowDeleteCardDialog(false);
    setDeleteCardId(null);
  };

  return (
    <>
      <div className='max-w-5xl mx-auto px-6 py-4 mb-10'>
        <ActionBar
          onStudy={onStudy}
          onMatching={onMatching}
          onPracticeWithExam={onPracticeWithExam}
          isPracticeWithExamLoading={isPracticeWithExamLoading}
          onShuffle={onShuffle}
        />

        <div className='mb-4'>
          <FlipFlashcard
            isFlipped={isFlipped}
            flashcards={flashcards}
            currentCardIndex={currentCardIndex}
            onFlip={onFlip}
            onPrevious={onPrevious}
            onShuffle={onShuffle}
            onCardAnswer={onCardAnswer}
            showBottomToolbar={false}
          />
        </div>

        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-[family-name:var(--font-display)] text-xl font-medium tracking-tight'>
            Cards
            <span className='font-[family-name:var(--font-mono-pl)] text-sm font-normal text-muted-foreground ml-2'>
              ({flashcards.length})
            </span>
          </h2>
        </div>

        <Input
          ref={edit.fileInputRef}
          type='file'
          accept='image/*'
          onChange={edit.handleFileChange}
          className='hidden'
        />

        <div className='space-y-2'>
          {flashcards.map((card, index) => (
            <CardListItem
              key={card.id}
              card={card}
              index={index}
              edit={edit}
              isUpdating={isUpdating}
              onCardClick={onCardClick}
              onRequestDeleteCard={requestDeleteCard}
            />
          ))}
        </div>
      </div>

      <style>{`.group:hover .opacity-0 { opacity: 1; }`}</style>

      <DeleteConfirmDialog
        isOpen={showDeleteCardDialog}
        onClose={() => setShowDeleteCardDialog(false)}
        onConfirm={confirmDeleteCard}
        title='Delete Card'
        itemName={t('modal.thisCard')}
      />
    </>
  );
}
