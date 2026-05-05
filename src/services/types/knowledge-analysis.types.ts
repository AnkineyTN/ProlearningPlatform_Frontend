export type AnalysisSourceType = 'FLASHCARD' | 'EXAM' | 'SET';

export type TopicAccuracy = {
  topic: string;
  accuracy: number;
};

export type ContributingSource = {
  sourceType: 'FLASHCARD' | 'EXAM';
  sourceId: number;
  analysisId: number;
  analyzedAt: string;
};

export type KnowledgeAnalysis = {
  id: number;
  sourceType: AnalysisSourceType;
  sourceId: number;
  sessionRefId: number | null;
  topicAccuracies: TopicAccuracy[];
  strengths: string;
  weaknesses: string;
  improvements: string;
  createdAt: string;
  contributingSources: ContributingSource[] | null;
};

export type AnalysisEnvelope<T> = {
  status: string;
  message: string;
  data: T;
};

export type AnalysisResponse = AnalysisEnvelope<KnowledgeAnalysis>;
export type AnalysisListResponse = AnalysisEnvelope<KnowledgeAnalysis[]>;
export type TopicAssignResponse = AnalysisEnvelope<{ assigned: number }>;
