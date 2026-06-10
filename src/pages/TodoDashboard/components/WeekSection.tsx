import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ResourceRef, Todo } from '@/services/types/todo.types';
import {
  ResourceMentionInput,
  type MentionResourceType,
} from './SetMentionInput';
import {
  addDays,
  formatWeekRange,
  getMondayOfWeek,
  toIsoDate,
  todayIso,
} from '../utils/dateHelpers';
import DayCard from './DayCard';
import ExpandedTaskRow from './ExpandedTaskRow';

interface WeekSectionProps {
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
}

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

  const selectedDayTodos = useMemo(
    () =>
      (todosByDay.get(selectedDate) ?? []).slice().sort((a, b) => {
        const aDone = a.completed || a.status === 'DONE' ? 1 : 0;
        const bDone = b.completed || b.status === 'DONE' ? 1 : 0;
        return aDone - bDone;
      }),
    [todosByDay, selectedDate],
  );
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
  const isCurrentWeek =
    toIsoDate(weekStart) === toIsoDate(getMondayOfWeek(new Date()));

  const selectedLabel = new Date(selectedDate).toLocaleDateString(
    i18n.language,
    { weekday: 'long', month: 'short', day: 'numeric' },
  );

  return (
    <section className='mb-7'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-baseline gap-3'>
          <div className='text-[22px] font-display tracking-tight m-0 text-[var(--pl-text)]'>
            {t('todo.week.title')}
          </div>
          <span className='text-[12px] text-[var(--pl-text-muted)]'>
            {formatWeekRange(weekStart, i18n.language)}
            <span className='mx-1.5 text-[var(--pl-text-faint)]'>·</span>
            {t('todo.week.planned', { count: totalThisWeek })}
          </span>
        </div>
        <div className='flex items-center gap-1.5'>
          {!isCurrentWeek && (
            <Button variant='outline' size='sm' onClick={goThisWeek}>
              {t('todo.week.today')}
            </Button>
          )}
          <Button variant='outline' size='sm' onClick={goPrev}>
            <ChevronLeft className='w-4 h-4' />
          </Button>
          <Button variant='outline' size='sm' onClick={goNext}>
            <ChevronRight className='w-4 h-4' />
          </Button>
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

      <div className='rounded-[14px] p-5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]'>
        <div className='mb-3'>
          <div className='text-[10.5px] tracking-[0.18em] uppercase text-[var(--pl-accent-strong)] mb-0.5'>
            {t('todo.week.selectedHeader')}
          </div>
          <h3 className='text-[18px] font-display m-0 text-[var(--pl-text)]'>
            {selectedLabel}
          </h3>
        </div>

        <div className='flex gap-2 rounded-[12px] p-1.5 mb-3 bg-[var(--pl-bg)] border border-[var(--pl-border)]'>
          <ResourceMentionInput
            value={dayInput}
            onChange={setDayInput}
            onRefAdded={handleDayRefAdded}
            linkedRefs={dayRefs}
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
          <Button
            type='button'
            onClick={handleAddForSelected}
            disabled={isCreating}
            size='sm'
            className='rounded-[8px] text-[12.5px] flex-shrink-0'
          >
            <Plus className='w-3.5 h-3.5' />
            {t('todo.todoList.add')}
          </Button>
        </div>

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
