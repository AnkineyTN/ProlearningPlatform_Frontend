import { useState } from 'react';
import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';
import { useToggleFavorite } from '@/hooks/useFavorites';
import type { FavoriteType } from '@/services/types/favorite.types';

type Props = {
  type: FavoriteType;
  id: number;
  isFavorited?: boolean;
  size?: number;
  className?: string;
  onToggled?: (next: boolean) => void;
};

const FavoriteButton = ({
  type,
  id,
  isFavorited = false,
  size = 16,
  className,
  onToggled,
}: Props) => {
  const { t } = useTranslation();
  const [favorited, setFavorited] = useState(isFavorited);
  const { mutate, isPending } = useToggleFavorite();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isPending) return;

    const optimistic = !favorited;
    setFavorited(optimistic);

    mutate(
      { type, id },
      {
        onSuccess: (next) => {
          setFavorited(next);
          onToggled?.(next);
          toast.success(
            next ? t('favorite.added') : t('favorite.removed'),
          );
        },
        onError: (error) => {
          setFavorited(!optimistic);
          toast.error(apiErrorMessage(error, t('favorite.error')));
        },
      },
    );
  };

  return (
    <button
      type='button'
      onClick={handleClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? t('favorite.remove') : t('favorite.add')}
      title={favorited ? t('favorite.remove') : t('favorite.add')}
      className={cn(
        'grid place-items-center transition-all duration-200 disabled:opacity-60',
        favorited
          ? 'text-[var(--pl-danger)] hover:bg-[var(--pl-danger-soft)]'
          : 'text-[var(--pl-text-faint)] hover:text-[var(--pl-danger)] hover:bg-[var(--pl-bg-hover)]',
        className,
      )}
    >
      <Heart size={size} fill={favorited ? 'currentColor' : 'none'} />
    </button>
  );
};

export default FavoriteButton;
