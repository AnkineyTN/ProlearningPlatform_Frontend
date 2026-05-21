import type { Card as CardData } from '@/services/types/flashcard.types';
import CardEditForm from './CardEditForm';
import CardViewRow from './CardViewRow';
import type { UseCardEditReturn } from './useCardEdit';

interface CardListItemProps {
  card: CardData;
  index: number;
  edit: UseCardEditReturn;
  isUpdating: boolean;
  onCardClick: (index: number) => void;
  onRequestDeleteCard: (cardId: number) => void;
}

export default function CardListItem({
  card,
  index,
  edit,
  isUpdating,
  onCardClick,
  onRequestDeleteCard,
}: CardListItemProps) {
  const isEditing = edit.editingCardId === card.id;

  return (
    <div
      className={`bg-[var(--pl-bg-elev)] border rounded-xl transition-all ${
        isEditing
          ? 'border-[var(--pl-accent)] shadow-md'
          : 'border-border hover:border-border/80 cursor-pointer hover:shadow-sm'
      }`}
      onClick={() => !isEditing && onCardClick(index)}
    >
      {isEditing ? (
        <CardEditForm card={card} edit={edit} isUpdating={isUpdating} />
      ) : (
        <CardViewRow
          card={card}
          index={index}
          onEdit={(e) => {
            e.stopPropagation();
            edit.beginEdit(card);
          }}
          onDelete={(e) => {
            e.stopPropagation();
            onRequestDeleteCard(card.id);
          }}
        />
      )}
    </div>
  );
}
