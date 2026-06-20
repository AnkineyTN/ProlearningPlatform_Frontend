import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarCheck,
  ChevronDown,
  Filter,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import type {
  Goal,
  ResourceRef,
  Todo,
  TodoPriority,
  TodoStatus,
} from '@/services/types/todo.types';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PRIORITY_CLASS: Record<TodoPriority, string> = {
  HIGH: 'text-[var(--pl-danger-text)] bg-[var(--pl-danger-soft)]',
  MEDIUM: 'text-[var(--pl-warning-text)] bg-[var(--pl-warning-soft)]',
  LOW: 'text-[var(--pl-text-faint)] bg-transparent',
} as const;

const effectiveStatus = (todo: Todo): TodoStatus =>
  todo.completed || todo.status === 'DONE' ? 'DONE' : todo.status;

const PRIORITY_OPTIONS: TodoPriority[] = ['HIGH', 'MEDIUM', 'LOW'];
const STATUS_OPTIONS: TodoStatus[] = ['TODO', 'DONE', 'SKIPPED'];

const PRIORITY_LABEL_KEY: Record<TodoPriority, string> = {
  HIGH: 'todo.filter.priorityHigh',
  MEDIUM: 'todo.filter.priorityMedium',
  LOW: 'todo.filter.priorityLow',
};
const STATUS_LABEL_KEY: Record<TodoStatus, string> = {
  TODO: 'todo.filter.statusTodo',
  DONE: 'todo.filter.statusDone',
  SKIPPED: 'todo.filter.statusSkipped',
};

const STATUS_BADGE_CLASS: Record<TodoStatus, string> = {
  TODO: 'border-[var(--pl-border)] bg-[var(--pl-bg-hover)] text-[var(--pl-text-muted)]',
  DONE: 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]',
  SKIPPED:
    'border-[var(--pl-border)] bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]',
};

const PRIORITY_BADGE_CLASS: Record<TodoPriority, string> = {
  HIGH: 'border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)] text-[var(--pl-danger-text)]',
  MEDIUM:
    'border-[var(--pl-warning-border)] bg-[var(--pl-warning-soft)] text-[var(--pl-warning-text)]',
  LOW: 'border-[var(--pl-border)] bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]',
};
import {
  ResourceMentionInput,
  renderTitleWithRefs,
  LinkedResourceChips,
  type MentionResourceType,
} from './SetMentionInput';
import { todayIso } from '../utils/dateHelpers';
import { Button } from '@/components/ui/button';

type TodaySectionProps = {
  todos: Todo[];
  goals: Goal[];
  newTask: string;
  newTaskRefs: Record<MentionResourceType, ResourceRef[]>;
  isCreating: boolean;
  selectedGoalId: number | null;
  onSelectGoal: (id: number | null) => void;
  onNewTaskChange: (v: string) => void;
  onNewTaskRefAdded: (type: MentionResourceType, ref: ResourceRef) => void;
  onAddTask: () => void;
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodo: (todo: Todo) => void;
  onNewGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: number) => void;
};

