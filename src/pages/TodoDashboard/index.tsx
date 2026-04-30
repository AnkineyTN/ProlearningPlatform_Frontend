import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { todoAPI } from "@/services/endpoints/todo";
import type { Goal, Todo } from "@/services/types/todo.types";
import GoalModal from "./GoalModal";
import TodoStats from "./TodoStats";
import TodaySection from "./TodaySection";
import WeekSection from "./WeekSection";
import YearSection from "./YearSection";
import TodoDetailModal from "./TodoDetailModal";
import { todayIso } from "./dateHelpers";

const TodoDashboard = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [newTask, setNewTask] = useState("");
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null);

  const { data: todosData } = useQuery({
    queryKey: ["todos", "all"],
    queryFn: () => todoAPI.getTodos({ size: 200 }),
  });

  const { data: goalsData } = useQuery({
    queryKey: ["goals"],
    queryFn: () => todoAPI.getGoals({ size: 100 }),
  });

  const todos: Todo[] = todosData?.data?.data ?? [];
  const goals: Goal[] = goalsData?.data?.data ?? [];
  const longGoals = goals.filter((g) => g.type === "LONG");
  const completedCount = todos.filter((td) => td.completed || td.status === "DONE").length;

  const createTodo = useMutation({
    mutationFn: todoAPI.createTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      setNewTask("");
    },
    onError: () => toast.error(t("todo.toast.createFailed")),
  });

  const toggleTodo = useMutation({
    mutationFn: todoAPI.toggleTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
  });

  const deleteTodo = useMutation({
    mutationFn: todoAPI.deleteTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
    },
    onError: () => toast.error(t("todo.toast.deleteFailed")),
  });

  const deleteGoal = useMutation({
    mutationFn: todoAPI.deleteGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["todos"] });
      toast.success(t("todo.toast.goalDeleted"));
    },
    onError: () => toast.error(t("todo.toast.goalDeleteFailed")),
  });

  const handleAddTodayTask = () => {
    if (!newTask.trim()) return;
    createTodo.mutate({ title: newTask.trim(), dueDate: todayIso() });
  };

  const handleCreateForDate = (title: string, date: string) => {
    createTodo.mutate({ title, dueDate: date });
  };

  return (
    <div className='min-h-screen py-8 px-10'>
      <GoalModal
        open={goalModalOpen || editingGoal !== null}
        editGoal={editingGoal}
        longGoals={longGoals}
        onClose={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
        }}
      />

      <TodoDetailModal
        open={detailTodo !== null}
        todo={detailTodo}
        goals={goals}
        onClose={() => setDetailTodo(null)}
      />

      {/* Page header */}
      <div className='flex justify-between items-start mb-7'>
        <div>
          <div className='text-[11px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]'>
            {t("todo.breadcrumb")}
          </div>
          <h1
            className='text-[44px] tracking-tight leading-[1.05] m-0 mb-1.5 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {t("todo.title")}
          </h1>
          <p className='text-[17px] italic m-0 font-[var(--font-serif)] text-[var(--pl-text-muted)]'>
            {t("todo.subtitle")}
          </p>
        </div>
      </div>

      <TodoStats
        completedCount={completedCount}
        totalTodos={todos.length}
        goalsCount={goals.length}
      />

      <TodaySection
        todos={todos}
        goals={goals}
        newTask={newTask}
        isCreating={createTodo.isPending}
        onNewTaskChange={setNewTask}
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
