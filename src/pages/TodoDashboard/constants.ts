import type { GoalStatus, TodoPriority } from "@/services/types/todo.types";

export type FilterTab = "all" | "no-goal" | "completed" | number;

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

export const GOAL_PRESET_COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
];