const Ring = ({ percent, size = 64 }: { percent: number; size?: number }) => {
  const stroke = 5;
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
        <div className='text-[15px] font-display leading-none text-[var(--pl-text)]'>
          {percent}
        </div>
        <div className='text-[8.5px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
          %
        </div>
      </div>
    </div>
  );
};

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
        className={`w-[18px] h-[18px] rounded-full grid place-items-center flex-shrink-0 transition-all border ${
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
        <CalendarCheck className='w-3.5 h-3.5 flex-shrink-0 text-[var(--pl-accent)]' />
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

const TodaySection = ({
  todos,
  goals,
  newTask,
  newTaskRefs,
  isCreating,
  selectedGoalId,
  onSelectGoal,
  onNewTaskChange,
  onNewTaskRefAdded,
  onAddTask,
  onToggleTodo,
  onDeleteTodo,
  onOpenTodo,
  onNewGoal,
  onEditGoal,
  onDeleteGoal,
}: TodaySectionProps) => {
  const { t, i18n } = useTranslation();
  const today = todayIso();

  const [priorityFilter, setPriorityFilter] = useState<TodoPriority[]>([]);
  const [statusFilter, setStatusFilter] = useState<TodoStatus[]>([]);
  const [unassignedOnly, setUnassignedOnly] = useState(false);

  const togglePriority = (p: TodoPriority) =>
    setPriorityFilter((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  const toggleStatus = (s: TodoStatus) =>
    setStatusFilter((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const todayTodos = useMemo(
    () =>
      todos
        .filter(
          (td) =>
            td.dueDate === today &&
            (!selectedGoalId || td.goalId === selectedGoalId) &&
            (!unassignedOnly || td.goalId === null) &&
            (priorityFilter.length === 0 ||
              priorityFilter.includes(td.priority)) &&
            (statusFilter.length === 0 ||
              statusFilter.includes(effectiveStatus(td))),
        )
        .sort((a, b) => {
          const aDone = a.completed || a.status === 'DONE' ? 1 : 0;
          const bDone = b.completed || b.status === 'DONE' ? 1 : 0;
          return aDone - bDone;
        }),
    [
      todos,
      today,
      selectedGoalId,
      unassignedOnly,
      priorityFilter,
      statusFilter,
    ],
  );

  const hasActiveFilters =
    !!selectedGoalId ||
    unassignedOnly ||
    priorityFilter.length > 0 ||
    statusFilter.length > 0;

  const selectedGoal = selectedGoalId
    ? goals.find((g) => g.id === selectedGoalId)
    : null;

  const doneCount = todayTodos.filter(
    (td) => td.completed || td.status === 'DONE',
  ).length;
  const pendingCount = todayTodos.length - doneCount;
  const todayPercent =
    todayTodos.length > 0
      ? Math.round((doneCount / todayTodos.length) * 100)
      : 0;

  const totalDone = goals.reduce((s, g) => s + g.completedTodos, 0);
  const totalAll = goals.reduce((s, g) => s + g.totalTodos, 0);
  const overallPercent =
    totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  const longGoals = goals.filter((g) => g.type === 'LONG');
  const shortGoals = goals.filter((g) => g.type === 'SHORT');

  const todayLabel = new Date().toLocaleDateString(i18n.language, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5 mb-7'>
      {/* LEFT: Today */}
      <div className='rounded-[16px] p-6 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'>
        <div className='flex items-start justify-between mb-4'>
          <div>
            <div className='text-[10.5px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-accent-strong)]'>
              {t('todo.today.label')} · {todayLabel}
            </div>
            <h2 className='text-[28px] tracking-tight leading-[1.05] font-display text-[var(--pl-text)] m-0'>
              {todayTodos.length === 0
                ? t('todo.today.emptyHeadline')
                : t('todo.today.headline', { count: todayTodos.length })}
            </h2>
            <div className='text-[12px] text-[var(--pl-text-muted)] mt-1.5'>
              <span className='font-semibold text-[var(--pl-text)]'>
                {doneCount}
              </span>{' '}
              {t('todo.today.done')}
              <span className='mx-1.5 text-[var(--pl-text-faint)]'>·</span>
              <span className='font-semibold text-[var(--pl-text)]'>
                {pendingCount}
              </span>{' '}
              {t('todo.today.pending')}
            </div>
          </div>
          <Ring percent={todayPercent} />
        </div>

        {/* Quick add — type /set, /note, /flashcard, /exam to link resources */}
        <div className='flex gap-2 rounded-[12px] p-1.5 mb-3 bg-[var(--pl-bg)] border border-[var(--pl-border)]'>
          <ResourceMentionInput
            value={newTask}
            onChange={onNewTaskChange}
            onRefAdded={onNewTaskRefAdded}
            linkedRefs={newTaskRefs}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isCreating) {
                e.preventDefault();
                onAddTask();
              }
            }}
            placeholder={t('todo.today.quickAddPlaceholder')}
            className='w-full bg-transparent outline-none text-sm text-[var(--pl-text)] px-3 py-2'
            disabled={isCreating}
          />
          <Button type='button' onClick={onAddTask} disabled={isCreating}>
            <Plus className='w-3.5 h-3.5' />
            {t('todo.todoList.add')}
          </Button>
        </div>

        {/* Filters: priority & status (multi-select) */}
        <div className='flex items-center gap-2 mb-2 flex-wrap'>
          <Filter className='w-3.5 h-3.5 text-[var(--pl-text-faint)]' />

          <DropdownMenu>
            <DropdownMenuTrigger
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-[12px] outline-none transition-colors ${
                priorityFilter.length > 0
                  ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
                  : 'border-[var(--pl-border)] text-[var(--pl-text-muted)] hover:bg-[var(--pl-bg-hover)]'
              }`}
            >
              {priorityFilter.length > 0
                ? `${t('todo.filter.priorityLabel')} · ${priorityFilter.length}`
                : t('todo.filter.priorityAll')}
              <ChevronDown className='w-3.5 h-3.5 opacity-60' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='min-w-[10rem]'>
              {PRIORITY_OPTIONS.map((p) => (
                <DropdownMenuCheckboxItem
                  key={p}
                  checked={priorityFilter.includes(p)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => togglePriority(p)}
                >
                  {t(PRIORITY_LABEL_KEY[p])}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-[12px] outline-none transition-colors ${
                statusFilter.length > 0
                  ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
                  : 'border-[var(--pl-border)] text-[var(--pl-text-muted)] hover:bg-[var(--pl-bg-hover)]'
              }`}
            >
              {statusFilter.length > 0
                ? `${t('todo.filter.statusLabel')} · ${statusFilter.length}`
                : t('todo.filter.statusAll')}
              <ChevronDown className='w-3.5 h-3.5 opacity-60' />
            </DropdownMenuTrigger>
            <DropdownMenuContent align='start' className='min-w-[10rem]'>
              {STATUS_OPTIONS.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statusFilter.includes(s)}
                  onSelect={(e) => e.preventDefault()}
                  onCheckedChange={() => toggleStatus(s)}
                >
                  {t(STATUS_LABEL_KEY[s])}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type='button'
            onClick={() => {
              setUnassignedOnly((prev) => {
                const next = !prev;
                if (next) onSelectGoal(null);
                return next;
              });
            }}
            className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-[12px] transition-colors ${
              unassignedOnly
                ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
                : 'border-[var(--pl-border)] text-[var(--pl-text-muted)] hover:bg-[var(--pl-bg-hover)]'
            }`}
          >
            {t('todo.filter.noGoal')}
          </button>

          {hasActiveFilters && (
            <button
              onClick={() => {
                onSelectGoal(null);
                setUnassignedOnly(false);
                setPriorityFilter([]);
                setStatusFilter([]);
              }}
              className='inline-flex items-center gap-1 text-[10.5px] text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] transition-colors'
            >
              <X className='w-3 h-3' />
              {t('todo.filter.clear')}
            </button>
          )}
        </div>

        {/* Active filter badges */}
        {(selectedGoal ||
          priorityFilter.length > 0 ||
          statusFilter.length > 0) && (
          <div className='flex items-center gap-1.5 mb-3 flex-wrap'>
            {selectedGoal && (
              <span
                className='inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-medium'
                style={{
                  background: `color-mix(in oklch, ${selectedGoal.color ?? '#6366f1'} 15%, transparent)`,
                  color: selectedGoal.color ?? '#6366f1',
                }}
              >
                <Filter className='w-2.5 h-2.5' />
                {selectedGoal.title}
                <button
                  onClick={() => onSelectGoal(null)}
                  className='hover:opacity-70 transition-opacity'
                >
                  <X className='w-2.5 h-2.5' />
                </button>
              </span>
            )}
            {priorityFilter.map((p) => (
              <span
                key={`pb-${p}`}
                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium border ${PRIORITY_BADGE_CLASS[p]}`}
              >
                {t(PRIORITY_LABEL_KEY[p])}
                <button
                  onClick={() => togglePriority(p)}
                  className='hover:opacity-70 transition-opacity'
                >
                  <X className='w-2.5 h-2.5' />
                </button>
              </span>
            ))}
            {statusFilter.map((s) => (
              <span
                key={`sb-${s}`}
                className={`inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full font-medium border ${STATUS_BADGE_CLASS[s]}`}
              >
                {t(STATUS_LABEL_KEY[s])}
                <button
                  onClick={() => toggleStatus(s)}
                  className='hover:opacity-70 transition-opacity'
                >
                  <X className='w-2.5 h-2.5' />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Today list */}
        {todayTodos.length === 0 ? (
          <div className='text-center py-8 text-[var(--pl-text-faint)] text-[12.5px]'>
            {priorityFilter.length > 0 ||
            statusFilter.length > 0 ||
            unassignedOnly
              ? t('todo.filter.emptyForFilters')
              : selectedGoal
                ? t('todo.filter.emptyForGoal')
                : t('todo.today.empty')}
          </div>
        ) : (
          <div className='flex flex-col gap-0.5 max-h-90 overflow-auto'>
            {todayTodos.map((td) => (
              <TodayTaskRow
                key={td.id}
                todo={td}
                onToggle={onToggleTodo}
                onOpen={onOpenTodo}
                onDelete={onDeleteTodo}
              />
            ))}
          </div>
        )}
      </div>

      {/* RIGHT: Overall progress */}
      <div className='rounded-[16px] p-6 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'>
        <div className='flex items-start justify-between mb-3'>
          <div className='text-[10.5px] tracking-[0.18em] uppercase text-[var(--pl-accent-strong)]'>
            {t('todo.overall.title')}
          </div>
          <Button
            onClick={onNewGoal}
            variant='outline'
            size='xs'
            className='text-[11px] gap-1'
          >
            <Plus className='w-1 h-1' />
            {t('todo.overall.newGoal')}
          </Button>
        </div>

        <div className='text-[44px] tracking-tight leading-none mb-3 font-display text-[var(--pl-text)]'>
          {overallPercent}%
        </div>
        <div className='h-1 rounded-full overflow-hidden mb-2 bg-[var(--pl-bg-hover)]'>
          <div
            className='h-full rounded-full transition-all bg-[var(--pl-accent)]'
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <div className='text-[11.5px] italic font-serif text-[var(--pl-text-muted)] mb-5'>
          {t('todo.overall.detail', {
            done: totalDone,
            pending: totalAll - totalDone,
            count: goals.length,
          })}
        </div>

        {/* LONG goals */}
        <div className='mb-5'>
          <div className='flex items-center gap-2 mb-1.5'>
            <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
              {t('todo.overall.longHeader')}
            </div>
            <span className='text-[10px] font-mono-pl text-[var(--pl-text-faint)]'>
              {longGoals.length}
            </span>
            <div className='flex-1 h-px bg-[var(--pl-border)]' />
          </div>
          {longGoals.length === 0 ? (
            <div className='text-[11.5px] italic text-[var(--pl-text-faint)] py-2'>
              {t('todo.overall.emptyLong')}
            </div>
          ) : (
            <div className='flex flex-col max-h-43 overflow-auto'>
              {longGoals.map((g) => (
                <GoalProgressRow
                  key={g.id}
                  goal={g}
                  selected={selectedGoalId === g.id}
                  onSelect={(id) =>
                    onSelectGoal(selectedGoalId === id ? null : id)
                  }
                  onEdit={onEditGoal}
                  onDelete={onDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>

        {/* SHORT goals */}
        <div>
          <div className='flex items-center gap-2 mb-1.5'>
            <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
              {t('todo.overall.shortHeader')}
            </div>
            <span className='text-[10px] font-mono-pl text-[var(--pl-text-faint)]'>
              {shortGoals.length}
            </span>
            <div className='flex-1 h-px bg-[var(--pl-border)]' />
          </div>
          {shortGoals.length === 0 ? (
            <div className='text-[11.5px] italic text-[var(--pl-text-faint)] py-2'>
              {t('todo.overall.emptyShort')}
            </div>
          ) : (
            <div className='flex flex-col max-h-43 overflow-auto'>
              {shortGoals.map((g) => (
                <GoalProgressRow
                  key={g.id}
                  goal={g}
                  selected={selectedGoalId === g.id}
                  onSelect={(id) =>
                    onSelectGoal(selectedGoalId === id ? null : id)
                  }
                  onEdit={onEditGoal}
                  onDelete={onDeleteGoal}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodaySection;
