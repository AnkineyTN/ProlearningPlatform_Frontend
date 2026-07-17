import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  CreateLlmConfigData,
  LlmConfigDeleteResponse,
  LlmConfigListResponse,
  LlmConfigResponse,
  UpdateLlmConfigData,
} from '../types/llm-config.types';

const BASE = '/users/me/llm-configs';

export const llmConfigAPI = {
  list: (): Promise<AxiosResponse<LlmConfigListResponse>> => api.get(BASE),

  get: (id: number): Promise<AxiosResponse<LlmConfigResponse>> =>
    api.get(`${BASE}/${id}`),

  create: (
    data: CreateLlmConfigData,
  ): Promise<AxiosResponse<LlmConfigResponse>> => api.post(BASE, data),

  update: (
    id: number,
    data: UpdateLlmConfigData,
  ): Promise<AxiosResponse<LlmConfigResponse>> =>
    api.put(`${BASE}/${id}`, data),

  remove: (id: number): Promise<AxiosResponse<LlmConfigDeleteResponse>> =>
    api.delete(`${BASE}/${id}`),

  setActive: (id: number): Promise<AxiosResponse<LlmConfigResponse>> =>
    api.put(`${BASE}/${id}/active`),
};
