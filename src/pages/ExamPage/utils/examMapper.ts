import type {
  Quiz,
  Question as ApiQuestion,
  QuestionOption,
  QuestionType as ApiQuestionType,
  CreateQuestionApiPayload,
} from '@/services/types/exam.types';
import type {
  Exam,
  ExamQuestion,
  Answer,
  QuestionType as UiQuestionType,
} from '../types';

const DEFAULT_SCORE = 10;

// API QuestionType -> UI QuestionType
export function apiQuestionTypeToUi(type: ApiQuestionType): UiQuestionType {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'MULTIPLE_CHOICE';
    case 'TRUE_FALSE':
      return 'TRUE_FALSE';
    case 'ESSAY':
      return 'ESSAY';
    default:
      return 'MULTIPLE_CHOICE';
  }
}

// UI QuestionType -> API QuestionType
export function uiQuestionTypeToApi(type: UiQuestionType): ApiQuestionType {
  switch (type) {
    case 'MULTIPLE_CHOICE':
      return 'MULTIPLE_CHOICE';
    case 'TRUE_FALSE':
      return 'TRUE_FALSE';
    case 'ESSAY':
      return 'ESSAY';
    default:
      return 'MULTIPLE_CHOICE';
  }
}

// API QuestionOption -> UI Answer (prefer backend option id for submit payloads)
function apiOptionToAnswer(opt: QuestionOption, answerId: string): Answer {
  return {
    id: answerId,
    text: opt.optionText,
    isCorrect: opt.isCorrect,
  };
}

// UI Answer -> API QuestionOption
function uiAnswerToOption(ans: Answer): QuestionOption {
  return {
    optionText: ans.text,
    isCorrect: ans.isCorrect,
  };
}

// API Question -> UI ExamQuestion (backend may return "type"/"content" or "questionType"/"questionText")
export function apiQuestionToUi(
  q: ApiQuestion & { type?: ApiQuestionType; content?: string },
): ExamQuestion {
  const apiType = q.type ?? q.questionType;
  const type = apiQuestionTypeToUi(apiType);
  const answers: Answer[] =
    type === 'ESSAY'
      ? []
      : (q.options ?? []).map((opt, index) => {
          const raw = opt as QuestionOption & { id?: number | string };
          const answerId =
            raw.id !== undefined && raw.id !== null
              ? String(raw.id)
              : `opt-${index}`;
          return apiOptionToAnswer(opt, answerId);
        });

  return {
    id: q.id,
    type,
    questionText: (q as { content?: string }).content ?? q.questionText ?? '',
    answers,
    score: DEFAULT_SCORE,
    _action: null,
  };
}

// UI ExamQuestion -> CreateQuestionApiPayload (backend: content, type, options)
export function uiQuestionToCreateRequest(
  q: ExamQuestion,
): CreateQuestionApiPayload {
  return {
    content: q.questionText || '',
    type: uiQuestionTypeToApi(q.type),
    options: q.type === 'ESSAY' ? [] : q.answers.map(uiAnswerToOption),
  };
}

/**
 * Parse AI-generated exam content string into ExamQuestion[].
 *
 * Format: questions separated by ";"
 *   MCQ|questionText|opt1|opt2|opt3|opt4|correctIndex
 *   TF|questionText|True/False
 *   ESS|questionText|sampleAnswer
 */
export function parseAIGeneratedContent(content: string): ExamQuestion[] {
  const raw = content.trim();
  if (!raw) return [];

  const parts = raw
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  const questions: ExamQuestion[] = [];

  for (const part of parts) {
    const segments = part.split('|');
    if (segments.length < 2) continue;

    const qType = segments[0].trim();

    if (qType === 'MCQ' && segments.length >= 7) {
      const questionText = segments[1].trim();
      const options = segments.slice(2, -1);
      const correctIdx = parseInt(segments[segments.length - 1].trim(), 10);

      questions.push({
        id: crypto.randomUUID(),
        type: 'MULTIPLE_CHOICE',
        questionText,
        answers: options.map((opt, i) => ({
          id: crypto.randomUUID(),
          text: opt.trim(),
          isCorrect: i + 1 === correctIdx,
        })),
        score: 10,
        _action: 'CREATE',
      });
    } else if (qType === 'TF' && segments.length >= 3) {
      const questionText = segments[1].trim();
      const correctAnswer = segments[2].trim().toLowerCase();

      questions.push({
        id: crypto.randomUUID(),
        type: 'TRUE_FALSE',
        questionText,
        answers: [
          { id: 'true', text: 'True', isCorrect: correctAnswer === 'true' },
          { id: 'false', text: 'False', isCorrect: correctAnswer === 'false' },
        ],
        score: 10,
        _action: 'CREATE',
      });
    } else if (qType === 'ESS' && segments.length >= 2) {
      questions.push({
        id: crypto.randomUUID(),
        type: 'ESSAY',
        questionText: segments[1].trim(),
        explanation: segments.length >= 3 ? segments[2].trim() : undefined,
        answers: [],
        score: 10,
        _action: 'CREATE',
      });
    }
  }

  return questions;
}

// Quiz + questions -> Exam (UI)
export function apiQuizDetailToExam(
  quiz: Quiz & { questions?: ApiQuestion[] },
): Exam {
  const questions: ExamQuestion[] = (quiz.questions ?? []).map(apiQuestionToUi);
  const totalScore = questions.reduce(
    (sum, q) => sum + (q.score ?? DEFAULT_SCORE),
    0,
  );

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description ?? '',
    privacy: quiz.privacy === 'PUBLIC' ? 'Public' : 'Private',
    totalScore,
    timeLimit: quiz.duration ?? 30,
    passingScore:
      quiz.passingScore != null && !Number.isNaN(Number(quiz.passingScore))
        ? Number(quiz.passingScore)
        : 60,
    questions,
  };
}
