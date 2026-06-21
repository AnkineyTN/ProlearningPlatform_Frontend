import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { llmConfigAPI } from '@/services/endpoints/llm-config';
import type {
  CreateLlmConfigData,
  UpdateLlmConfigData,
} from '@/services/types/llm-config.types';

export const llmConfigKeys = {
  all: ['llm-configs'] as const,
};

export function useLlmConfigs() {
  return useQuery({
    queryKey: llmConfigKeys.all,
    queryFn: () => llmConfigAPI.list().then((r) => r.data.data ?? []),
  });
}

export function useCreateLlmConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLlmConfigData) =>
      llmConfigAPI.create(data).then((r) => r.data.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: llmConfigKeys.all });
    },
  });
}

export function useUpdateLlmConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateLlmConfigData }) =>
      llmConfigAPI.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: llmConfigKeys.all });
    },
  });
}

export function useDeleteLlmConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => llmConfigAPI.remove(id).then((r) => r.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: llmConfigKeys.all });
    },
  });
}

export function useSetActiveLlmConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => llmConfigAPI.setActive(id).then((r) => r.data.data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: llmConfigKeys.all });
    },
  });
}
