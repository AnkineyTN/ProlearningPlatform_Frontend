import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { roadmapAPI } from '@/services/endpoints/roadmap';
import type {
  CreateRoadmapPayload,
  PreviewRoadmapPayload,
  Roadmap,
} from '@/services/types/roadmap.types';

const ROADMAP_KEY = ['roadmaps'] as const;
const roadmapDetailKey = (id: number) => ['roadmaps', id] as const;

export const useRoadmaps = () =>
  useQuery({
    queryKey: ROADMAP_KEY,
    queryFn: async () => {
      const res = await roadmapAPI.list();
      return res.data.data;
    },
  });

const hasGenerating = (roadmap?: Roadmap): boolean =>
  !!roadmap?.chapters.some((c) =>
    c.topics.some((t) => t.contentStatus === 'GENERATING'),
  );

export const useRoadmap = (id: number | undefined) =>
  useQuery({
    queryKey: id ? roadmapDetailKey(id) : ['roadmaps', 'none'],
    queryFn: async () => {
      const res = await roadmapAPI.getById(id!);
      return res.data.data;
    },
    enabled: !!id && Number.isFinite(id),
    refetchInterval: (query) =>
      hasGenerating(query.state.data) ? 4000 : false,
  });

export const usePreviewRoadmap = () =>
  useMutation({
    mutationFn: async (payload: PreviewRoadmapPayload) => {
      const res = await roadmapAPI.preview(payload);
      return res.data.data;
    },
  });

export const useCreateRoadmap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRoadmapPayload) => {
      const res = await roadmapAPI.create(payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ROADMAP_KEY });
      qc.setQueryData(roadmapDetailKey(data.id), data);
    },
  });
};

export const useDeleteRoadmap = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => roadmapAPI.remove(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ROADMAP_KEY });
      qc.removeQueries({ queryKey: roadmapDetailKey(id) });
    },
  });
};

export const useStartTopic = (roadmapId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (topicId: number) => {
      const res = await roadmapAPI.startTopic(roadmapId, topicId);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roadmapDetailKey(roadmapId) });
    },
  });
};

export const useCompleteTopic = (roadmapId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (topicId: number) => {
      const res = await roadmapAPI.completeTopic(roadmapId, topicId);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: roadmapDetailKey(roadmapId) });
      qc.invalidateQueries({ queryKey: ROADMAP_KEY });
    },
  });
};
