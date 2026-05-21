import { Award, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { ExamResult } from '../../types';

interface ResultsSummaryCardProps {
  result: ExamResult;
  correctCount: number;
  totalNonEssay: number;
}

export default function ResultsSummaryCard({
  result,
  correctCount,
  totalNonEssay,
}: ResultsSummaryCardProps) {
  const { t } = useTranslation();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return t('exam.results.timeFormatted', { mins, secs });
  };

  const stats = [
    {
      value: `${result.percentage.toFixed(1)}%`,
      label: t('exam.results.percentage'),
      colored: true,
    },
    {
      value: `${result.earnedScore}/${result.totalScore}`,
      label: t('exam.results.score'),
    },
    {
      value: `${correctCount}/${totalNonEssay}`,
      label: t('exam.results.correctLabel'),
    },
    {
      value: formatTime(result.timeTaken),
      label: t('exam.results.timeTaken'),
    },
  ];

  return (
    <div className='bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-6'>
      <div className='text-center mb-5'>
        <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-3'>
          {result.passed ? (
            <Award className='w-8 h-8 text-primary' />
          ) : (
            <FileText className='w-8 h-8 text-primary' />
          )}
        </div>
        <h2 className='text-2xl font-bold mb-1'>
          {result.passed
            ? t('exam.results.congrats')
            : t('exam.results.examCompleted')}
        </h2>
        <p className='text-sm text-muted-foreground'>
          {result.passed
            ? t('exam.results.passed')
            : t('exam.results.keepPracticing')}
        </p>
      </div>
      <div className='grid grid-cols-4 gap-3'>
        {stats.map(({ value, label, colored }) => (
          <div
            key={label}
            className='bg-background/50 rounded-lg p-3 text-center'
          >
            <div
              className={`text-2xl font-bold mb-0.5 ${colored ? 'text-primary' : ''}`}
            >
              {value}
            </div>
            <div className='text-xs text-muted-foreground'>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
