import type {
  GoalStatus,
  GoalType,
  Todo,
  TodoPriority,
  TodoStatus,
  TodoType,
} from '@/services/types/todo.types';

export const PRIORITY_COLORS: Record<TodoPriority, string> = {
  HIGH: 'bg-[var(--pl-danger-soft)] text-[var(--pl-danger-text)]',
  MEDIUM: 'bg-[var(--pl-warning-soft)] text-[var(--pl-warning-text)]',
  LOW: 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent)]',
};

export const PRIORITY_LABEL: Record<TodoPriority, string> = {
  HIGH: 'Cao',
  MEDIUM: 'Trung bình',
  LOW: 'Thấp',
};

export const STATUS_LABEL: Record<GoalStatus, string> = {
  IN_PROGRESS: 'Đang thực hiện',
  COMPLETED: 'Hoàn thành',
  ARCHIVED: 'Lưu trữ',
};

export const GOAL_TYPE_LABEL: Record<GoalType, string> = {
  LONG: 'Dài hạn (≥ 6 tháng)',
  SHORT: 'Ngắn hạn (1–6 tháng)',
};

export const TODO_TYPE_LABEL: Record<TodoType, string> = {
  DAILY: 'Hằng ngày',
  WEEKLY: 'Hằng tuần',
};

export const TODO_STATUS_LABEL: Record<TodoStatus, string> = {
  TODO: 'Cần làm',
  DONE: 'Hoàn thành',
  SKIPPED: 'Bỏ qua',
};

export const TODO_STATUS_COLORS: Record<TodoStatus, string> = {
  TODO: 'oklch(0.65 0.1 240)',
  DONE: 'oklch(0.72 0.15 155)',
  SKIPPED: 'oklch(0.6 0.05 60)',
};

export const GOAL_PRESET_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#ef4444',
  '#14b8a6',
];

export const RESOURCE_TYPE_LABELS = {
  set: 'Set',
  note: 'Ghi chú',
  flashcard: 'Flashcard',
  exam: 'Bài kiểm tra',
} as const;

export type ResourceType = keyof typeof RESOURCE_TYPE_LABELS;

export const PRIORITY_CLASS: Record<TodoPriority, string> = {
  HIGH: 'text-[var(--pl-danger-text)] bg-[var(--pl-danger-soft)]',
  MEDIUM: 'text-[var(--pl-warning-text)] bg-[var(--pl-warning-soft)]',
  LOW: 'text-[var(--pl-text-faint)] bg-transparent',
} as const;

export const effectiveStatus = (todo: Todo): TodoStatus =>
  todo.completed || todo.status === 'DONE' ? 'DONE' : todo.status;

export const PRIORITY_OPTIONS: TodoPriority[] = ['HIGH', 'MEDIUM', 'LOW'];
export const STATUS_OPTIONS: TodoStatus[] = ['TODO', 'DONE', 'SKIPPED'];

export const PRIORITY_LABEL_KEY: Record<TodoPriority, string> = {
  HIGH: 'todo.filter.priorityHigh',
  MEDIUM: 'todo.filter.priorityMedium',
  LOW: 'todo.filter.priorityLow',
};
export const STATUS_LABEL_KEY: Record<TodoStatus, string> = {
  TODO: 'todo.filter.statusTodo',
  DONE: 'todo.filter.statusDone',
  SKIPPED: 'todo.filter.statusSkipped',
};

export const STATUS_BADGE_CLASS: Record<TodoStatus, string> = {
  TODO: 'border-[var(--pl-border)] bg-[var(--pl-bg-hover)] text-[var(--pl-text-muted)]',
  DONE: 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]',
  SKIPPED:
    'border-[var(--pl-border)] bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]',
};

export const PRIORITY_BADGE_CLASS: Record<TodoPriority, string> = {
  HIGH: 'border-[var(--pl-danger-border)] bg-[var(--pl-danger-soft)] text-[var(--pl-danger-text)]',
  MEDIUM:
    'border-[var(--pl-warning-border)] bg-[var(--pl-warning-soft)] text-[var(--pl-warning-text)]',
  LOW: 'border-[var(--pl-border)] bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]',
};
