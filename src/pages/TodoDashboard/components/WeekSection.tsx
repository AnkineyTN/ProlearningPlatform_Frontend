import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import type { ResourceRef, Todo } from '@/services/types/todo.types';
import {
  ResourceMentionInput,
  renderTitleWithRefs,
  LinkedResourceChips,
  type MentionResourceType,
} from './SetMentionInput';
import {
  addDays,
  formatWeekRange,
  getMondayOfWeek,
  isSameDay,
  toIsoDate,
  todayIso,
} from '../utils/dateHelpers';

type WeekSectionProps = {
  todos: Todo[];
  isCreating: boolean;
  selectedGoalId: number | null;
  onToggleTodo: (id: number) => void;
  onDeleteTodo: (id: number) => void;
  onOpenTodo: (todo: Todo) => void;
  onCreateTodoForDate: (
    title: string,
    date: string,
    refs?: Partial<Record<MentionResourceType, ResourceRef[]>>,
  ) => void;
};

const DayCard = ({
  date,
  todos,
  selected,
  onSelect,
}: {
  date: Date;
  todos: Todo[];
  selected: boolean;
  onSelect: () => void;
}) => {
  const { t, i18n } = useTranslation();
  const isToday = isSameDay(date, new Date());
  const done = todos.filter(
    (td) => td.completed || td.status === 'DONE',
  ).length;
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
            className='text-[22px] font-[var(--font-display)] leading-none'
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

      <div className='text-[10px] font-[var(--font-mono-pl)] text-[var(--pl-text-faint)] mt-auto'>
        {todos.length === 0 ? '—' : `${done} / ${todos.length} done`}
      </div>
    </button>
  );
};

