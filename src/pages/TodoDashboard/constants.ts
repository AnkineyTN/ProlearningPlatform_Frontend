import type { GoalStatus, GoalType, TodoPriority, TodoStatus, TodoType } from "@/services/types/todo.types";

export const PRIORITY_COLORS: Record<TodoPriority, string> = {
  HIGH: "bg-bg-error text-text-error",
  MEDIUM: "bg-bg-warning text-text-warning",
  LOW: "bg-bg-indigo text-text-indigo",
};

export const PRIORITY_LABEL: Record<TodoPriority, string> = {
  HIGH: "Cao",
  MEDIUM: "Trung bình",
  LOW: "Thấp",
};

export const STATUS_LABEL: Record<GoalStatus, string> = {
  IN_PROGRESS: "Đang thực hiện",
  COMPLETED: "Hoàn thành",
  ARCHIVED: "Lưu trữ",
};

export const GOAL_TYPE_LABEL: Record<GoalType, string> = {
  LONG: "Dài hạn (≥ 6 tháng)",
  SHORT: "Ngắn hạn (1–6 tháng)",
};

export const TODO_TYPE_LABEL: Record<TodoType, string> = {
  DAILY: "Hằng ngày",
  WEEKLY: "Hằng tuần",
};

export const TODO_STATUS_LABEL: Record<TodoStatus, string> = {
  TODO: "Cần làm",
  DONE: "Hoàn thành",
  SKIPPED: "Bỏ qua",
};

export const TODO_STATUS_COLORS: Record<TodoStatus, string> = {
  TODO: "oklch(0.65 0.1 240)",
  DONE: "oklch(0.72 0.15 155)",
  SKIPPED: "oklch(0.6 0.05 60)",
};

export const GOAL_PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];

export const RESOURCE_TYPE_LABELS = {
  set: "Set",
  note: "Ghi chú",
  flashcard: "Flashcard",
  exam: "Bài kiểm tra",
} as const;

export type ResourceType = keyof typeof RESOURCE_TYPE_LABELS;
