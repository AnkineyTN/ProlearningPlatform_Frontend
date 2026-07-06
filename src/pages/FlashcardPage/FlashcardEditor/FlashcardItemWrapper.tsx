import { type FlashcardItemWrapperProps } from './type';
import FlashcardItemComponent from './FlashcardItemComponent';

export default function FlashcardItemWrapper({
  card,
  index,
  onUpdate,
  onDelete,
  onDuplicate,
  canDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: FlashcardItemWrapperProps) {
  return (
    <div
      draggable
      onDragStart={() => onDragStart(card.id)}
      onDragOver={(e) => onDragOver(e, card.id)}
      onDragEnd={onDragEnd}
      className={`bg-[var(--pl-bg)] rounded-lg p-6 border border-border hover:border-muted-foreground transition-all ${
        isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <FlashcardItemComponent
        card={card}
        index={index}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        canDelete={canDelete}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        isDragging={isDragging}
      />
    </div>
  );
}
