import type { ApiMetadata } from "./auth.types";

export type TodoPriority = "LOW" | "MEDIUM" | "HIGH";
export type GoalStatus = "IN_PROGRESS" | "COMPLETED" | "ARCHIVED";
export type GoalType = "LONG" | "SHORT";
export type TodoType = "DAILY" | "WEEKLY";
export type TodoStatus = "TODO" | "DONE" | "SKIPPED";

export type ResourceRef = {
  id: number;
  setId: number | null;
  title: string | null;
};

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
  type: TodoType;
  status: TodoStatus;
  setRefs: ResourceRef[];
  noteRefs: ResourceRef[];
  flashcardRefs: ResourceRef[];
  examRefs: ResourceRef[];
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
  type: GoalType;
  parentGoalId: number | null;
  totalTodos: number;
  completedTodos: number;
  progress: number;
  shortGoals: Goal[];
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
  type?: TodoType;
  status?: TodoStatus;
  setRefs?: ResourceRef[];
  noteRefs?: ResourceRef[];
  flashcardRefs?: ResourceRef[];
  examRefs?: ResourceRef[];
};

export type UpdateTodoRequest = {
  title?: string;
  description?: string;
  priority?: TodoPriority;
  dueDate?: string;
  completed?: boolean;
  goalId?: number;
  clearGoal?: boolean;
  type?: TodoType;
  status?: TodoStatus;
  setRefs?: ResourceRef[];
  noteRefs?: ResourceRef[];
  flashcardRefs?: ResourceRef[];
  examRefs?: ResourceRef[];
};

export type CreateGoalRequest = {
  title: string;
  description?: string;
  targetDate?: string;
  color?: string;
  type?: GoalType;
  parentGoalId?: number;
};

export type UpdateGoalRequest = {
  title?: string;
  description?: string;
  targetDate?: string;
  color?: string;
  status?: GoalStatus;
  type?: GoalType;
  parentGoalId?: number;
  clearParentGoal?: boolean;
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
