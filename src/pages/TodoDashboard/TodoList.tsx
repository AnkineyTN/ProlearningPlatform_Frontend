import { useState } from "react";
import { BookOpen, ExternalLink, FileText, FlipHorizontal, GraduationCap, Inbox, Plus, Settings2, Trash2 } from "lucide-react";
import type { Goal, ResourceRef, Todo } from "@/services/types/todo.types";
import { PRIORITY_LABEL, TODO_STATUS_COLORS, TODO_STATUS_LABEL, TODO_TYPE_LABEL, type FilterTab, type ResourceType } from "./constants";
import AssignGoalDropdown from "./AssignGoalDropdown";
import TodoDetailModal from "./TodoDetailModal";

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

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  set: <BookOpen className="w-3 h-3" />,
  note: <FileText className="w-3 h-3" />,
  flashcard: <FlipHorizontal className="w-3 h-3" />,
  exam: <GraduationCap className="w-3 h-3" />,
};

const RESOURCE_COLORS: Record<ResourceType, string> = {
  set: "oklch(0.7 0.15 260)",
  note: "oklch(0.72 0.12 180)",
  flashcard: "oklch(0.7 0.15 310)",
  exam: "oklch(0.72 0.15 40)",
};

const RESOURCE_LABELS: Record<ResourceType, string> = {
  set: "Set",
  note: "Note",
  flashcard: "Flashcard",
  exam: "Exam",
};

const getNavUrl = (type: ResourceType, ref: ResourceRef): string => {
  switch (type) {
    case "set": return `/sets/${ref.id}`;
    case "note": return `/sets/${ref.setId}/notes/${ref.id}`;
    case "flashcard": return `/sets/${ref.setId}/flashcards/${ref.id}`;
    case "exam": return `/sets/${ref.setId}/exams/${ref.id}`;
  }
};

const ResourceChips = ({ todo }: { todo: Todo }) => {
  const allRefs: { type: ResourceType; refs: ResourceRef[] }[] = [
    { type: "set", refs: todo.setRefs ?? [] },
    { type: "note", refs: todo.noteRefs ?? [] },
    { type: "flashcard", refs: todo.flashcardRefs ?? [] },
    { type: "exam", refs: todo.examRefs ?? [] },
  ];

  const hasAny = allRefs.some(({ refs }) => refs.length > 0);
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1.5">
      {allRefs.flatMap(({ type, refs }) =>
        refs.map((ref) => (
          <a
            key={`${type}-${ref.id}`}
            href={getNavUrl(type, ref)}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] border transition-opacity hover:opacity-80"
            style={{
              borderColor: `color-mix(in oklch, ${RESOURCE_COLORS[type]} 35%, transparent)`,
              background: `color-mix(in oklch, ${RESOURCE_COLORS[type]} 10%, transparent)`,
              color: RESOURCE_COLORS[type],
            }}
          >
            {RESOURCE_ICONS[type]}
            <span className="max-w-[80px] truncate">
              {ref.title ?? `${RESOURCE_LABELS[type]} #${ref.id}`}
            </span>
            <ExternalLink className="w-2.5 h-2.5 opacity-50 flex-shrink-0" />
          </a>
        )),
      )}
    </div>
  );
};

const TodoItem = ({
  todo,
  goals,
  onToggle,
  onDelete,
  onOpenDetail,
}: {
  todo: Todo;
  goals: Goal[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onOpenDetail: (todo: Todo) => void;
}) => {
  const [hovered, setHovered] = useState(false);
  const accent = PRIORITY_COLORS[todo.priority] ?? "var(--pl-text-faint)";
  const statusColor = TODO_STATUS_COLORS[todo.status];

  const isSkipped = todo.status === "SKIPPED";
  const isDone = todo.status === "DONE" || todo.completed;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`flex items-start gap-3 rounded-[10px] transition-all py-[14px] px-4 bg-[var(--pl-bg-elev)] border ${
        hovered ? "border-[var(--pl-border-strong)]" : "border-[var(--pl-border)]"
      } ${isDone || isSkipped ? "opacity-[0.55]" : "opacity-100"}`}
    >
      <button
        onClick={() => onToggle(todo.id)}
        className={`w-[18px] h-[18px] rounded-[6px] mt-0.5 flex-shrink-0 grid place-items-center transition-all ${
          isDone
            ? "border border-[var(--pl-accent)] bg-[var(--pl-accent)]"
            : isSkipped
              ? "border border-[var(--pl-text-faint)] bg-[var(--pl-bg-hover)]"
              : "border-[1.5px] border-[var(--pl-border-strong)] bg-transparent"
        }`}
      >
        {isDone && (
          <svg viewBox="0 0 24 24" width={11} height={11} stroke="var(--pl-accent-fg)" fill="none" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
        {isSkipped && (
          <svg viewBox="0 0 24 24" width={11} height={11} stroke="var(--pl-text-faint)" fill="none" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-[1.45] ${
            isDone
              ? "line-through text-[var(--pl-text-faint)]"
              : isSkipped
                ? "line-through text-[var(--pl-text-faint)] opacity-70"
                : "no-underline text-[var(--pl-text)]"
          }`}
        >
          {todo.title}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {/* Priority */}
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

          {/* Type badge */}
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)] border border-[var(--pl-border)]">
            {TODO_TYPE_LABEL[todo.type]}
          </span>

          {/* Status badge (only if not default TODO) */}
          {todo.status !== "TODO" && (
            <span
              className="text-[10px] px-2 py-0.5 rounded-full border"
              style={{
                borderColor: `color-mix(in oklch, ${statusColor} 40%, transparent)`,
                color: statusColor,
                background: `color-mix(in oklch, ${statusColor} 12%, transparent)`,
              }}
            >
              {TODO_STATUS_LABEL[todo.status]}
            </span>
          )}

          {/* Due date */}
          {todo.dueDate && (
            <span className="inline-flex items-center gap-1 text-[11.5px] text-[var(--pl-text-faint)]">
              <svg viewBox="0 0 24 24" width={10} height={10} stroke="currentColor" fill="none" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
              </svg>
              {todo.dueDate}
            </span>
          )}

          <AssignGoalDropdown todo={todo} goals={goals} />
        </div>

        {/* Resource chips */}
        <ResourceChips todo={todo} />
      </div>

      <div className={`flex gap-1 transition-opacity ${hovered ? "opacity-100" : "opacity-0"}`}>
        <button
          onClick={() => onOpenDetail(todo)}
          className="p-1.5 rounded-[6px] hover:bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]"
          title="Chi tiết / chỉnh sửa"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1.5 rounded-[6px] hover:bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]"
          title="Xóa"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

const GoalGroupHeader = ({ goal, todos }: { goal: Goal; todos: Todo[] }) => {
  const done = todos.filter((t) => t.completed || t.status === "DONE").length;
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: goal.color ?? "#6366f1" }} />
      <div className="text-[16px] font-medium tracking-tight font-[var(--font-display)] text-[var(--pl-text)]">
        {goal.title}
      </div>
      {goal.type === "SHORT" && (
        <span className="text-[9.5px] px-1.5 py-0.5 rounded-full bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]">
          ngắn hạn
        </span>
      )}
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
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null);

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
      <TodoDetailModal
        open={detailTodo !== null}
        todo={detailTodo}
        goals={goals}
        onClose={() => setDetailTodo(null)}
      />

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
          <div className="text-[18px] font-[var(--font-display)]">Chưa có todo nào ở đây.</div>
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
                    onOpenDetail={setDetailTodo}
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
                    onOpenDetail={setDetailTodo}
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
              onOpenDetail={setDetailTodo}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TodoList;
