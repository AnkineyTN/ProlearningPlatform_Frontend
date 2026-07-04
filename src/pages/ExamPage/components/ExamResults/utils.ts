import type {
  ExamAttemptSummary,
  ExamGradedAnswer,
} from '@/services/types/exam.types';
import type { Exam, ExamResult } from '../../types';

export const normalizeIsoString = (iso: string) =>
  iso.replace(/(\.\d{3})\d+/, '$1').replace(' ', 'T');

export const formatAttemptDateTime = (
  iso: string | null | undefined,
  language: string,
) => {
  if (!iso) return '—';
  const normalized = normalizeIsoString(iso.trim());
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(language, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
};

export const sortAttemptsByRecency = (rows: ExamAttemptSummary[]) =>
  [...rows].sort((a, b) => {
    const ts = (x: ExamAttemptSummary) => {
      const raw = x.submittedAt ?? x.startedAt;
      const ms = new Date(normalizeIsoString(raw)).getTime();
      return Number.isNaN(ms) ? 0 : ms;
    };
    return ts(b) - ts(a) || b.id - a.id;
  });

export const createResultHelpers = (exam: Exam, result: ExamResult) => {
  const getSubmissionForQuestion = (questionId: string | number) =>
    result.submissions.find((s) => s.questionId === questionId);

  const getGradedForQuestion = (
    questionId: string | number,
  ): ExamGradedAnswer | undefined =>
    result.gradedByBackend?.find(
      (g) => String(g.questionId) === String(questionId),
    );

  const isAnswerCorrect = (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    const graded = getGradedForQuestion(questionId);

    if (question?.type === 'ESSAY') {
      if (!graded) return null;
      if (typeof graded.isCorrect === 'boolean') return graded.isCorrect;
      // AI essay grading awards partial credit rather than a strict pass/fail
      // flag, so treat >=80% of the max points as correct instead of
      // requiring a perfect score.
      if (!question.score) return null;
      return (graded.earnedPoints ?? 0) >= question.score * 0.8;
    }

    if (graded) return graded.isCorrect;
    const submission = getSubmissionForQuestion(questionId);
    if (!question || !submission) return false;
    const correctAnswerIds = question.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.id);
    const selectedAnswerIds = submission.selectedAnswers;
    if (correctAnswerIds.length !== selectedAnswerIds.length) return false;
    return correctAnswerIds.every((id) => selectedAnswerIds.includes(id));
  };

  const getQuestionScore = (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    const graded = getGradedForQuestion(questionId);
    if (graded) return graded.earnedPoints ?? 0;
    const correct = isAnswerCorrect(questionId);
    if (!question) return 0;
    if (correct === null) return 0;
    return correct ? question.score : 0;
  };

  const isOptionSelected = (
    answerId: string,
    graded: ExamGradedAnswer | undefined,
    submissionSelected: boolean,
  ) => {
    if (graded && graded.selectedOptionId != null) {
      return (
        String(graded.selectedOptionId) === answerId ||
        Number(answerId) === graded.selectedOptionId
      );
    }
    return submissionSelected;
  };

  const showExplainAi = (questionId: string | number) => {
    const q = exam.questions.find((x) => x.id === questionId);
    const graded = getGradedForQuestion(questionId);
    if (!q) return false;
    if (q.type === 'ESSAY') return true;
    if (graded) return !graded.isCorrect;
    return isAnswerCorrect(questionId) !== true;
  };

  return {
    getSubmissionForQuestion,
    getGradedForQuestion,
    isAnswerCorrect,
    getQuestionScore,
    isOptionSelected,
    showExplainAi,
  };
};

export type ResultHelpers = ReturnType<typeof createResultHelpers>;
