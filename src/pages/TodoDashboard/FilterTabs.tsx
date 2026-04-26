import type { Goal } from "@/services/types/todo.types";
import type { FilterTab } from "./constants";

type FilterTabsProps = {
  goals: Goal[];
  activeFilter: FilterTab;
  onFilterChange: (value: FilterTab) => void;
};

const FilterTabs = ({ goals, activeFilter, onFilterChange }: FilterTabsProps) => {
  const staticTabs = [
    { label: "Tất cả", value: "all" as FilterTab },
    { label: "Chưa gắn goal", value: "no-goal" as FilterTab },
    { label: "Đã xong", value: "completed" as FilterTab },
  ];

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 flex-wrap items-center">
      {staticTabs.map((tab) => {
        const active = activeFilter === tab.value;
        return (
          <button
            key={String(tab.value)}
            onClick={() => onFilterChange(tab.value)}
            className={`px-3 py-1.5 rounded-full text-[12.5px] whitespace-nowrap transition-all inline-flex items-center gap-1.5 border ${
              active
                ? "border-transparent bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] font-medium"
                : "border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] font-normal"
            }`}
          >
            {tab.label}
          </button>
        );
      })}

      {goals.length > 0 && (
        <div className="w-px h-[18px] bg-[var(--pl-border)] mx-1 flex-shrink-0" />
      )}

      {goals.map((g) => {
        const active = activeFilter === g.id;
        const accent = g.color ?? "#6366f1";
        return (
          <button
            key={g.id}
            onClick={() => onFilterChange(active ? "all" : g.id)}
            className={`px-3 py-1.5 rounded-full text-[12.5px] whitespace-nowrap transition-all inline-flex items-center gap-1.5 border ${
              active ? "text-[var(--pl-text)]" : "text-[var(--pl-text-muted)]"
            }`}
            style={{
              borderColor: active ? accent : "var(--pl-border)",
              background: active ? `color-mix(in oklch, ${accent} 18%, transparent)` : "transparent",
            }}
          >
            <span className="w-[7px] h-[7px] rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
            {g.title}
          </button>
        );
      })}
    </div>
  );
};

export default FilterTabs;
