import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { useBackTo } from '@/hooks/useBackTo';

interface ResultsHeaderProps {
  setId: number;
  examId: number;
}

export default function ResultsHeader({ setId, examId }: ResultsHeaderProps) {
  const navigate = useNavigate();
  const backTo = useBackTo();
  const { t } = useTranslation();

  return (
    <header className='flex shrink-0 items-center justify-between px-6 py-3 border-b border-border bg-[var(--pl-bg)] sticky top-0 z-10'>
      <Button
        variant='ghost'
        size='sm'
        className='gap-2 text-muted-foreground hover:text-foreground'
        onClick={() => navigate(backTo ?? `/sets/${setId}/exams`)}
      >
        <ArrowLeft className='w-4 h-4' />
        {t('exam.results.backToSet')}
      </Button>

      <div className='flex items-center gap-3'>
        <Button
          variant='outline'
          size='sm'
          onClick={() =>
            navigate(`/sets/${setId}/exams/${examId}`, { state: { backTo } })
          }
        >
          {t('exam.results.viewExam')}
        </Button>
      </div>
    </header>
  );
}
