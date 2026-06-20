import { Pencil, Trash2 } from 'lucide-react';
import type { Goal } from '@/services/types/todo.types';

const GoalProgressRow = ({
  goal,
  selected,
  onSelect,
  onEdit,
  onDelete,
}: {
  goal: Goal;
  selected: boolean;
  onSelect: (id: number) => void;
  onEdit: (g: Goal) => void;
  onDelete: (id: number) => void;
}) => {
  const accent = goal.color ?? '#6366f1';
  return (
    <div
      onClick={() => onSelect(goal.id)}
      className='group w-full flex items-center gap-3 py-2 px-2 -mx-2 rounded-[8px] transition-colors text-left cursor-pointer'
      style={{
        background: selected
          ? `color-mix(in oklch, ${accent} 12%, var(--pl-bg-elev))`
          : 'transparent',
        outline: selected
          ? `1.5px solid color-mix(in oklch, ${accent} 40%, transparent)`
          : 'none',
      }}
    >
      <span
        className='w-2 h-2 rounded-full flex-shrink-0'
        style={{ background: accent }}
      />
      <div className='flex-1 min-w-0'>
        <div className='flex items-baseline justify-between gap-3 mb-1'>
          <div className='text-[13px] font-medium truncate text-[var(--pl-text)]'>
            {goal.title}
          </div>
          <div className='flex items-center gap-2 flex-shrink-0'>
            <span className='text-[10.5px] font-mono-pl text-[var(--pl-text-faint)]'>
              {goal.completedTodos}/{goal.totalTodos}
            </span>
            <span
              className='text-[11.5px] font-semibold'
              style={{ color: accent }}
            >
              {goal.progress}%
            </span>
          </div>
        </div>
        <div className='h-1 rounded-full overflow-hidden bg-[var(--pl-bg-hover)]'>
          <div
            className='h-full rounded-full transition-all'
            style={{ width: `${goal.progress}%`, background: accent }}
          />
        </div>
      </div>
      <div className='flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(goal);
          }}
          className='p-1 rounded hover:bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]'
        >
          <Pencil className='w-3 h-3' />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(goal.id);
          }}
          className='p-1 rounded hover:bg-[var(--pl-bg-hover)] text-destructive'
        >
          <Trash2 className='w-3 h-3' />
        </button>
      </div>
    </div>
  );
};

export default GoalProgressRow;
