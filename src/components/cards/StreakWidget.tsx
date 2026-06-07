import { Flame, AlertTriangle, CheckCircle, Circle } from 'lucide-react';
import { useStreak } from '@/hooks/useActivityLog';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const StreakWidget = () => {
  const { t } = useTranslation();
  const { data: streak, isLoading } = useStreak();

  if (isLoading || !streak) {
    return (
      <Card className='p-4 space-y-3 animate-pulse'>
        <div className='h-4 bg-muted rounded w-1/2' />
        <div className='h-8 bg-muted rounded w-1/3' />
      </Card>
    );
  }

  return (
    <Card className='p-4 space-y-4'>
      <h3 className='text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
        {t('streak.title', { defaultValue: 'Learning Streak' })}
      </h3>

      <div className='flex items-center gap-3'>
        {streak.studiedToday ? (
          <Flame className='w-8 h-8 text-[var(--pl-accent)]' />
        ) : (
          <AlertTriangle className='w-8 h-8 text-[var(--pl-warning)]' />
        )}
        <div>
          <p className='text-3xl font-bold leading-none'>
            {streak.currentStreak}
          </p>
          <p className='text-xs text-muted-foreground mt-0.5'>
            {t('streak.days', { defaultValue: 'days' })}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 text-sm'>
        <div className='bg-muted/40 rounded-md p-2'>
          <p className='text-muted-foreground text-xs'>
            {t('streak.longest', { defaultValue: 'Longest' })}
          </p>
          <p className='font-semibold'>
            {streak.longestStreak} {t('streak.days', { defaultValue: 'days' })}
          </p>
        </div>
        <div className='bg-muted/40 rounded-md p-2'>
          <p className='text-muted-foreground text-xs'>
            {t('streak.today', { defaultValue: 'Today' })}
          </p>
          <p className='font-semibold flex items-center gap-1'>
            {streak.studiedToday ? (
              <>
                <CheckCircle className='w-3.5 h-3.5 text-[var(--pl-success)]' />
                {t('streak.done', { defaultValue: 'Done' })}
              </>
            ) : (
              <>
                <Circle className='w-3.5 h-3.5 text-muted-foreground' />
                {t('streak.notYet', { defaultValue: 'Not yet' })}
              </>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default StreakWidget;
