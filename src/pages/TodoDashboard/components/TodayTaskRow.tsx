import { CalendarCheck, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PRIORITY_CLASS } from '../constants';
import { LinkedResourceChips, renderTitleWithRefs } from './SetMentionInput';

import type { Todo } from '@/services/types/todo.types';
const TodayTaskRow = ({
  todo,
  onToggle,
  onOpen,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onOpen: (todo: Todo) => void;
  onDelete: (id: number) => void;
}) => {
  const { t } = useTranslation();
  const isDone = todo.completed || todo.status === 'DONE';
  const accent = todo.goalColor ?? 'var(--pl-text-faint)';

  return (
    <div className='group flex items-center gap-3 rounded-[10px] px-3 py-2.5 hover:bg-[var(--pl-bg-hover)] transition-colors'>
      <span
        className='w-[3px] self-stretch rounded-full flex-shrink-0'
        style={{ background: accent }}
      />
      <button
        onClick={() => onToggle(todo.id)}
        className={`cursor-pointer w-[18px] h-[18px] rounded-full grid place-items-center flex-shrink-0 transition-all border ${
          isDone
            ? 'bg-[var(--pl-accent)] border-[var(--pl-accent)]'
            : 'bg-transparent border-[var(--pl-border-strong)]'
        }`}
      >
        {isDone && (
          <svg
            viewBox='0 0 24 24'
            width={11}
            height={11}
            stroke='var(--pl-accent-fg)'
            fill='none'
            strokeWidth={2.8}
            strokeLinecap='round'
            strokeLinejoin='round'
          >
            <path d='M20 6L9 17l-5-5' />
          </svg>
        )}
      </button>
      <button onClick={() => onOpen(todo)} className='flex-1 min-w-0 text-left'>
        <div
          className={`text-[13.5px] truncate ${isDone ? 'line-through text-[var(--pl-text-faint)]' : 'text-[var(--pl-text)]'}`}
        >
          {renderTitleWithRefs(todo.title, todo, isDone)}
        </div>
        <div className='flex items-center gap-1.5 mt-0.5 flex-wrap'>
          {todo.priority !== 'LOW' && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_CLASS[todo.priority]}`}
            >
              {todo.priority}
            </span>
          )}
          {todo.goalTitle && (
            <>
              <span className='text-[10px] text-[var(--pl-text-faint)]'>·</span>
              <span className='text-[10px] truncate' style={{ color: accent }}>
                {todo.goalTitle}
              </span>
            </>
          )}
          <LinkedResourceChips todo={todo} />
        </div>
      </button>
      {todo.calendarSynced && (
        <Tooltip>
          <TooltipTrigger asChild>
            <CalendarCheck className='w-3.5 h-3.5 flex-shrink-0 text-[var(--pl-accent)]' />
          </TooltipTrigger>
          <TooltipContent>{t('todo.item.calendarSynced')}</TooltipContent>
        </Tooltip>
      )}
      <button
        onClick={() => onDelete(todo.id)}
        className='opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-[var(--pl-bg-elev)] text-[var(--pl-text-faint)]'
      >
        <Trash2 className='w-3 h-3' />
      </button>
    </div>
  );
};

export default TodayTaskRow;
