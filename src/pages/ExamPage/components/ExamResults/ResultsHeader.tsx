import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import ModeToggle from '@/components/theme/mode-toggle';
import NotificationBell from '@/components/notifications/NotificationBell';

interface ResultsHeaderProps {
  setId: number;
  examId: number;
}

export default function ResultsHeader({ setId, examId }: ResultsHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header
      className='flex shrink-0 items-center justify-between px-6 py-3 border-b border-border bg-[var(--pl-bg)] sticky top-0 z-10'
    >
      <Button
        variant='ghost'
        size='sm'
        className='gap-2 text-muted-foreground hover:text-foreground'
        onClick={() => navigate(`/sets/${setId}/exams`)}
      >
        <ArrowLeft className='w-4 h-4' />
        Back to Set
      </Button>

      <div className='flex items-center gap-3'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => navigate(`/sets/${setId}/exams/${examId}`)}
        >
          {t('exam.results.viewExam')}
        </Button>
        <NotificationBell />
        <ModeToggle />
      </div>
    </header>
  );
}
