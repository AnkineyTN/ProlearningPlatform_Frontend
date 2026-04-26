import type { ApiMetadata } from "./auth.types";

export type TodoPriority = "LOW" | "MEDIUM" | "HIGH";
export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";

export type Todo = {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  priority: TodoPriority;
  dueDate: string | null;
  completedAt: string | null;
  goalId: number | null;
  goalTitle: string | null;
  goalColor: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: number;
  title: string;
  description: string | null;
  targetDate: string | null;
  color: string | null;
  status: GoalStatus;
  totalTodos: number;
  completedTodos: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type GoalWithTodos = Goal & {
  todos: Todo[];
};

export type CreateTodoRequest = {
  title: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: string;
  goalId?: number;
};

export type UpdateTodoRequest = {
  title?: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: string;
  completed?: boolean;
  goalId?: number;
  clearGoal?: boolean;
};

export type CreateGoalRequest = {
  title: string;
  description?: string;
  targetDate?: string;
  color?: string;
};

export type UpdateGoalRequest = {
  title?: string;
  description?: string;
  targetDate?: string;
  color?: string;
  status?: GoalStatus;
};

export type TodoListResponse = {
  status: string;
  message: string;
  data: Todo[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  } | null;
};

export type GoalListResponse = {
  status: string;
  message: string;
  data: Goal[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  } | null;
};

export type TodoSingleResponse = {
  status: string;
  message: string;
  data: Todo;
  metadata: ApiMetadata | null;
};

export type GoalSingleResponse = {
  status: string;
  message: string;
  data: Goal;
  metadata: ApiMetadata | null;
};

export type GoalWithTodosResponse = {
  status: string;
  message: string;
  data: GoalWithTodos;
  metadata: ApiMetadata | null;
};
