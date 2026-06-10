import { useTranslation } from 'react-i18next';
import type { Todo } from '@/services/types/todo.types';
import { isSameDay } from '../utils/dateHelpers';

interface DayCardProps {
  date: Date;
  todos: Todo[];
  selected: boolean;
  onSelect: () => void;
}

const DayCard = ({ date, todos, selected, onSelect }: DayCardProps) => {
  const { t, i18n } = useTranslation();
  const isToday = isSameDay(date, new Date());
  const done = todos.filter((td) => td.completed || td.status === 'DONE').length;
  const previewTodos = todos.slice(0, 3);
  const hidden = Math.max(0, todos.length - previewTodos.length);

  const weekday = date
    .toLocaleDateString(i18n.language, { weekday: 'short' })
    .toUpperCase();
  const dayNum = date.getDate();

  return (
    <button
      onClick={onSelect}
      className='text-left rounded-[12px] p-3 border transition-all flex flex-col gap-2 min-h-[140px]'
      style={{
        background: selected
          ? 'color-mix(in oklch, var(--pl-accent) 8%, var(--pl-bg-elev))'
          : 'var(--pl-bg-elev)',
        borderColor: selected
          ? 'var(--pl-accent)'
          : isToday
            ? 'var(--pl-accent-border)'
            : 'var(--pl-border)',
      }}
    >
      <div className='flex items-baseline justify-between'>
        <div>
          <div className='text-[9.5px] tracking-[0.18em] text-[var(--pl-text-faint)]'>
            {weekday}
          </div>
          <div
            className='text-[22px] font-display leading-none'
            style={{
              color: isToday ? 'var(--pl-accent-strong)' : 'var(--pl-text)',
            }}
          >
            {dayNum}
          </div>
        </div>
      </div>

      <div className='flex flex-col gap-1 flex-1'>
        {previewTodos.map((td) => {
          const isDone = td.completed || td.status === 'DONE';
          const accent = td.goalColor ?? 'var(--pl-text-faint)';
          return (
            <div
              key={td.id}
              className='flex items-center gap-1.5 text-[11px] truncate'
              style={{
                color: isDone ? 'var(--pl-text-faint)' : 'var(--pl-text-muted)',
              }}
            >
              <span
                className='w-1 h-1 rounded-full flex-shrink-0'
                style={{ background: accent }}
              />
              <span className={`truncate ${isDone ? 'line-through' : ''}`}>
                {td.title}
              </span>
            </div>
          );
        })}
        {hidden > 0 && (
          <div className='text-[10.5px] italic text-[var(--pl-text-faint)]'>
            {t('todo.week.more', { count: hidden })}
          </div>
        )}
      </div>

      {todos.length > 0 && (
        <div className='mt-auto'>
          <div className='h-[2px] rounded-full overflow-hidden bg-[var(--pl-border)]'>
            <div
              className='h-full rounded-full bg-[var(--pl-accent)] transition-all duration-300'
              style={{ width: `${Math.round((done / todos.length) * 100)}%` }}
            />
          </div>
          <div className='text-[10px] font-mono-pl text-[var(--pl-text-faint)] mt-1'>
            {done} / {todos.length}
          </div>
        </div>
      )}
      {todos.length === 0 && (
        <div className='text-[10px] font-mono-pl text-[var(--pl-text-faint)] mt-auto'>
          —
        </div>
      )}
    </button>
  );
};

export default DayCard;
