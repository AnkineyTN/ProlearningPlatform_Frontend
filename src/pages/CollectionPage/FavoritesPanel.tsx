import { useNavigate } from 'react-router-dom';
import {
  CardGridSkeleton,
  EmptyState,
} from '@/components/lists/ListShared';
import SocialResourceCard from '@/pages/SocialPage/components/SocialResourceCard';
import { useFavorites } from '@/hooks/useFavorites';
import type { FavoriteType } from '@/services/types/favorite.types';

type Props = {
  type: FavoriteType;
  emptyLabel: string;
};

const ROUTE_FOR: Record<FavoriteType, (setId: number, id: number) => string> = {
  NOTE: (setId, id) => `/sets/${setId}/notes/${id}`,
  FLASHCARD: (setId, id) => `/sets/${setId}/flashcards/${id}`,
  EXAM: (setId, id) => `/sets/${setId}/exams/${id}`,
};

export default function FavoritesPanel({ type, emptyLabel }: Props) {
  const navigate = useNavigate();
  const { data: items = [], isLoading } = useFavorites(type);

  if (isLoading) return <CardGridSkeleton />;
  if (items.length === 0) return <EmptyState label={emptyLabel} />;

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
      {items.map((item) => (
        <SocialResourceCard
          key={item.id}
          item={{
            id: item.id,
            type: item.type,
            title: item.title,
            description: item.description,
            createdAt: item.createdAt,
            ownerName: item.ownerName,
            ownerAvatar: item.ownerAvatar,
            numQuestions: item.numQuestions,
            duration: item.duration,
            isFavorited: item.isFavorited,
          }}
          onAccess={() => navigate(ROUTE_FOR[type](item.setId, item.id))}
        />
      ))}
    </div>
  );
}
