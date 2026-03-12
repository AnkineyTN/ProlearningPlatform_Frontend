import type {
  Quiz,
  Question as ApiQuestion,
  QuestionOption,
  QuestionType as ApiQuestionType,
  CreateQuestionApiPayload,
} from "@/services/types/exam.types";
import type {
  Exam,
  ExamQuestion,
  Answer,
  QuestionType as UiQuestionType,
} from "../types";

const DEFAULT_SCORE = 10;

// API QuestionType -> UI QuestionType
export function apiQuestionTypeToUi(
  type: ApiQuestionType,
): UiQuestionType {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return "MULTIPLE_CHOICE";
    case "TRUE_FALSE":
      return "TRUE_FALSE";
    case "ESSAY":
      return "ESSAY";
    default:
      return "MULTIPLE_CHOICE";
  }
}

// UI QuestionType -> API QuestionType
export function uiQuestionTypeToApi(
  type: UiQuestionType,
): ApiQuestionType {
  switch (type) {
    case "MULTIPLE_CHOICE":
      return "MULTIPLE_CHOICE";
    case "TRUE_FALSE":
      return "TRUE_FALSE";
    case "ESSAY":
      return "ESSAY";
    default:
      return "MULTIPLE_CHOICE";
  }
}

// API QuestionOption -> UI Answer
function apiOptionToAnswer(opt: QuestionOption & { id: string }): Answer {
  return {
    id: opt.id,
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
export function apiQuestionToUi(q: ApiQuestion & { type?: ApiQuestionType; content?: string }): ExamQuestion {
  const apiType = q.type ?? q.questionType;
  const type = apiQuestionTypeToUi(apiType);
  const answers: Answer[] =
    type === "ESSAY"
      ? []
      : (q.options ?? []).map((opt, index) =>
          apiOptionToAnswer({ ...opt, id: (opt as { id?: string }).id ?? `opt-${index}` })
        );

  return {
    id: q.id,
    type,
    questionText: (q as { content?: string }).content ?? q.questionText ?? "",
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
    content: q.questionText || "",
    type: uiQuestionTypeToApi(q.type),
    options:
      q.type === "ESSAY"
        ? []
        : q.answers.map(uiAnswerToOption),
  };
}

// Quiz + questions -> Exam (UI)
export function apiQuizDetailToExam(
  quiz: Quiz & { questions?: ApiQuestion[] },
): Exam {
  const questions: ExamQuestion[] = (quiz.questions ?? []).map(
    apiQuestionToUi,
  );
  const totalScore = questions.reduce((sum, q) => sum + (q.score ?? DEFAULT_SCORE), 0);

  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description ?? "",
    privacy: quiz.privacy === "PUBLIC" ? "Public" : "Private",
    totalScore,
    timeLimit: quiz.duration ?? 30,
    questions,
  };
}
