import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { todoAPI } from "@/services/endpoints/todo";
import type { Goal, Todo } from "@/services/types/todo.types";
import { type FilterTab } from "./constants";
import GoalModal from "./GoalModal";
import TodoStats from "./TodoStats";
import FilterTabs from "./FilterTabs";
import TodoList from "./TodoList";
import GoalsSidebar from "./GoalsSidebar";

const TodoDashboard = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [newTask, setNewTask] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  // ── Queries ───────────────────────────────────────────────────────────────

  const todosParams = (() => {
    if (activeFilter === "completed") return { completed: true };
    if (activeFilter === "no-goal") return { noGoal: true };
    if (typeof activeFilter === "number") return { goalId: activeFilter };
    return {};
  })();

  const { data: todosData } = useQuery({
    queryKey: ["todos", todosParams],
    queryFn: () => todoAPI.getTodos({ ...todosParams, size: 100 }),
  });

  const { data: goalsData } = useQuery({
    queryKey: ["goals"],
    queryFn: () => todoAPI.getGoals({ size: 100 }),
  });

  const todos: Todo[] = todosData?.data?.data ?? [];
  const goals: Goal[] = goalsData?.data?.data ?? [];
  const longGoals = goals.filter((g) => g.type === "LONG");
  const completedCount = todos.filter((t) => t.completed || t.status === "DONE").length;

  // ── Mutations ─────────────────────────────────────────────────────────────

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
      if (typeof activeFilter === "number") setActiveFilter("all");
      toast.success(t("todo.toast.goalDeleted"));
    },
    onError: () => toast.error(t("todo.toast.goalDeleteFailed")),
  });

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const goalId = typeof activeFilter === "number" ? activeFilter : undefined;
    createTodo.mutate({ title: newTask.trim(), goalId });
  };

  return (
    <div className='min-h-screen pt-8 pb-[120px] mx-auto'>
      <GoalModal
        open={goalModalOpen || editingGoal !== null}
        editGoal={editingGoal}
        longGoals={longGoals}
        onClose={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
        }}
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

      <div className='grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7'>
        <div className='min-w-0 space-y-4'>
          <FilterTabs
            goals={goals}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
          <TodoList
            todos={todos}
            goals={goals}
            activeFilter={activeFilter}
            newTask={newTask}
            isCreating={createTodo.isPending}
            onNewTaskChange={setNewTask}
            onAddTask={handleAddTask}
            onToggle={(id) => toggleTodo.mutate(id)}
            onDelete={(id) => deleteTodo.mutate(id)}
          />
        </div>

        <GoalsSidebar
          goals={goals}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          onNewGoal={() => setGoalModalOpen(true)}
          onEditGoal={setEditingGoal}
          onDeleteGoal={(id) => deleteGoal.mutate(id)}
        />
      </div>
    </div>
  );
};

export default TodoDashboard;
