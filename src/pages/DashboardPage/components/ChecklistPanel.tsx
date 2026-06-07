import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { todoAPI } from '@/services/endpoints/todo';
import type { Todo } from '@/services/types/todo.types';
import { todayIso } from '@/pages/TodoDashboard/utils/dateHelpers';
import { Panel, PanelHead } from './Panel';

export function ChecklistPanel() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const today = todayIso();

  const { data: todosData, isLoading } = useQuery({
    queryKey: ['todos', 'today', today],
    queryFn: () => todoAPI.getTodos({ size: 200 }),
  });

  const todayTodos: Todo[] = useMemo(() => {
    const all = todosData?.data?.data ?? [];
    return all.filter((td) => td.dueDate === today);
  }, [todosData, today]);

  const toggleMutation = useMutation({
    mutationFn: todoAPI.toggleTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const done = todayTodos.filter(
    (t) => t.completed || t.status === 'DONE',
  ).length;
  const pct =
    todayTodos.length > 0 ? Math.round((done / todayTodos.length) * 100) : 0;

  return (
    <Panel>
      <PanelHead
        kicker="Today's practice"
        title='Daily checklist'
        right={
          <div className='flex items-center gap-3'>
            <span className='tabular-nums text-[12px] text-[var(--pl-text-muted)]'>
              {done}/{todayTodos.length} · {pct}%
            </span>
            <button
              onClick={() => navigate('/todo')}
              className='flex items-center gap-1 text-[12.5px] text-[var(--pl-text-muted)] bg-transparent border-0 cursor-pointer'
            >
              Open <ArrowRight size={11} />
            </button>
          </div>
        }
      />
      <div className='px-6 pb-2'>
        <div className='h-[3px] bg-[var(--pl-border)] rounded-full overflow-hidden'>
          <div
            className='h-full bg-[var(--pl-accent)] transition-[width] duration-400'
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className='px-3 pt-2 pb-4'>
        {isLoading ? (
          <p className='px-[14px] py-3 text-[13px] text-[var(--pl-text-faint)]'>
            Loading…
          </p>
        ) : todayTodos.length === 0 ? (
          <p className='px-[14px] py-3 text-[13px] text-[var(--pl-text-faint)]'>
            No tasks for today.
          </p>
        ) : (
          todayTodos.map((item) => {
            const isDone = item.completed || item.status === 'DONE';
            return (
              <button
                key={item.id}
                onClick={() => toggleMutation.mutate(item.id)}
                className='w-full flex items-center gap-3 px-3 py-[10px] rounded-[7px] text-left bg-transparent border-0 cursor-pointer transition-[background] duration-150 hover:bg-[var(--pl-bg-hover)]'
              >
                <div
                  className={cn(
                    'w-[18px] h-[18px] rounded-[5px] grid place-items-center shrink-0 transition-all duration-150',
                    isDone
                      ? 'bg-[var(--pl-accent)] border-[1.5px] border-[var(--pl-accent)]'
                      : 'bg-transparent border-[1.5px] border-[var(--pl-border-strong)]',
                  )}
                >
                  {isDone && (
                    <svg
                      width='10'
                      height='10'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='var(--pl-accent-fg)'
                      strokeWidth='2.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M20 6L9 17l-5-5' />
                    </svg>
                  )}
                </div>
                <span
                  className={cn(
                    'text-[13.5px] flex-1 min-w-0 truncate',
                    isDone
                      ? 'line-through text-[var(--pl-text-faint)]'
                      : 'text-[var(--pl-text)]',
                  )}
                >
                  {item.title}
                </span>
              </button>
            );
          })
        )}
      </div>
    </Panel>
  );
}
