import { getApiError } from "@/lib/apiError";
import { examAPI } from "@/services/endpoints/exam";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import type {
  CreateQuizRequest,
  CreateQuestionApiPayload,
  ExamAIDifficultyDistribution,
  Question,
  Quiz,
  UpdateQuizRequest,
  UpdateQuestionRequest,
  NoteAIInput,
} from "@/services/types/exam.types";

interface UseExamsParams {
  setId: number;
  page?: number;
  size?: number;
  sort?: string;
  q?: string;
  privacy?: "PUBLIC" | "PRIVATE";
  createMethod?: "MANUAL" | "AI" | "REVIEW";
}

export const useExams = ({
  setId,
  page = 0,
  size = 10,
  sort = "id,ASC",
  q,
  privacy,
  createMethod,
}: UseExamsParams) => {
  return useQuery({
    queryKey: ["exams", setId, page, size, sort, q ?? "", privacy ?? "", createMethod ?? ""],
    queryFn: async () => {
      const response = await examAPI.getQuizzes(setId, {
        page,
        size,
        sort,
        q,
        privacy,
        createMethod,
      });
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!setId,
    placeholderData: (previousData) => previousData,
  });
};

const retryUnlessDenied = (failureCount: number, error: unknown) => {
  const status = getApiError(error).status;
  if (status === 401 || status === 403 || status === 404) return false;
  return failureCount < 2;
};

export const useExamDetail = (setId: number, examId: number | string) => {
  const [quizResult, questionsResult, examsResult] = useQueries({
    queries: [
      {
        queryKey: ["exam-quiz", setId, examId],
        queryFn: async () => {
          const response = await examAPI.getQuizById(setId, Number(examId));
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!setId && !!examId,
        retry: retryUnlessDenied,
      },
      {
        queryKey: ["exam-questions", setId, examId, 0, 100, "id,ASC"],
        queryFn: async () => {
          const response = await examAPI.getQuestions(
            setId,
            Number(examId),
            0,
            100,
            "id,ASC",
          );
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!setId && !!examId,
        retry: retryUnlessDenied,
      },
      {
        queryKey: ["exams", setId, 0, 100, "id,ASC"],
        queryFn: async () => {
          const response = await examAPI.getQuizzes(setId, {
            page: 0,
            size: 100,
            sort: "id,ASC",
          });
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!setId && !!examId,
        retry: retryUnlessDenied,
      },
    ],
  });

  const quizData = quizResult.data as { data?: Quiz } | undefined;
  const questionsData = questionsResult.data as
    | { data?: { questions?: unknown[] } }
    | undefined;
  const examsData = examsResult.data as { data?: Quiz[] } | undefined;
  const quiz =
    quizData?.data ??
    examsData?.data?.find((q: Quiz) => String(q.id) === String(examId));
  const isLoading =
    questionsResult.isLoading || quizResult.isLoading || examsResult.isLoading;
  const isError =
    questionsResult.isError || (quiz === undefined && !isLoading);

  const data = useMemo(
    () =>
      quiz !== undefined
        ? {
            status: "success",
            message: "",
            data: {
              ...quiz,
              questions: (questionsData?.data?.questions ?? []) as Question[],
            },
            metadata: {} as const,
          }
        : undefined,
    [quiz, questionsData?.data?.questions],
  );

  return {
    data,
    isLoading,
    isError,
    error: quizResult.error ?? questionsResult.error ?? examsResult.error,
    refetch: () => {
      quizResult.refetch();
      questionsResult.refetch();
      examsResult.refetch();
    },
  };
};

export const useExamAttempt = (
  setId: number,
  examId: number | string,
  attemptId: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["exam-attempt", setId, examId, attemptId],
    queryFn: async () => {
      const response = await examAPI.getExamAttempt(
        setId,
        Number(examId),
        attemptId,
      );
      return response.data;
    },
    staleTime: 60 * 1000,
    enabled: !!setId && !!examId && !!attemptId && enabled,
  });
};

export const useExamQuestions = (
  setId: number,
  examId: number | string,
  page = 0,
  size = 10,
  sort = "id,ASC",
) => {
  return useQuery({
    queryKey: ["exam-questions", setId, examId, page, size, sort],
    queryFn: async () => {
      const response = await examAPI.getQuestions(
        setId,
        Number(examId),
        page,
        size,
        sort,
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!setId && !!examId,
  });
};

export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      data,
    }: {
      setId: number;
      data: CreateQuizRequest;
    }) => examAPI.createQuiz(setId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
      });
    },
  });
};

