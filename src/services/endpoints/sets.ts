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
  /** GET /sets/:id — same envelope as PATCH response */
  getSetById: (id: number): Promise<AxiosResponse<UpdateSetResponse>> =>
    api.get(`/sets/${id}`),

  getSetData: ({
    page,
    size,
    sort,
    q,
    privacy,
  }: SetQueryParams): Promise<AxiosResponse<SetData>> => {
    const sp = new URLSearchParams();
    sp.set('page', String(page));
    sp.set('size', String(size));
    sp.append('sort', `${sort[0].property},${sort[0].direction}`);
    const qt = q?.trim();
    if (qt) {
      sp.set('q', qt);
    }
    if (privacy) {
      sp.set('privacy', privacy);
    }
    return api.get(`/sets?${sp.toString()}`);
  },
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
