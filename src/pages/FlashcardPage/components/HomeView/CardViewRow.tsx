import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Card as CardData } from '@/services/types/flashcard.types';

interface CardViewRowProps {
  card: CardData;
  index: number;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export default function CardViewRow({
  card,
  index,
  onEdit,
  onDelete,
}: CardViewRowProps) {
  return (
    <div className='p-4 flex items-start gap-4'>
      <span className='font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground/60 mt-0.5 w-5 flex-shrink-0 text-right'>
        {index + 1}
      </span>
      <div className='flex-1 min-w-0 max-w-45'>
        <p className='font-medium text-sm leading-snug'>{card.frontCard}</p>
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
      <div className='flex gap-1 flex-shrink-0'>
        <Button
          className='h-7 w-7 hover:bg-[var(--pl-bg-hover)] place-items-center rounded-lg bg-transparent text-[var(--pl-text-muted)] cursor-pointer'
          onClick={onEdit}
          title='Edit card'
        >
          <Edit className='w-2 h-2' />
        </Button>
        <button
          className='w-7 h-7 rounded-lg text-[var(--pl-danger)] place-items-center hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer'
          onClick={onDelete}
          title='Delete card'
        >
          <Trash2 className='w-3.5 h-3.5' />
        </button>
      </div>
    </div>
  );
}
