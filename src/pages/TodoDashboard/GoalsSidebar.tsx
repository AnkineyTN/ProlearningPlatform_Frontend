import { useState } from "react";
import { Pencil, Plus, Target, Trash2 } from "lucide-react";
import type { Goal } from "@/services/types/todo.types";
import { STATUS_LABEL, type FilterTab } from "./constants";

type GoalsSidebarProps = {
  goals: Goal[];
  activeFilter: FilterTab;
  onFilterChange: (value: FilterTab) => void;
  onNewGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: number) => void;
};

const GoalsSidebar = ({
  goals,
  activeFilter,
  onFilterChange,
  onNewGoal,
  onEditGoal,
  onDeleteGoal,
}: GoalsSidebarProps) => {
  const [hoverGoal, setHoverGoal] = useState<number | null>(null);

  const totalDone = goals.reduce((sum, g) => sum + g.completedTodos, 0);
  const totalAll = goals.reduce((sum, g) => sum + g.totalTodos, 0);
  const totalProgress = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Goals header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-[var(--pl-accent-strong)]" />
          <h3 className="text-[17px] font-medium tracking-tight m-0 font-[var(--font-display)] text-[var(--pl-text)]">
            Goals
          </h3>
          <span className="text-[11px] font-[var(--font-mono-pl)] text-[var(--pl-text-faint)]">
            {goals.length}
          </span>
        </div>
        <button
          onClick={onNewGoal}
          className="w-[26px] h-[26px] rounded-[7px] grid place-items-center transition-colors border border-[var(--pl-border)] text-[var(--pl-text-muted)]"
          title="Tạo goal mới"
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>

      {/* Goal cards */}
      {goals.length === 0 ? (
        <div className="text-center py-8 rounded-[12px] border border-dashed border-[var(--pl-border)] text-[var(--pl-text-faint)]">
          <Target className="w-7 h-7 mx-auto mb-2 opacity-40" />
          <p className="text-[12px]">Chưa có goal nào</p>
          <button
            onClick={onNewGoal}
            className="mt-2 text-[12px] hover:underline text-[var(--pl-accent-strong)]"
          >
            Tạo goal đầu tiên →
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map((goal) => {
            const active = activeFilter === goal.id;
            const accent = goal.color ?? "#6366f1";
            return (
              <div
                key={goal.id}
                onClick={() => onFilterChange(active ? "all" : goal.id)}
                onMouseEnter={() => setHoverGoal(goal.id)}
                onMouseLeave={() => setHoverGoal(null)}
                className="rounded-[12px] cursor-pointer transition-all p-4 bg-[var(--pl-bg-elev)] border"
                style={{ borderColor: active ? accent : "var(--pl-border)" }}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: accent }}
                    />
                    <span className="text-[14.5px] font-medium tracking-tight truncate font-[var(--font-display)] text-[var(--pl-text)]">
                      {goal.title}
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 flex-shrink-0 transition-opacity ${
                      hoverGoal === goal.id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditGoal(goal); }}
                      className="p-1 rounded hover:bg-[var(--pl-bg-hover)]"
                    >
                      <Pencil className="w-3 h-3 text-[var(--pl-text-muted)]" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onDeleteGoal(goal.id); }}
                      className="p-1 rounded hover:bg-[var(--pl-bg-hover)]"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] mb-2.5 text-[var(--pl-text-faint)]">
                  <span>
                    {goal.completedTodos}/{goal.totalTodos} todos
                  </span>
                  {goal.targetDate && (
                    <span className="font-[var(--font-mono-pl)]">
                      đến {goal.targetDate}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full overflow-hidden bg-[var(--pl-bg-hover)]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${goal.progress}%`, background: accent }}
                    />
                  </div>
                  <span
                    className="text-[11px] font-semibold flex-shrink-0 font-[var(--font-mono-pl)]"
                    style={{ color: accent }}
                  >
                    {goal.progress}%
                  </span>
                </div>

                <span className="text-[11px] mt-1.5 block text-[var(--pl-text-faint)]">
                  {STATUS_LABEL[goal.status]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Total progress card */}
      {goals.length > 0 && (
        <div className="rounded-[12px] p-[18px] bg-[linear-gradient(135deg,_var(--pl-accent-soft),_color-mix(in_oklch,_var(--pl-accent)_4%,_transparent))] border border-[var(--pl-accent-border)]">
          <div className="text-[11px] tracking-[0.16em] uppercase mb-2 text-[var(--pl-accent-strong)]">
            Tiến độ tổng
          </div>
          <div className="text-[38px] tracking-tight leading-none mb-3 font-[var(--font-display)] text-[var(--pl-text)]">
            {totalProgress}%
          </div>
          <div className="h-1 rounded-full overflow-hidden mb-2 bg-[var(--pl-bg-hover)]">
            <div
              className="h-full rounded-full transition-all bg-[var(--pl-accent)]"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="text-[11.5px] italic font-[var(--font-serif)] text-[var(--pl-text-muted)]">
            {totalDone} done · {totalAll - totalDone} đang chờ
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSidebar;
