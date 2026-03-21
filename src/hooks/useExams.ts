import { examAPI } from "@/services/endpoints/exam";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import type {
  CreateQuizRequest,
  CreateQuestionApiPayload,
  Question,
  Quiz,
  UpdateQuizRequest,
  UpdateQuestionRequest,
} from "@/services/types/exam.types";

interface UseExamsParams {
  setId: number;
  page?: number;
  size?: number;
  sort?: string;
}

export const useExams = ({
  setId,
  page = 0,
  size = 10,
  sort = "id,ASC",
}: UseExamsParams) => {
  return useQuery({
    queryKey: ["exams", setId, page, size, sort],
    queryFn: async () => {
      const response = await examAPI.getQuizzes(setId, page, size, sort);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!setId,
    placeholderData: (previousData) => previousData,
  });
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
        retry: (_, error) => {
          const err = error as { response?: { status?: number } };
          return err?.response?.status !== 404;
        },
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
      },
      {
        queryKey: ["exams", setId, 0, 100, "id,ASC"],
        queryFn: async () => {
          const response = await examAPI.getQuizzes(setId, 0, 100, "id,ASC");
          return response.data;
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!setId && !!examId,
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
    refetch: () => {
      quizResult.refetch();
      questionsResult.refetch();
      examsResult.refetch();
    },
  };
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
        queryKey: ["exam-detail", variables.setId, variables.examId],
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
        queryKey: ["exam-detail", variables.setId, variables.examId],
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
        queryKey: ["exam-detail", variables.setId, variables.examId],
      });
    },
  });
};

export const useGenerateExamFromFiles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      setId,
      files,
      questionCounts,
      language,
      difficulty,
      specialRequirements,
    }: {
      setId: number;
      files: File[];
      questionCounts: { MCQ: number; TF: number; ESS: number };
      language: string;
      difficulty?: string;
      specialRequirements?: string;
    }) =>
      examAPI.generateExamFromFiles(setId, files, questionCounts, language, {
        difficulty,
        specialRequirements,
      }),
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
    mutationFn: ({
      setId,
      noteIds,
      questionCounts,
      language,
      difficulty,
      specialRequirements,
    }: {
      setId: number;
      noteIds: number[];
      questionCounts: { MCQ: number; TF: number; ESS: number };
      language: string;
      difficulty?: string;
      specialRequirements?: string;
    }) =>
      examAPI.generateExamFromNotes(setId, {
        noteIds,
        questions: questionCounts,
        language,
        ...(difficulty ? { difficulty } : {}),
        ...(specialRequirements?.trim()
          ? { specialRequirements: specialRequirements.trim() }
          : {}),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
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
        queryKey: ["exam-detail", variables.setId, variables.examId],
      });
      queryClient.invalidateQueries({
        queryKey: ["exams", variables.setId],
      });
    },
  });
};
