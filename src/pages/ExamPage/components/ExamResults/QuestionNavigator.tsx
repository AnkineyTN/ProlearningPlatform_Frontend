import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Exam } from '../../types';
import type { ResultHelpers } from './utils';

interface QuestionNavigatorProps {
  exam: Exam;
  helpers: ResultHelpers;
  onSelect: (index: number) => void;
}

export default function QuestionNavigator({
  exam,
  helpers,
  onSelect,
}: QuestionNavigatorProps) {
  const { t } = useTranslation();

  return (
    <aside className='flex w-64 shrink-0 flex-col overflow-hidden border-r border-border bg-background'>
      <div className='shrink-0 border-b border-border p-4'>
        <h2 className='font-semibold text-sm mb-1'>
          {t('exam.results.navigatorTitle')}
        </h2>
      </div>

      <div className='flex-1 min-h-0 overflow-y-auto p-3 space-y-1'>
        {exam.questions.map((question, index) => {
          const correct = helpers.isAnswerCorrect(question.id);

          let tooltipText = '';
          let bgColor = '';
          let textColor = '';
          let icon = null;

          if (correct === true) {
            tooltipText = t('exam.results.navCorrect');
            bgColor =
              'bg-green-500/10 border-green-500/40 hover:bg-green-500/20';
            textColor = 'text-green-700 dark:text-green-400';
            icon = <CheckCircle className='w-3 h-3' />;
          } else if (correct === false) {
            tooltipText = t('exam.results.navIncorrect');
            bgColor = 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20';
            textColor = 'text-red-700 dark:text-red-400';
            icon = <XCircle className='w-3 h-3' />;
          } else {
            tooltipText = t('exam.results.navEssayPending');
            bgColor =
              'bg-yellow-500/10 border-yellow-500/40 hover:bg-yellow-500/20';
            textColor = 'text-yellow-700 dark:text-yellow-400';
            icon = <Clock className='w-3 h-3' />;
          }

          return (
            <Tooltip key={question.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onSelect(index)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-150 ${bgColor} ${textColor} text-sm font-medium`}
                >
                  <span className={`flex-shrink-0 ${textColor}`}>{icon}</span>
                  <span className='truncate'>Q{index + 1}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side='right'>
                <p className='text-xs font-medium'>{tooltipText}</p>
                <div className='flex items-center gap-2 truncate max-w-60'>
                  <p className='text-xs text-muted-foreground line-clamp-1 truncate'>
                    {question.questionText}
                  </p>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </aside>
  );
}
