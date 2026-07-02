import { Brain, ClipboardList, History, Home, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ResultsActionsProps {
  setId: number;
  attemptId?: number;
  onOpenHistory: () => void;
  onOpenAnalysis: () => void;
  onOpenAnalysisHistory: () => void;
  onOpenRetry: () => void;
}

export default function ResultsActions({
  setId,
  attemptId,
  onOpenHistory,
  onOpenAnalysis,
  onOpenAnalysisHistory,
  onOpenRetry,
}: ResultsActionsProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className='flex gap-3 justify-center flex-wrap pt-2 pb-8'>
      <Button
        variant='outline'
        onClick={() => navigate(`/sets/${setId}/exams`)}
        className='gap-2 text-muted-foreground'
      >
        <Home className='w-4 h-4' />
        {t('exam.results.backToSet')}
      </Button>

      <Button className='gap-2' onClick={onOpenHistory}>
        <History className='w-4 h-4' />
        {t('exam.results.viewHistory')}
      </Button>

      {attemptId != null && (
        <Button className='gap-2' onClick={onOpenAnalysis}>
          <Brain className='w-4 h-4' />
          {t('analysis.actions.analyze', { defaultValue: 'Analyze Knowledge' })}
        </Button>
      )}

      <Button
        variant='outline'
        className='gap-2 text-muted-foreground'
        onClick={onOpenAnalysisHistory}
      >
        <ClipboardList className='w-4 h-4' />
        {t('analysis.history.action', { defaultValue: 'View past analyses' })}
      </Button>

      <Button variant='outline' className='gap-2' onClick={onOpenRetry}>
        <RotateCcw className='w-4 h-4' />
        {t('exam.results.retryWrongAnswers')}
      </Button>
    </div>
  );
}
