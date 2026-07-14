import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarX2 } from 'lucide-react';

import { apiErrorMessage } from '@/lib/apiError';
import { todoAPI } from '@/services/endpoints/todo';
import { useCalendarStatus } from '@/hooks/useCalendar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import GoalModal from './components/GoalModal';
import TodaySection from './components/TodaySection';
import TodoDetailModal from './components/TodoDetailModal';
import TodoStats from './components/TodoStats';
import WeekSection from './components/WeekSection';
import WhatsNextPanel from './components/WhatsNextPanel';
import YearSection from './components/YearSection';
import { todayIso } from './utils/dateHelpers';

import type { Goal, ResourceRef, Todo } from '@/services/types/todo.types';
import type { MentionResourceType } from './components/SetMentionInput';
const TodoDashboard = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [newTask, setNewTask] = useState('');
  const [calendarBannerDismissed, setCalendarBannerDismissed] = useState(false);
  const [newTaskRefs, setNewTaskRefs] = useState<
    Record<MentionResourceType, ResourceRef[]>
  >({
    set: [],
    note: [],
    flashcard: [],
    exam: [],
  });
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const { data: calendarStatus, isSuccess: calendarLoaded } = useCalendarStatus();
  const showCalendarBanner =
    calendarLoaded && !calendarStatus?.connected && !calendarBannerDismissed;

  const { data: todosData } = useQuery({
    queryKey: ['todos', 'all'],
    queryFn: () => todoAPI.getTodos({ size: 200 }),
  });

  const { data: goalsData } = useQuery({
    queryKey: ['goals'],
    queryFn: () => todoAPI.getGoals({ size: 100 }),
  });

  const todos: Todo[] = todosData?.data?.data ?? [];
  const goals: Goal[] = goalsData?.data?.data ?? [];
  const longGoals = goals.filter((g) => g.type === 'LONG');
  const completedCount = todos.filter(
    (td) => td.completed || td.status === 'DONE',
  ).length;

  const createTodo = useMutation({
    mutationFn: todoAPI.createTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['goals'] });
      setNewTask('');
      setNewTaskRefs({ set: [], note: [], flashcard: [], exam: [] });
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('todo.toast.createFailed'))),
  });

  const toggleTodo = useMutation({
    mutationFn: todoAPI.toggleTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const deleteTodo = useMutation({
    mutationFn: todoAPI.deleteTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['goals'] });
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('todo.toast.deleteFailed'))),
  });

  const deleteGoal = useMutation({
    mutationFn: todoAPI.deleteGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      qc.invalidateQueries({ queryKey: ['todos'] });
      toast.success(t('todo.toast.goalDeleted'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('todo.toast.goalDeleteFailed'))),
  });

  const handleAddTodayTask = () => {
    if (!newTask.trim() || createTodo.isPending) return;
    createTodo.mutate({
      title: newTask.trim(),
      dueDate: todayIso(),
      setRefs: newTaskRefs.set.length ? newTaskRefs.set : undefined,
      noteRefs: newTaskRefs.note.length ? newTaskRefs.note : undefined,
      flashcardRefs: newTaskRefs.flashcard.length
        ? newTaskRefs.flashcard
        : undefined,
      examRefs: newTaskRefs.exam.length ? newTaskRefs.exam : undefined,
    });
  };

  const handleNewTaskRefAdded = (
    type: MentionResourceType,
    ref: ResourceRef,
  ) => {
    setNewTaskRefs((prev) => ({
      ...prev,
      [type]: prev[type].some((r) => r.id === ref.id)
        ? prev[type]
        : [...prev[type], ref],
    }));
  };

  const handleCreateForDate = (
    title: string,
    date: string,
    refs?: Partial<Record<MentionResourceType, ResourceRef[]>>,
  ) => {
    createTodo.mutate({
      title,
      dueDate: date,
      setRefs: refs?.set?.length ? refs.set : undefined,
      noteRefs: refs?.note?.length ? refs.note : undefined,
      flashcardRefs: refs?.flashcard?.length ? refs.flashcard : undefined,
      examRefs: refs?.exam?.length ? refs.exam : undefined,
    });
  };

  return (
    <div className='min-h-screen py-8 px-10 bg-[var(--pl-bg)]'>
      <GoalModal
        key={editingGoal?.id ?? (goalModalOpen ? 'new' : '')}
        open={goalModalOpen || editingGoal !== null}
        editGoal={editingGoal}
        longGoals={longGoals}
        onClose={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
        }}
      />

      <TodoDetailModal
        key={detailTodo?.id}
        open={detailTodo !== null}
        todo={detailTodo}
        goals={goals}
        onClose={() => setDetailTodo(null)}
      />

      {/* Page header */}
      <div className='flex justify-between items-start mb-7'>
        <div>
          <div className='text-[11px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]'>
            {t('todo.breadcrumb')}
          </div>
          <h1
            className='text-[44px] tracking-tight leading-[1.05] m-0 mb-1.5 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t('todo.title')}
          </h1>
        </div>
      </div>

      {showCalendarBanner && (
        <div className='mb-5 flex items-start gap-3 rounded-2xl border border-[var(--pl-warning-border)] bg-[var(--pl-warning-soft)] px-4 py-3.5'>
          <CalendarX2 className='mt-0.5 h-4 w-4 shrink-0 text-[var(--pl-warning-text)]' />
          <div className='flex-1 min-w-0'>
            <p className='text-[13px] font-medium text-[var(--pl-warning-text)]'>
              {t('googleCalendar.todoBannerTitle')}
            </p>
            <p className='text-[12px] text-[var(--pl-warning-text)] opacity-80 mt-0.5'>
              {t('googleCalendar.todoBannerDesc')}
            </p>
          </div>
          <div className='flex items-center gap-2 shrink-0'>
            <button
              onClick={() => navigate('/profile?tab=preferences')}
              className='rounded-lg bg-[var(--pl-warning)] px-3 py-1.5 text-[12px] font-medium text-white hover:opacity-90 transition-opacity'
            >
              {t('googleCalendar.todoBannerConnect')}
            </button>
            <button
              onClick={() => setCalendarBannerDismissed(true)}
              className='rounded-lg border border-[var(--pl-warning-border)] px-3 py-1.5 text-[12px] font-medium text-[var(--pl-warning-text)] hover:bg-[var(--pl-warning-border)] transition-colors'
            >
              {t('googleCalendar.todoBannerDismiss')}
            </button>
          </div>
        </div>
      )}

      <TodoStats
        completedCount={completedCount}
        totalTodos={todos.length}
        goalsCount={goals.length}
      />

      <WhatsNextPanel
        todos={todos}
        goals={goals}
        selectedGoalId={selectedGoalId}
        onToggleTodo={(id) => toggleTodo.mutate(id)}
        onOpenTodo={setDetailTodo}
      />

      <TodaySection
        todos={todos}
        goals={goals}
        newTask={newTask}
        newTaskRefs={newTaskRefs}
        isCreating={createTodo.isPending}
        selectedGoalId={selectedGoalId}
        onSelectGoal={setSelectedGoalId}
        onNewTaskChange={setNewTask}
        onNewTaskRefAdded={handleNewTaskRefAdded}
        onAddTask={handleAddTodayTask}
        onToggleTodo={(id) => toggleTodo.mutate(id)}
        onDeleteTodo={(id) => deleteTodo.mutate(id)}
        onOpenTodo={setDetailTodo}
        onNewGoal={() => setGoalModalOpen(true)}
        onEditGoal={setEditingGoal}
        onDeleteGoal={(id) => deleteGoal.mutate(id)}
      />

      <WeekSection
        todos={todos}
        isCreating={createTodo.isPending}
        selectedGoalId={selectedGoalId}
        onToggleTodo={(id) => toggleTodo.mutate(id)}
        onDeleteTodo={(id) => deleteTodo.mutate(id)}
        onOpenTodo={setDetailTodo}
        onCreateTodoForDate={handleCreateForDate}
      />

      <YearSection
        goals={goals}
        onEditGoal={setEditingGoal}
        onNewGoal={() => setGoalModalOpen(true)}
      />
    </div>
  );
};

export default TodoDashboard;
