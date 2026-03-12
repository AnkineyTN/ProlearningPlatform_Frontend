import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ExamHomeView from "./components/ExamHomeView";
import ExamTaking from "./components/ExamTaking";
import ExamResults from "./components/ExamResults";
import type { Exam, ExamResult, ExamSubmission } from "./types";
import { useExamDetail } from "@/hooks/useExams";
import { apiQuizDetailToExam } from "./utils/examMapper";

type ViewMode = "home" | "taking" | "results";

type Props = {
  setId: number;
  examId: number | string;
};

export default function ExamPage({ setId, examId }: Props) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  const { data, isLoading, isError } = useExamDetail(
    Number(setId),
    examId,
  );

  const exam: Exam | null = data?.data
    ? apiQuizDetailToExam(data.data)
    : null;
  const hasNoQuestions = exam !== null && exam.questions.length === 0;

  const handleStartExam = () => {
    setViewMode("taking");
  };

  const handleEditExam = () => {
    navigate(`/sets/${setId}/exams/${examId}/edit`, {
      state: {
        title: exam?.title,
        description: exam?.description,
        privacy: exam?.privacy,
      },
    });
  };

  const handleSubmitExam = (
    submissions: ExamSubmission[],
    timeTaken: number,
  ) => {
    if (!exam) return;

    let earnedScore = 0;
    exam.questions.forEach((question) => {
      const submission = submissions.find((s) => s.questionId === question.id);
      if (!submission) return;
      if (question.type === "ESSAY") return;

      const correctAnswerIds = question.answers
        .filter((a) => a.isCorrect)
        .map((a) => a.id)
        .sort();
      const selectedAnswerIds = [...submission.selectedAnswers].sort();

      const isCorrect =
        correctAnswerIds.length === selectedAnswerIds.length &&
        correctAnswerIds.every((id, idx) => id === selectedAnswerIds[idx]);

      if (isCorrect) {
        earnedScore += question.score;
      }
    });

    const percentage = (earnedScore / exam.totalScore) * 100;
    const passed = percentage >= 60;

    setExamResult({
      totalScore: exam.totalScore,
      earnedScore,
      percentage,
      passed,
      timeTaken,
      submissions,
    });
    setViewMode("results");
  };

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading exam...
        </div>
      </div>
    );
  }

  if (isError || !exam) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Failed to load exam. It may not exist or you may not have access.
          </p>
          <button
            onClick={() => navigate(`/sets/${setId}/exams`)}
            className="text-primary hover:underline"
          >
            Back to exams
          </button>
        </div>
      </div>
    );
  }

  if (hasNoQuestions) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-8">
        <div className="max-w-md w-full text-center bg-card border border-border rounded-xl p-8 shadow-lg">
          <p className="text-muted-foreground mb-6">
            Exam này chưa có question, hãy tạo question
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() =>
                navigate(`/sets/${setId}/exams/${examId}/edit`, {
                  state: {
                    title: exam?.title,
                    description: exam?.description,
                    privacy: exam?.privacy,
                  },
                })
              }
              className="text-primary hover:underline font-medium"
            >
              Chuyển sang trang Editor
            </button>
            <button
              onClick={() => navigate(`/sets/${setId}/exams`)}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "home") {
    return (
      <ExamHomeView
        exam={exam}
        onStartExam={handleStartExam}
        onEditExam={handleEditExam}
        onBack={() => navigate(`/sets/${setId}/exams`)}
      />
    );
  }

  if (viewMode === "taking") {
    return (
      <ExamTaking
        setId={Number(setId)}
        examId={Number(examId)}
        exam={exam}
        onSubmit={handleSubmitExam}
      />
    );
  }

  if (viewMode === "results" && examResult) {
    return (
      <ExamResults
        setId={Number(setId)}
        examId={Number(examId)}
        exam={exam}
        result={examResult}
      />
    );
  }

  return null;
}
