import type { KnowledgeAnalysis } from '@/services/types/knowledge-analysis.types';

export type AnalysisTarget =
  | { kind: 'flashcard'; setId: number; flashcardId: number; sessionId: number }
  | { kind: 'exam'; setId: number; examId: number; attemptId: number }
  | { kind: 'set'; setId: number };

export type Phase =
  | { state: 'loading' }
  | { state: 'ready'; analysis: KnowledgeAnalysis }
  | { state: 'no-topics' }
  | { state: 'set-empty' }
  | { state: 'error'; message: string };
