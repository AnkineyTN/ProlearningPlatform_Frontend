export type RoadmapStatus = 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
export type ChapterStatus = 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED';
export type TopicContentStatus = 'IDLE' | 'GENERATING' | 'READY' | 'FAILED';
export type RoadmapLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type RoadmapLanguage = 'English' | 'Vietnamese';

export type ApiEnvelope<T> = {
  status: string;
  message: string;
  data: T;
  metadata?: Record<string, unknown>;
};

/* ── Persisted roadmap (response from POST /roadmaps and GET /roadmaps/{id}) ── */

export type RoadmapTopic = {
  id: number;
  topicKey: string;
  title: string;
  description: string;
  orderIndex: number;
  completed: boolean;
  contentStatus: TopicContentStatus;
  setId: number | null;
  noteId: number | null;
};

export type RoadmapChapter = {
  id: number;
  chapterKey: string;
  title: string;
  objective: string;
  orderIndex: number;
  status: ChapterStatus;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  topics: RoadmapTopic[];
};

export type Roadmap = {
  id: number;
  title: string;
  overview: string;
  status: RoadmapStatus;
  estimatedTotalHours: number;
  totalTopics: number;
  completedTopics: number;
  progressPercent: number;
  createdAt: string;
  setId: number | null;
  chapters: RoadmapChapter[];
};

export type RoadmapDetailResponse = ApiEnvelope<Roadmap>;
export type RoadmapListResponse = ApiEnvelope<Roadmap[]>;

/* ── Preview (stateless, snake_case) ── */

export type PreviewTopic = {
  topic_id: string;
  topic_title: string;
  description: string;
};

export type PreviewChapter = {
  chapter_id: string;
  chapter_title: string;
  objective: string;
  topics: PreviewTopic[];
};

export type PreviewRoadmap = {
  roadmap_title: string;
  overview: string;
  estimated_total_hours: number;
  chapters: PreviewChapter[];
};

export type PreviewRoadmapPayload = {
  goal: string;
  level: RoadmapLevel;
  language: RoadmapLanguage;
  referenceLinks?: string[];
};

export type PreviewRoadmapResponse = ApiEnvelope<PreviewRoadmap>;

export type CreateRoadmapPayload = PreviewRoadmap;

/* ── Topic actions ── */

export type StartTopicResponse = ApiEnvelope<{
  topicId: number;
  setId: number;
  contentStatus: TopicContentStatus;
}>;

export type CompleteTopicResponse = ApiEnvelope<{
  completedTopicId: number;
  chapterCompleted: boolean;
  nextUnlockedChapterId: number | null;
}>;

export type DeleteRoadmapResponse = ApiEnvelope<null>;
