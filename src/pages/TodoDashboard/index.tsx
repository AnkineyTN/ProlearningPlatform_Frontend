import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { todoAPI } from "@/services/endpoints/todo";
import type { Goal, Todo } from "@/services/types/todo.types";
import { type FilterTab } from "./constants";
import GoalModal from "./GoalModal";
import TodoStats from "./TodoStats";
import FilterTabs from "./FilterTabs";
import TodoList from "./TodoList";
import GoalsSidebar from "./GoalsSidebar";

const TodoDashboard = () => {
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
  const completedCount = todos.filter((t) => t.completed).length;

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createTodo = useMutation({
    mutationFn: todoAPI.createTodo,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["todos"] });
      qc.invalidateQueries({ queryKey: ["goals"] });
      setNewTask("");
    },
    onError: () => toast.error("Tạo todo thất bại"),
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
    onError: () => toast.error("Xóa todo thất bại"),
  });

  const deleteGoal = useMutation({
    mutationFn: todoAPI.deleteGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["goals"] });
      qc.invalidateQueries({ queryKey: ["todos"] });
      if (typeof activeFilter === "number") setActiveFilter("all");
      toast.success("Đã xóa goal");
    },
    onError: () => toast.error("Xóa goal thất bại"),
  });

  const handleAddTask = () => {
    if (!newTask.trim()) return;
    const goalId = typeof activeFilter === "number" ? activeFilter : undefined;
    createTodo.mutate({ title: newTask.trim(), goalId });
  };

  return (
    <div className="min-h-screen pt-8 px-10 pb-[120px] max-w-[1320px] mx-auto">
      <GoalModal
        open={goalModalOpen || editingGoal !== null}
        editGoal={editingGoal}
        onClose={() => {
          setGoalModalOpen(false);
          setEditingGoal(null);
        }}
      />

      {/* Page header */}
      <div className="flex justify-between items-start mb-7">
        <div>
          <div className="text-[11px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-text-faint)]">
            To-Do · Goals
          </div>
          <h1 className="text-[44px] font-normal tracking-tight leading-[1.05] m-0 mb-1.5 font-[var(--font-display)] text-[var(--pl-text)]">
            Hôm nay bạn muốn hoàn thành điều gì?
          </h1>
          <p className="text-[17px] italic m-0 font-[var(--font-serif)] text-[var(--pl-text-muted)]">
            Cứ ghi xuống — gắn vào goal khi thấy cần.
          </p>
        </div>
      </div>

      <TodoStats
        completedCount={completedCount}
        totalTodos={todos.length}
        goalsCount={goals.length}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-7">
        <div className="min-w-0 space-y-4">
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
