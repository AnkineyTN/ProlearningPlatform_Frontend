import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  CompleteTopicResponse,
  CreateRoadmapPayload,
  DeleteRoadmapResponse,
  PreviewRoadmapPayload,
  PreviewRoadmapResponse,
  RoadmapDetailResponse,
  RoadmapListQueryParams,
  RoadmapListResponse,
  StartTopicResponse,
} from '../types/roadmap.types';

export const roadmapAPI = {
  list: ({
    page,
    size,
    sort,
    status,
  }: RoadmapListQueryParams): Promise<AxiosResponse<RoadmapListResponse>> => {
    const sp = new URLSearchParams();
    sp.set('page', String(page));
    sp.set('size', String(size));
    sp.set('sort', sort);
    if (status) sp.set('status', status);
    return api.get(`/roadmaps?${sp.toString()}`);
  },

  getById: (id: number): Promise<AxiosResponse<RoadmapDetailResponse>> =>
    api.get(`/roadmaps/${id}`),

  preview: (
    payload: PreviewRoadmapPayload,
  ): Promise<AxiosResponse<PreviewRoadmapResponse>> =>
    api.post('/roadmaps/preview', payload),

  create: (
    payload: CreateRoadmapPayload,
  ): Promise<AxiosResponse<RoadmapDetailResponse>> =>
    api.post('/roadmaps', payload),

  remove: (id: number): Promise<AxiosResponse<DeleteRoadmapResponse>> =>
    api.delete(`/roadmaps/${id}`),

  startTopic: (
    roadmapId: number,
    topicId: number,
  ): Promise<AxiosResponse<StartTopicResponse>> =>
    api.post(`/roadmaps/${roadmapId}/topics/${topicId}/start`),

  completeTopic: (
    roadmapId: number,
    topicId: number,
  ): Promise<AxiosResponse<CompleteTopicResponse>> =>
    api.patch(`/roadmaps/${roadmapId}/topics/${topicId}/complete`),
};
