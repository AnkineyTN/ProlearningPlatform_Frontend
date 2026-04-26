import { useState } from "react";
import { Inbox, Plus, Settings2, Trash2 } from "lucide-react";
import type { Goal, Todo } from "@/services/types/todo.types";
import { PRIORITY_LABEL, type FilterTab } from "./constants";
import AssignGoalDropdown from "./AssignGoalDropdown";

type TodoListProps = {
  todos: Todo[];
  goals: Goal[];
  activeFilter: FilterTab;
  newTask: string;
  isCreating: boolean;
  onNewTaskChange: (value: string) => void;
  onAddTask: () => void;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
};

const PRIORITY_COLORS: Record<string, string> = {
  HIGH: "oklch(0.65 0.2 25)",
  MEDIUM: "oklch(0.78 0.15 75)",
  LOW: "var(--pl-text-faint)",
};

const TodoItem = ({
  todo,
  goals,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  goals: Goal[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const accent = PRIORITY_COLORS[todo.priority] ?? "var(--pl-text-faint)";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-start gap-3 rounded-[10px] transition-all py-[14px] px-4 bg-[var(--pl-bg-elev)] border ${
        hovered ? "border-[var(--pl-border-strong)]" : "border-[var(--pl-border)]"
      } ${todo.completed ? "opacity-[0.55]" : "opacity-100"}`}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-[18px] h-[18px] rounded-[6px] mt-0.5 flex-shrink-0 grid place-items-center transition-all ${
          todo.completed
            ? "border border-[var(--pl-accent)] bg-[var(--pl-accent)]"
            : "border-[1.5px] border-[var(--pl-border-strong)] bg-transparent"
        }`}
      >
        {todo.completed && (
          <svg
            viewBox="0 0 24 24"
            width={11}
            height={11}
            stroke="var(--pl-accent-fg)"
            fill="none"
            strokeWidth={2.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-[1.45] ${
            todo.completed
              ? "line-through text-[var(--pl-text-faint)]"
              : "no-underline text-[var(--pl-text)]"
          }`}
        >
          {todo.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span
            className="text-[10.5px] px-2 py-0.5 rounded-full border"
            style={{
              borderColor: accent,
              color: accent,
              background: `color-mix(in oklch, ${accent} 12%, transparent)`,
            }}
          >
            {PRIORITY_LABEL[todo.priority]}
          </span>
          {todo.dueDate && (
            <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--pl-text-faint)]">
              <svg
                viewBox="0 0 24 24"
                width={10}
                height={10}
                stroke="currentColor"
                fill="none"
                strokeWidth={1.6}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              {todo.dueDate}
            </span>
          )}
          <AssignGoalDropdown todo={todo} goals={goals} />
        </div>
      </div>

      <div className={`flex gap-1 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1.5 rounded-[6px] hover:bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]"
          title="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const GoalGroupHeader = ({ goal, todos }: { goal: Goal; todos: Todo[] }) => {
  const done = todos.filter((t) => t.completed).length;
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ background: goal.color ?? "#6366f1" }}
      />
      <div className="text-[16px] font-medium tracking-tight font-[var(--font-display)] text-[var(--pl-text)]">
        {goal.title}
      </div>
      <span className="text-[11px] font-[var(--font-mono-pl)] text-[var(--pl-text-faint)]">
        {done}/{todos.length}
      </span>
      <div className="flex-1 h-px bg-[var(--pl-border)]" />
    </div>
  );
};

const TodoList = ({
  todos,
  goals,
  activeFilter,
  newTask,
  isCreating,
  onNewTaskChange,
  onAddTask,
  onToggle,
  onDelete,
}: TodoListProps) => {
  const placeholder =
    typeof activeFilter === "number"
      ? `Thêm todo vào "${goals.find((g) => g.id === activeFilter)?.title}"…`
      : "Nhập nhanh todo… (Enter để tạo)";

  const showGrouped = activeFilter === "all" || activeFilter === "completed";

  const groupedByGoal = (() => {
    if (!showGrouped) return null;
    const groups: { goal: Goal; todos: Todo[] }[] = [];
    const unassigned: Todo[] = [];
    goals.forEach((g) => {
      const gTodos = todos.filter((t) => t.goalId === g.id);
      if (gTodos.length > 0) groups.push({ goal: g, todos: gTodos });
    });
    todos.filter((t) => !t.goalId).forEach((t) => unassigned.push(t));
    return { groups, unassigned };
  })();

  return (
    <div className="space-y-4">
      {/* Quick-add bar */}
      <div className="flex gap-2 rounded-[12px] transition-colors p-1.5 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)]">
        <input
          value={newTask}
          onChange={(e) => onNewTaskChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddTask()}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-sm text-[var(--pl-text)] p-[10px_14px] font-[inherit]"
        />
        <button
          className="inline-flex items-center gap-1.5 rounded-[8px] text-[12.5px] px-3 transition-colors border border-[var(--pl-border)] text-[var(--pl-text-muted)]"
          title="Tuỳ chỉnh"
        >
          <Settings2 className="w-3.5 h-3.5" />
          Tuỳ chỉnh
        </button>
        <button
          onClick={onAddTask}
          disabled={isCreating}
          className="inline-flex items-center gap-1.5 rounded-[8px] text-[12.5px] px-4 font-medium transition-opacity disabled:opacity-60 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)]"
        >
          <Plus className="w-3.5 h-3.5" />
          Thêm
        </button>
      </div>

      {/* Todo list */}
      {todos.length === 0 ? (
        <div className="text-center rounded-[14px] p-[60px] border border-dashed border-[var(--pl-border)] text-[var(--pl-text-faint)]">
          <Inbox className="w-7 h-7 mx-auto mb-3 opacity-50" />
          <div className="text-[18px] font-[var(--font-display)]">
            Chưa có todo nào ở đây.
          </div>
          <div className="text-[13px] mt-1">Dùng ô phía trên để thêm nhanh.</div>
        </div>
      ) : showGrouped && groupedByGoal ? (
        <>
          {groupedByGoal.groups.map(({ goal, todos: gTodos }) => (
            <div key={goal.id} className="mb-6">
              <GoalGroupHeader goal={goal} todos={gTodos} />
              <div className="flex flex-col gap-1.5">
                {gTodos.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    goals={goals}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))}
          {groupedByGoal.unassigned.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-2.5">
                <Inbox className="w-3.5 h-3.5 text-[var(--pl-text-faint)]" />
                <div className="text-[16px] font-medium tracking-tight font-[var(--font-display)] text-[var(--pl-text-muted)]">
                  Chưa gắn goal
                </div>
                <span className="text-[11px] font-[var(--font-mono-pl)] text-[var(--pl-text-faint)]">
                  {groupedByGoal.unassigned.length}
                </span>
                <div className="flex-1 h-px bg-[var(--pl-border)]" />
                <span className="text-[11px] italic flex-shrink-0 font-[var(--font-serif)] text-[var(--pl-text-faint)]">
                  Gắn vào goal khi thấy cần →
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {groupedByGoal.unassigned.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    goals={goals}
                    onToggle={onToggle}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          {todos.map((t) => (
            <TodoItem
              key={t.id}
              todo={t}
              goals={goals}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
