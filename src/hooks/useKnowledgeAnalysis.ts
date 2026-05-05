import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { knowledgeAnalysisAPI } from '@/services/endpoints/knowledge-analysis';

export const flashcardAnalysisKey = (setId: number, flashcardId: number) =>
  ['knowledge-analysis', 'flashcard', setId, flashcardId] as const;

export const examAnalysisKey = (setId: number, examId: number) =>
  ['knowledge-analysis', 'exam', setId, examId] as const;

export const setAnalysisKey = (setId: number) =>
  ['knowledge-analysis', 'set', setId] as const;

export const useFlashcardAnalyses = (
  setId: number,
  flashcardId: number,
  enabled = true,
) =>
  useQuery({
    queryKey: flashcardAnalysisKey(setId, flashcardId),
    queryFn: async () => {
      const res = await knowledgeAnalysisAPI.getFlashcardAnalyses(
        setId,
        flashcardId,
      );
      return res.data.data;
    },
    enabled: enabled && setId > 0 && flashcardId > 0,
  });

export const useExamAnalyses = (
  setId: number,
  examId: number,
  enabled = true,
) =>
  useQuery({
    queryKey: examAnalysisKey(setId, examId),
    queryFn: async () => {
      const res = await knowledgeAnalysisAPI.getExamAnalyses(setId, examId);
      return res.data.data;
    },
    enabled: enabled && setId > 0 && examId > 0,
  });

export const useSetAnalyses = (setId: number, enabled = true) =>
  useQuery({
    queryKey: setAnalysisKey(setId),
    queryFn: async () => {
      const res = await knowledgeAnalysisAPI.getSetAnalyses(setId);
      return res.data.data;
    },
    enabled: enabled && setId > 0,
  });

export const useTriggerFlashcardAnalysis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      setId,
      flashcardId,
      sessionId,
    }: {
      setId: number;
      flashcardId: number;
      sessionId: number;
    }) =>
      knowledgeAnalysisAPI.triggerFlashcardAnalysis(
        setId,
        flashcardId,
        sessionId,
      ),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({
        queryKey: flashcardAnalysisKey(vars.setId, vars.flashcardId),
      });
      qc.invalidateQueries({ queryKey: setAnalysisKey(vars.setId) });
    },
  });
};

export const useTriggerExamAnalysis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      setId,
      examId,
      attemptId,
    }: {
      setId: number;
      examId: number;
      attemptId: number;
    }) => knowledgeAnalysisAPI.triggerExamAnalysis(setId, examId, attemptId),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({
        queryKey: examAnalysisKey(vars.setId, vars.examId),
      });
      qc.invalidateQueries({ queryKey: setAnalysisKey(vars.setId) });
    },
  });
};

export const useTriggerSetAnalysis = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ setId }: { setId: number }) =>
      knowledgeAnalysisAPI.triggerSetAnalysis(setId),
    onSuccess: (_res, vars) => {
      qc.invalidateQueries({ queryKey: setAnalysisKey(vars.setId) });
    },
  });
};

export const useAssignFlashcardTopics = () =>
  useMutation({
    mutationFn: ({
      setId,
      flashcardId,
    }: {
      setId: number;
      flashcardId: number;
    }) => knowledgeAnalysisAPI.assignFlashcardTopics(setId, flashcardId),
  });

export const useAssignExamTopics = () =>
  useMutation({
    mutationFn: ({ setId, examId }: { setId: number; examId: number }) =>
      knowledgeAnalysisAPI.assignExamTopics(setId, examId),
  });
