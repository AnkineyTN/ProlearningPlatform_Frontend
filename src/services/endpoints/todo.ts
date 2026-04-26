import type { AxiosResponse } from "axios";
import api from "../client";
import type {
  CreateGoalRequest,
  CreateTodoRequest,
  GoalListResponse,
  GoalSingleResponse,
  GoalStatus,
  GoalType,
  GoalWithTodosResponse,
  TodoListResponse,
  TodoPriority,
  TodoSingleResponse,
  TodoStatus,
  TodoType,
  UpdateGoalRequest,
  UpdateTodoRequest,
} from "../types/todo.types";

export const todoAPI = {
  // ---- Todos ----
  getTodos: (params?: {
    goalId?: number;
    completed?: boolean;
    priority?: TodoPriority;
    noGoal?: boolean;
    type?: TodoType;
    status?: TodoStatus;
    page?: number;
    size?: number;
  }): Promise<AxiosResponse<TodoListResponse>> =>
    api.get("/todos", { params }),

  getTodoById: (id: number): Promise<AxiosResponse<TodoSingleResponse>> =>
    api.get(`/todos/${id}`),

  createTodo: (
    data: CreateTodoRequest,
  ): Promise<AxiosResponse<TodoSingleResponse>> =>
    api.post("/todos", data),

  updateTodo: (
    id: number,
    data: UpdateTodoRequest,
  ): Promise<AxiosResponse<TodoSingleResponse>> =>
    api.patch(`/todos/${id}`, data),

  deleteTodo: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/todos/${id}`),

  toggleTodo: (id: number): Promise<AxiosResponse<TodoSingleResponse>> =>
    api.patch(`/todos/${id}/toggle`),

  // ---- Goals ----
  getGoals: (params?: {
    status?: GoalStatus;
    type?: GoalType;
    page?: number;
    size?: number;
  }): Promise<AxiosResponse<GoalListResponse>> =>
    api.get("/goals", { params }),

  getGoalById: (id: number): Promise<AxiosResponse<GoalWithTodosResponse>> =>
    api.get(`/goals/${id}`),

  createGoal: (
    data: CreateGoalRequest,
  ): Promise<AxiosResponse<GoalSingleResponse>> =>
    api.post("/goals", data),

  updateGoal: (
    id: number,
    data: UpdateGoalRequest,
  ): Promise<AxiosResponse<GoalSingleResponse>> =>
    api.patch(`/goals/${id}`, data),

  deleteGoal: (id: number): Promise<AxiosResponse<void>> =>
    api.delete(`/goals/${id}`),
};
