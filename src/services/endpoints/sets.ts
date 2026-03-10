import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  SetData,
  SetQueryParams,
  CreateSetPayload,
  CreateSetResponse,
  UpdateSetPayload,
  UpdateSetResponse,
  DeleteSetResponse,
} from '../types/set.types';

export const setAPI = {
  getSetData: ({
    page,
    size,
    sort,
  }: SetQueryParams): Promise<AxiosResponse<SetData>> =>
    api.get(
      `/sets?page=${page}&size=${size}&sort=${sort[0].property},${sort[0].direction}`,
    ),
  createSet: (
    payload: CreateSetPayload,
  ): Promise<AxiosResponse<CreateSetResponse>> => api.post('/sets', payload),
  deleteSet: (id: number): Promise<AxiosResponse<DeleteSetResponse>> =>
    api.delete(`/sets/${id}`),
  updateSet: (
    id: number,
    payload: UpdateSetPayload,
  ): Promise<AxiosResponse<UpdateSetResponse>> =>
    api.patch(`/sets/${id}`, payload),
};
