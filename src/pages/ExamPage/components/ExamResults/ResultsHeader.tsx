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
    <header className='flex shrink-0 flex-col border-b border-border bg-background z-10'>
      <div className='mx-auto w-full py-3 px-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => navigate(`/sets/${setId}/exams`)}
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              Back to Set
            </Button>
            <h1 className='text-xl font-bold'>Exam Results</h1>
          </div>
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
        </div>
      </div>
    </header>
  );
}
