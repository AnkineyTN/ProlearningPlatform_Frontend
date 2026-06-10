import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AlertCircle,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Flame,
  TrendingDown,
} from 'lucide-react';
import type { Goal, Todo } from '@/services/types/todo.types';
import { todayIso } from '../utils/dateHelpers';
import { renderTitleWithRefs } from './mentionTitleRenderer';

type Reason = 'overdue' | 'urgent' | 'stuck';

type SuggestedItem = {
  todo: Todo;
  reason: Reason;
  stuckGoalTitle?: string;
};

const REASON_STYLE: Record<Reason, { Icon: React.ElementType; color: string }> =
  {
    overdue: { Icon: AlertCircle, color: 'var(--pl-danger)' },
    urgent: { Icon: Flame, color: 'var(--pl-warning)' },
    stuck: { Icon: TrendingDown, color: 'var(--pl-accent)' },
  };

const MAX_PER_REASON = 3;

type WhatsNextPanelProps = {
  todos: Todo[];
  goals: Goal[];
  selectedGoalId: number | null;
  onToggleTodo: (id: number) => void;
  onOpenTodo: (todo: Todo) => void;
};

export default function WhatsNextPanel({
  todos,
  goals,
  selectedGoalId,
  onToggleTodo,
  onOpenTodo,
}: WhatsNextPanelProps) {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);

  const suggestions = useMemo<SuggestedItem[]>(() => {
    const today = todayIso();
    const sourceTodos = selectedGoalId
      ? todos.filter((td) => td.goalId === selectedGoalId)
      : todos;
    const pending = sourceTodos.filter(
      (td) => !td.completed && td.status !== 'DONE',
    );
    const usedIds = new Set<number>();

    const overdue = pending
      .filter((td) => td.dueDate && td.dueDate < today)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
      .slice(0, MAX_PER_REASON);
    overdue.forEach((td) => usedIds.add(td.id));

    const urgent = pending
      .filter((td) => td.priority === 'HIGH' && !usedIds.has(td.id))
      .slice(0, MAX_PER_REASON);
    urgent.forEach((td) => usedIds.add(td.id));

    const stuckGoal = goals
      .filter(
        (g) =>
          g.totalTodos > 0 && g.progress < 100 && g.status === 'IN_PROGRESS',
      )
      .sort((a, b) => a.progress - b.progress)[0];

    const stuck: SuggestedItem[] = stuckGoal
      ? pending
          .filter((td) => td.goalId === stuckGoal.id && !usedIds.has(td.id))
          .slice(0, MAX_PER_REASON)
          .map((td) => ({
            todo: td,
            reason: 'stuck' as Reason,
            stuckGoalTitle: stuckGoal.title,
          }))
      : [];

    return [
      ...overdue.map((td) => ({ todo: td, reason: 'overdue' as Reason })),
      ...urgent.map((td) => ({ todo: td, reason: 'urgent' as Reason })),
      ...stuck,
    ];
  }, [todos, goals, selectedGoalId]);

  if (suggestions.length === 0) return null;

  return (
    <div className='mb-7 rounded-[16px] border border-[var(--pl-border)] bg-[var(--pl-bg-elev)] overflow-hidden'>
      <button
        onClick={() => setCollapsed((v) => !v)}
        className='w-full flex items-center justify-between px-6 py-4 hover:bg-[var(--pl-bg-hover)] transition-colors'
      >
        <div className='flex items-center gap-3'>
          <span className='text-[10.5px] tracking-[0.18em] uppercase text-[var(--pl-accent-strong)]'>
            {t('todo.whatsNext.title')}
          </span>
          <span className='text-[10.5px] font-mono-pl px-1.5 py-0.5 rounded-full bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'>
            {suggestions.length}
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className='w-4 h-4 text-[var(--pl-text-faint)]' />
        ) : (
          <ChevronUp className='w-4 h-4 text-[var(--pl-text-faint)]' />
        )}
      </button>

      {!collapsed && (
        <div className='px-4 pb-4 flex flex-col gap-0.5'>
          {suggestions.map(({ todo, reason, stuckGoalTitle }) => {
            const { Icon, color } = REASON_STYLE[reason];
            const isDone = todo.completed || todo.status === 'DONE';
            const goalAccent = todo.goalColor ?? 'var(--pl-text-faint)';

            let reasonLabel: string;
            if (reason === 'overdue') reasonLabel = t('todo.whatsNext.overdue');
            else if (reason === 'urgent')
              reasonLabel = t('todo.whatsNext.urgent');
            else
              reasonLabel = `${t('todo.whatsNext.stuck')}: ${stuckGoalTitle}`;

            const dueFmt = todo.dueDate
              ? new Date(todo.dueDate + 'T00:00:00').toLocaleDateString(
                  i18n.language,
                  { month: 'short', day: 'numeric' },
                )
              : null;

            return (
              <div
                key={`${reason}-${todo.id}`}
                className='group flex items-center gap-3 rounded-[10px] px-3 py-2.5 hover:bg-[var(--pl-bg-hover)] transition-colors'
              >
                <button
                  onClick={() => onToggleTodo(todo.id)}
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

                <button
                  onClick={() => onOpenTodo(todo)}
                  className='flex-1 min-w-0 text-left'
                >
                  <div
                    className={`text-[13.5px] truncate ${isDone ? 'line-through text-[var(--pl-text-faint)]' : 'text-[var(--pl-text)]'}`}
                  >
                    {renderTitleWithRefs(todo.title, todo, isDone)}
                  </div>
                  <div className='flex items-center gap-1.5 mt-0.5 flex-wrap'>
                    <span
                      className='inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium'
                      style={{
                        color,
                        background: `color-mix(in oklch, ${color} 15%, transparent)`,
                      }}
                    >
                      <Icon className='w-2.5 h-2.5' />
                      {reasonLabel}
                    </span>
                    {dueFmt && reason === 'overdue' && (
                      <>
                        <span className='text-[10px] text-[var(--pl-text-faint)]'>
                          ·
                        </span>
                        <span className='text-[10px]' style={{ color }}>
                          {dueFmt}
                        </span>
                      </>
                    )}
                    {todo.goalTitle && reason !== 'stuck' && (
                      <>
                        <span className='text-[10px] text-[var(--pl-text-faint)]'>
                          ·
                        </span>
                        <span
                          className='text-[10px] truncate max-w-[150px]'
                          style={{ color: goalAccent }}
                        >
                          {todo.goalTitle}
                        </span>
                      </>
                    )}
                  </div>
                </button>
                {todo.calendarSynced && (
                  <CalendarCheck className='w-3.5 h-3.5 flex-shrink-0 text-[var(--pl-accent)]' />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
