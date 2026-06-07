import { CheckCircle2, Circle, Flag, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type TodoStatsProps = {
  completedCount: number;
  totalTodos: number;
  goalsCount: number;
};

const TodoStats = ({
  completedCount,
  totalTodos,
  goalsCount,
}: TodoStatsProps) => {
  const { t } = useTranslation();

  const stats = [
    {
      label: t('todo.stats.completed'),
      value: completedCount,
      Icon: CheckCircle2,
      color: 'oklch(0.72 0.15 155)',
    },
    {
      label: t('todo.stats.pending'),
      value: totalTodos - completedCount,
      Icon: Circle,
      color: 'var(--pl-accent)',
    },
    {
      label: t('todo.stats.total'),
      value: totalTodos,
      Icon: Flag,
      color: 'var(--pl-text-faint)',
    },
    {
      label: t('todo.stats.goals'),
      value: goalsCount,
      Icon: Target,
      color: 'var(--pl-text-faint)',
    },
  ];

  return (
    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-7'>
      {stats.map((s) => (
        <div
          key={s.label}
          className='flex flex-col gap-2 rounded-[14px] py-[18px] px-5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'
        >
          <div className='flex justify-between items-center'>
            <s.Icon className='w-3.5 h-3.5' style={{ color: s.color }} />
            <span className='text-[10.5px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
              {s.label}
            </span>
          </div>
          <div className='text-[36px] tracking-tight leading-none font-[var(--font-display)] text-[var(--pl-text)]'>
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoStats;
