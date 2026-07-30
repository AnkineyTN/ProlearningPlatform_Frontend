import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useBackTo } from '@/hooks/useBackTo';

interface ResultsHeaderProps {
  setId: number;
  flashcardId: number;
}

export default function ResultsHeader({
  setId,
  flashcardId,
}: ResultsHeaderProps) {
  const navigate = useNavigate();
  const backTo = useBackTo();
  const { t } = useTranslation();

  return (
    <header className='sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-border bg-[var(--pl-bg)] px-6 py-3'>
      <Button
        variant='ghost'
        size='sm'
        className='gap-2 text-muted-foreground hover:text-foreground'
        onClick={() => navigate(backTo ?? `/sets/${setId}/flashcards`)}
      >
        <ArrowLeft className='h-4 w-4' />
        {t('exam.results.backToSet')}
      </Button>

      <Button
        variant='outline'
        size='sm'
        onClick={() =>
          navigate(`/sets/${setId}/flashcards/${flashcardId}`, {
            state: { backTo },
          })
        }
      >
        {t('flashcard.results.backToFlashcard')}
      </Button>
    </header>
  );
}
