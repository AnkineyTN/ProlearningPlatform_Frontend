import { Brain, History, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ResultsActionsProps {
  setId: number;
  attemptId?: number;
  onOpenHistory: () => void;
  onOpenAnalysis: () => void;
  onOpenRetry: () => void;
}

export default function ResultsActions({
  setId,
  attemptId,
  onOpenHistory,
  onOpenAnalysis,
  onOpenRetry,
}: ResultsActionsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='flex justify-center gap-4 pb-8 flex-wrap'>
      <Button variant='outline' onClick={() => navigate(`/sets/${setId}`)}>
        {t('exam.results.backToSet')}
      </Button>
      <Button variant='default' className='gap-2' onClick={onOpenHistory}>
        <History className='w-4 h-4' />
        {t('exam.results.viewHistory')}
      </Button>
      {attemptId != null && (
        <Button
          variant='outline'
          className='gap-2 border-[var(--pl-accent)]/40 text-[var(--pl-accent)] hover:bg-[var(--pl-accent)]/5'
          onClick={onOpenAnalysis}
        >
          <Brain className='w-4 h-4' />
          {t('analysis.actions.analyze', {
            defaultValue: 'Analyze my knowledge',
          })}
        </Button>
      )}
      <Button
        variant='outline'
        className='gap-2 border-orange-400/50 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 cursor-pointer'
        onClick={onOpenRetry}
      >
        <RotateCcw className='w-4 h-4' />
        Luyện lại câu sai
      </Button>
    </div>
  );
}