const ExpandedTaskRow = ({
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
        className={`w-[18px] h-[18px] rounded-full grid place-items-center flex-shrink-0 border ${
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
          className={`text-[13px] truncate ${isDone ? 'line-through text-[var(--pl-text-faint)]' : 'text-[var(--pl-text)]'}`}
        >
          {renderTitleWithRefs(todo.title, todo, isDone)}
        </div>
        <div className='flex items-center gap-1.5 mt-0.5 flex-wrap'>
          <span className='text-[10px] text-[var(--pl-text-faint)]'>
            {todo.priority}
          </span>
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

const WeekSection = ({
  todos,
  isCreating,
  selectedGoalId,
  onToggleTodo,
  onDeleteTodo,
  onOpenTodo,
  onCreateTodoForDate,
}: WeekSectionProps) => {
  const { t, i18n } = useTranslation();
  const [weekStart, setWeekStart] = useState<Date>(() =>
    getMondayOfWeek(new Date()),
  );
  const [selectedDate, setSelectedDate] = useState<string>(() => todayIso());
  const [dayInput, setDayInput] = useState('');
  const [dayRefs, setDayRefs] = useState<
    Record<MentionResourceType, ResourceRef[]>
  >({
    set: [],
    note: [],
    flashcard: [],
    exam: [],
  });

  const handleAddForSelected = () => {
    if (!dayInput.trim()) return;
    const hasRefs = Object.values(dayRefs).some((a) => a.length > 0);
    onCreateTodoForDate(
      dayInput.trim(),
      selectedDate,
      hasRefs ? dayRefs : undefined,
    );
    setDayInput('');
    setDayRefs({ set: [], note: [], flashcard: [], exam: [] });
  };

  const handleDayRefAdded = (type: MentionResourceType, ref: ResourceRef) => {
    setDayRefs((prev) => ({
      ...prev,
      [type]: prev[type].some((r) => r.id === ref.id)
        ? prev[type]
        : [...prev[type], ref],
    }));
  };

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const visibleTodos = useMemo(
    () =>
      selectedGoalId
        ? todos.filter((td) => td.goalId === selectedGoalId)
        : todos,
    [todos, selectedGoalId],
  );

  const todosByDay = useMemo(() => {
    const map = new Map<string, Todo[]>();
    days.forEach((d) => map.set(toIsoDate(d), []));
    visibleTodos.forEach((td) => {
      if (td.dueDate && map.has(td.dueDate)) {
        map.get(td.dueDate)!.push(td);
      }
    });
    return map;
  }, [visibleTodos, days]);

  const selectedDayTodos = todosByDay.get(selectedDate) ?? [];
  const totalThisWeek = days.reduce(
    (s, d) => s + (todosByDay.get(toIsoDate(d))?.length ?? 0),
    0,
  );

  const goPrev = () => setWeekStart((w) => addDays(w, -7));
  const goNext = () => setWeekStart((w) => addDays(w, 7));
  const goThisWeek = () => {
    setWeekStart(getMondayOfWeek(new Date()));
    setSelectedDate(todayIso());
  };

  const selectedLabel = new Date(selectedDate).toLocaleDateString(
    i18n.language,
    {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    },
  );

  return (
    <section className='mb-7'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-baseline gap-3'>
          <h2 className='text-[22px] font-[var(--font-display)] tracking-tight m-0 text-[var(--pl-text)]'>
            {t('todo.week.title')}
          </h2>
          <span className='text-[12px] text-[var(--pl-text-muted)]'>
            {formatWeekRange(weekStart, i18n.language)}
            <span className='mx-1.5 text-[var(--pl-text-faint)]'>·</span>
            {t('todo.week.planned', { count: totalThisWeek })}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          <button
            onClick={goThisWeek}
            className='text-[11.5px] px-3 py-1.5 rounded-[7px] border border-[var(--pl-border)] text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
          >
            {t('todo.week.today')}
          </button>
          <button
            onClick={goPrev}
            className='w-[30px] h-[30px] rounded-[7px] border border-[var(--pl-border)] grid place-items-center text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>
          <button
            onClick={goNext}
            className='w-[30px] h-[30px] rounded-[7px] border border-[var(--pl-border)] grid place-items-center text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4'>
        {days.map((d) => {
          const iso = toIsoDate(d);
          return (
            <DayCard
              key={iso}
              date={d}
              todos={todosByDay.get(iso) ?? []}
              selected={iso === selectedDate}
              onSelect={() => setSelectedDate(iso)}
            />
          );
        })}
      </div>

      {/* Expanded selected day */}
      <div className='rounded-[14px] p-5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'>
        <div className='mb-3'>
          <div className='text-[10.5px] tracking-[0.18em] uppercase text-[var(--pl-accent-strong)] mb-0.5'>
            {t('todo.week.selectedHeader')}
          </div>
          <h3 className='text-[18px] font-[var(--font-display)] m-0 text-[var(--pl-text)]'>
            {selectedLabel}
          </h3>
        </div>

        <div className='flex gap-2 rounded-[12px] p-1.5 mb-3 bg-[var(--pl-bg)] border border-[var(--pl-border)]'>
          <ResourceMentionInput
            value={dayInput}
            onChange={setDayInput}
            onRefAdded={handleDayRefAdded}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isCreating) {
                e.preventDefault();
                handleAddForSelected();
              }
            }}
            placeholder={t('todo.week.addPlaceholder', { date: selectedLabel })}
            className='w-full bg-transparent outline-none text-sm text-[var(--pl-text)] px-3 py-2'
            disabled={isCreating}
          />
          <button
            type='button'
            onClick={handleAddForSelected}
            disabled={isCreating}
            className='inline-flex items-center gap-1.5 rounded-[8px] text-[12.5px] px-4 font-medium disabled:opacity-60 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] flex-shrink-0'
          >
            <Plus className='w-3.5 h-3.5' />
            {t('todo.todoList.add')}
          </button>
        </div>
        {Object.values(dayRefs).some((arr) => arr.length > 0) && (
          <div className='flex flex-wrap gap-1.5 mb-2 px-1'>
            {Object.entries(dayRefs).flatMap(([, refs]) =>
              refs.map((ref) => (
                <span
                  key={ref.id}
                  className='inline-flex items-center gap-1 text-[10.5px] px-2 py-0.5 rounded-full bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
                >
                  {ref.title}
                </span>
              )),
            )}
          </div>
        )}

        {selectedDayTodos.length === 0 ? (
          <div className='text-center py-6 text-[12.5px] text-[var(--pl-text-faint)]'>
            {t('todo.week.dayEmpty')}
          </div>
        ) : (
          <div className='flex flex-col gap-0.5'>
            {selectedDayTodos.map((td) => (
              <ExpandedTaskRow
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
    </section>
  );
};

export default WeekSection;
