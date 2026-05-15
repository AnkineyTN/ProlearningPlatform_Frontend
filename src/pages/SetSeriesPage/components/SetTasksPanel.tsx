import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useSet } from '@/hooks/useSets';
import { todoAPI } from '@/services/endpoints/todo';
import type { Todo } from '@/services/types/todo.types';
import { todayIso } from '@/pages/TodoDashboard/dateHelpers';

const Ring = ({ percent, size = 52 }: { percent: number; size?: number }) => {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;
  return (
    <div
      className='relative grid place-items-center'
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className='-rotate-90'>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill='none'
          stroke='var(--pl-border)'
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill='none'
          stroke='var(--pl-accent)'
          strokeWidth={stroke}
          strokeLinecap='round'
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 360ms ease' }}
        />
      </svg>
      <div className='absolute text-center'>
        <div className='text-[13px] font-[var(--font-display)] leading-none text-[var(--pl-text)]'>
          {percent}
        </div>
        <div className='text-[7.5px] tracking-[0.14em] uppercase text-[var(--pl-text-faint)]'>
          %
        </div>
      </div>
    </div>
  );
};

const TaskRow = ({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
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
        className={`w-[18px] h-[18px] rounded-full grid place-items-center flex-shrink-0 border transition-all ${
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
      <div className='flex-1 min-w-0'>
        <div
          className={`text-[13.5px] truncate ${isDone ? 'line-through text-[var(--pl-text-faint)]' : 'text-[var(--pl-text)]'}`}
        >
          {todo.title}
        </div>
        <div className='flex items-center gap-1.5 mt-0.5 flex-wrap'>
          <span className='text-[10px] text-[var(--pl-text-faint)]'>
            {todo.priority}
          </span>
          {todo.goalTitle && (
            <>
              <span className='text-[10px] text-[var(--pl-text-faint)]'>·</span>
              <span
                className='text-[10px] truncate max-w-[120px]'
                style={{ color: accent }}
              >
                {todo.goalTitle}
              </span>
            </>
          )}
          {todo.dueDate && (
            <>
              <span className='text-[10px] text-[var(--pl-text-faint)]'>·</span>
              <span className='text-[10px] text-[var(--pl-text-faint)]'>
                {todo.dueDate}
              </span>
            </>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(todo.id)}
        className='opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-[var(--pl-bg-elev)] text-[var(--pl-text-faint)]'
      >
        <Trash2 className='w-3 h-3' />
      </button>
    </div>
  );
};

type SetTasksPanelProps = {
  setId: number;
};

export default function SetTasksPanel({ setId }: SetTasksPanelProps) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [input, setInput] = useState('');
  const [showDone, setShowDone] = useState(false);

  const { data: setDetail } = useSet(setId);
  const setTitle: string = (setDetail as { title?: string })?.title ?? '';

  const { data: todosData } = useQuery({
    queryKey: ['todos', 'all'],
    queryFn: () => todoAPI.getTodos({ size: 200 }),
  });

  const allTodos: Todo[] = todosData?.data?.data ?? [];
  const setTodos = allTodos.filter((td) =>
    td.setRefs?.some((r) => r.id === setId),
  );
  const doneTodos = setTodos.filter(
    (td) => td.completed || td.status === 'DONE',
  );
  const pendingTodos = setTodos.filter(
    (td) => !td.completed && td.status !== 'DONE',
  );
  const percent =
    setTodos.length > 0
      ? Math.round((doneTodos.length / setTodos.length) * 100)
      : 0;

  const createTodo = useMutation({
    mutationFn: todoAPI.createTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      setInput('');
    },
  });

  const toggleTodo = useMutation({
    mutationFn: todoAPI.toggleTodo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });

  const deleteTodo = useMutation({
    mutationFn: todoAPI.deleteTodo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });

  const handleAdd = () => {
    if (!input.trim() || createTodo.isPending) return;
    createTodo.mutate({
      title: input.trim(),
      dueDate: todayIso(),
      setRefs: [{ id: setId, setId: null, title: setTitle || null }],
    });
  };

  return (
    <div className='px-10 pt-4'>
      <div className='rounded-[16px] p-6 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'>
        {/* Header */}
        <div className='flex items-start justify-between mb-5'>
          <div>
            <div className='text-[10.5px] tracking-[0.18em] uppercase mb-1.5 text-[var(--pl-accent-strong)]'>
              {t('set.tasks.header')}
            </div>
            <h2 className='text-[24px] tracking-tight leading-[1.05] font-[var(--font-display)] text-[var(--pl-text)] m-0'>
              {setTodos.length === 0
                ? t('set.tasks.emptyHeadline')
                : t('set.tasks.headline', { count: setTodos.length })}
            </h2>
            <div className='text-[12px] text-[var(--pl-text-muted)] mt-1'>
              <span className='font-semibold text-[var(--pl-text)]'>
                {doneTodos.length}
              </span>{' '}
              {t('todo.today.done')}
              <span className='mx-1.5 text-[var(--pl-text-faint)]'>·</span>
              <span className='font-semibold text-[var(--pl-text)]'>
                {pendingTodos.length}
              </span>{' '}
              {t('todo.today.pending')}
            </div>
          </div>
          <Ring percent={percent} />
        </div>

        {/* Quick add */}
        <div className='flex gap-2 rounded-[12px] p-1.5 mb-4 bg-[var(--pl-bg)] border border-[var(--pl-border)]'>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder={t('set.tasks.addPlaceholder')}
            className='w-full bg-transparent outline-none text-sm text-[var(--pl-text)] px-3 py-2 placeholder:text-[var(--pl-text-faint)]'
            disabled={createTodo.isPending}
          />
          <button
            onClick={handleAdd}
            disabled={createTodo.isPending || !input.trim()}
            className='inline-flex items-center gap-1.5 rounded-[8px] text-[12.5px] px-4 font-medium disabled:opacity-60 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] flex-shrink-0'
          >
            <Plus className='w-3.5 h-3.5' />
            {t('todo.todoList.add')}
          </button>
        </div>

        {/* Task list */}
        {setTodos.length === 0 ? (
          <div className='text-center py-10 text-[var(--pl-text-faint)] text-[13px] italic font-[var(--font-serif)]'>
            {t('set.tasks.empty')}
          </div>
        ) : (
          <div className='flex flex-col gap-4'>
            {pendingTodos.length > 0 && (
              <div>
                <div className='flex items-center gap-2 mb-2'>
                  <span className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
                    {t('set.tasks.pendingSection')}
                  </span>
                  <span className='text-[10px] font-[var(--font-mono-pl)] text-[var(--pl-text-faint)]'>
                    {pendingTodos.length}
                  </span>
                  <div className='flex-1 h-px bg-[var(--pl-border)]' />
                </div>
                <div className='flex flex-col gap-0.5'>
                  {pendingTodos.map((td) => (
                    <TaskRow
                      key={td.id}
                      todo={td}
                      onToggle={(id) => toggleTodo.mutate(id)}
                      onDelete={(id) => deleteTodo.mutate(id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {doneTodos.length > 0 && (
              <div>
                <button
                  onClick={() => setShowDone((v) => !v)}
                  className='flex items-center gap-2 mb-2 w-full text-left'
                >
                  <span className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
                    {t('set.tasks.doneSection')}
                  </span>
                  <span className='text-[10px] font-[var(--font-mono-pl)] text-[var(--pl-text-faint)]'>
                    {doneTodos.length}
                  </span>
                  <div className='flex-1 h-px bg-[var(--pl-border)]' />
                  {showDone ? (
                    <ChevronUp className='w-3 h-3 text-[var(--pl-text-faint)]' />
                  ) : (
                    <ChevronDown className='w-3 h-3 text-[var(--pl-text-faint)]' />
                  )}
                </button>
                {showDone && (
                  <div className='flex flex-col gap-0.5'>
                    {doneTodos.map((td) => (
                      <TaskRow
                        key={td.id}
                        todo={td}
                        onToggle={(id) => toggleTodo.mutate(id)}
                        onDelete={(id) => deleteTodo.mutate(id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