export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      examId,
      data,
    }: {
      setId: number;
      examId: number | string;
      data: UpdateQuizRequest;
    }) => examAPI.updateQuiz(setId, Number(examId), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
      });
      queryClient.invalidateQueries({
        queryKey: ["exam-quiz", variables.setId, variables.examId],
      });
      queryClient.invalidateQueries({
        queryKey: ["exam-questions", variables.setId, variables.examId],
      });
    },
  });
};

export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      examId,
    }: {
      setId: number;
      examId: number | string;
    }) => examAPI.deleteQuiz(setId, Number(examId)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
      });
    },
  });
};

export const useCreateQuestions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      examId,
      data,
    }: {
      setId: number;
      examId: number | string;
      data: CreateQuestionApiPayload[];
    }) => examAPI.createQuestions(setId, Number(examId), data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exam-questions", variables.setId, variables.examId],
      });
      queryClient.invalidateQueries({
        queryKey: ["exam-quiz", variables.setId, variables.examId],
      });
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
      });
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      examId,
      questionId,
      data,
    }: {
      setId: number;
      examId: number | string;
      questionId: number | string;
      data: UpdateQuestionRequest;
    }) =>
      examAPI.updateQuestion(
        setId,
        Number(examId),
        Number(questionId),
        data,
      ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exam-questions", variables.setId, variables.examId],
      });
    },
  });
};

export const useGenerateExamFromFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setId,
      files,
      questionCounts,
      language,
      difficulty,
      freeText,
    }: {
      setId: number;
      files: File[];
      questionCounts: { MCQ: number; TF: number; ESS: number };
      language: string;
      difficulty: ExamAIDifficultyDistribution;
      freeText: string;
    }) => {
      const response = await examAPI.generateExamFromFiles(
        setId,
        files,
        questionCounts,
        difficulty,
        freeText,
        language,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
      });
    },
  });
};

export const useGenerateExamFromNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setId,
      notes,
      questionCounts,
      language,
      difficulty,
      freeText,
    }: {
      setId: number;
      notes: NoteAIInput[];
      questionCounts: { MCQ: number; TF: number; ESS: number };
      language: string;
      difficulty: ExamAIDifficultyDistribution;
      freeText: string;
    }) => {
      const response = await examAPI.generateExamFromNotes(
        setId,
        notes,
        questionCounts,
        difficulty,
        freeText,
        language,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
      });
    },
  });
};

export const useGenerateExamFromWeb = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setId,
      urls,
      questionCounts,
      language,
      difficulty,
      freeText,
    }: {
      setId: number;
      urls: string[];
      questionCounts: { MCQ: number; TF: number; ESS: number };
      language: string;
      difficulty: ExamAIDifficultyDistribution;
      freeText: string;
    }) => {
      const response = await examAPI.generateExamFromWeb(setId, {
        urls,
        questions: questionCounts,
        difficulty,
        language,
        free_text: freeText.trim(),
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
      });
    },
  });
};

export const useGenerateExamFromExistingExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      setId,
      file,
      description,
    }: {
      setId: number;
      file: File;
      description?: string;
    }) => {
      const response = await examAPI.generateExamFromExistingExam(setId, file, description);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['exams', variables.setId],
      });
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      examId,
      questionId,
    }: {
      setId: number;
      examId: number | string;
      questionId: number | string;
    }) =>
      examAPI.deleteQuestion(setId, Number(examId), Number(questionId)),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exam-questions", variables.setId, variables.examId],
      });
      queryClient.invalidateQueries({
        queryKey: ["exam-quiz", variables.setId, variables.examId],
      });
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
      });
    },
  });
};
