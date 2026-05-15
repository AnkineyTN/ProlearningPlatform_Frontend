import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  CompleteTopicResponse,
  CreateRoadmapPayload,
  DeleteRoadmapResponse,
  PreviewRoadmapPayload,
  PreviewRoadmapResponse,
  RoadmapDetailResponse,
  RoadmapListResponse,
  StartTopicResponse,
} from '../types/roadmap.types';

export const roadmapAPI = {
  list: (): Promise<AxiosResponse<RoadmapListResponse>> => api.get('/roadmaps'),

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
