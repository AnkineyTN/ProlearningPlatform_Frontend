import type {
  ExamAttemptAnswerPayload,
  ExamAttemptDetail,
} from '@/services/types/exam.types';
import type { Exam, ExamResult, ExamSubmission } from '../types';

function toNumericQuestionId(id: string | number): number {
  const n = Number(id);
  return Number.isNaN(n) ? 0 : n;
}

function firstNumericOptionId(
  submission: ExamSubmission | undefined,
): number | null {
  for (const raw of submission?.selectedAnswers ?? []) {
    const n = Number(raw);
    if (!Number.isNaN(n)) return n;
  }
  return null;
}

/**
 * Build submit body: one row per question (backend sample uses single selectedOptionId per question).
 */
export function buildExamAttemptAnswers(
  exam: Exam,
  submissions: ExamSubmission[],
): ExamAttemptAnswerPayload[] {
  return exam.questions.map((q) => {
    const qid = toNumericQuestionId(q.id);
    const sub = submissions.find((s) => s.questionId === q.id);
    if (q.type === 'ESSAY') {
      return {
        questionId: qid,
        selectedOptionId: null,
        essayAnswer: sub?.essayAnswer?.trim() ?? '',
      };
    }
    return {
      questionId: qid,
      selectedOptionId: firstNumericOptionId(sub),
      essayAnswer: '',
    };
  });
}

export function examAttemptDetailToExamResult(
  detail: ExamAttemptDetail,
  exam: Exam,
  submissions: ExamSubmission[],
  timeTaken: number,
): ExamResult {
  const totalPoints =
    detail.totalPoints != null && detail.totalPoints > 0
      ? detail.totalPoints
      : exam.totalScore;
  const rawScore = detail.score;
  const score =
    rawScore != null && !Number.isNaN(Number(rawScore)) ? Number(rawScore) : 0;
  const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
  const passThreshold = exam.passingScore ?? 60;
  const passed = percentage >= passThreshold;
  const graded = detail.answers ?? [];

  return {
    totalScore: totalPoints,
    earnedScore: score,
    percentage,
    passed,
    timeTaken,
    submissions,
    attemptId: detail.id,
    gradedByBackend: graded.length ? graded : undefined,
  };
}
