import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Award,
  Clock,
  FileText,
  BarChart3,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import type { Exam, ExamResult } from "../types";
import ModeToggle from "@/components/theme/mode-toggle";

interface ExamResultsProps {
  setId: number;
  examId: number;
  exam: Exam;
  result: ExamResult;
}

export default function ExamResults({
  setId,
  examId,
  exam,
  result,
}: ExamResultsProps) {
  const navigate = useNavigate();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getSubmissionForQuestion = (questionId: string | number) => {
    return result.submissions.find((s) => s.questionId === questionId);
  };

  const isAnswerCorrect = (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    const submission = getSubmissionForQuestion(questionId);
    if (!question || !submission) return false;
    if (question.type === "ESSAY") return null;
    const correctAnswerIds = question.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.id);
    const selectedAnswerIds = submission.selectedAnswers;
    if (correctAnswerIds.length !== selectedAnswerIds.length) return false;
    return correctAnswerIds.every((id) => selectedAnswerIds.includes(id));
  };

  const getQuestionScore = (questionId: string | number) => {
    const question = exam.questions.find((q) => q.id === questionId);
    const correct = isAnswerCorrect(questionId);
    if (!question) return 0;
    if (correct === null) return 0;
    return correct ? question.score : 0;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border sticky top-0 z-10">
        <div className="mx-auto py-4 px-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/sets/${setId}/exams`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Set
              </Button>
              <h1 className="text-2xl font-bold">Exam Results</h1>
            </div>
            <div className="flex items-center gap-8">
              <Button
                variant="outline"
                onClick={() => navigate(`/sets/${setId}/exams/${examId}`)}
              >
                View Exam
              </Button>
              <ModeToggle />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-8 mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 mb-4">
              {result.passed ? (
                <Award className="w-10 h-10 text-primary" />
              ) : (
                <FileText className="w-10 h-10 text-primary" />
              )}
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {result.passed ? "Congratulations!" : "Exam Completed"}
            </h2>
            <p className="text-muted-foreground">
              {result.passed
                ? "You passed the exam!"
                : "Keep practicing to improve your score"}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-background/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {result.percentage.toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Percentage</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1">
                {result.earnedScore}/{result.totalScore}
              </div>
              <div className="text-sm text-muted-foreground">Score</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1">
                {
                  exam.questions.filter((q) => isAnswerCorrect(q.id) === true)
                    .length
                }
                /{exam.questions.filter((q) => q.type !== "ESSAY").length}
              </div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="bg-background/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold mb-1">
                {formatTime(result.timeTaken)}
              </div>
              <div className="text-sm text-muted-foreground">Time Taken</div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-xl font-semibold">Question Review</h3>
          </div>
          <div className="space-y-6">
            {exam.questions.map((question, index) => {
              const submission = getSubmissionForQuestion(question.id);
              const correct = isAnswerCorrect(question.id);
              const score = getQuestionScore(question.id);
              return (
                <div
                  key={question.id}
                  className={`border-2 rounded-lg p-5 ${
                    correct === true
                      ? "border-green-200 bg-green-50/50 dark:bg-green-950/30 dark:border-green-800"
                      : correct === false
                        ? "border-red-200 bg-red-50/50 dark:bg-red-950/30 dark:border-red-800"
                        : "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/30 dark:border-yellow-800"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          correct === true
                            ? "bg-green-500 text-white"
                            : correct === false
                              ? "bg-red-500 text-white"
                              : "bg-yellow-500 text-white"
                        }`}
                      >
                        {correct === true ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : correct === false ? (
                          <XCircle className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium mb-1">Question {index + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {question.type === "MULTIPLE_CHOICE"
                            ? "Multiple Choice"
                            : question.type === "TRUE_FALSE"
                              ? "True/False"
                              : "Essay"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {score}/{question.score} points
                      </div>
                      {correct === null && (
                        <div className="text-xs text-yellow-600 mt-1">
                          Pending Grading (AI grading coming soon)
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-4 pl-11">
                    <p className="font-medium mb-3">{question.questionText}</p>
                    {question.type !== "ESSAY" && (
                      <div className="space-y-2">
                        {question.answers.map((answer) => {
                          const isSelected =
                            submission?.selectedAnswers.includes(answer.id);
                          const isCorrectAnswer = answer.isCorrect;
                          return (
                            <div
                              key={answer.id}
                              className={`p-3 rounded-lg border-2 ${
                                isCorrectAnswer
                                  ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                                  : isSelected
                                    ? "border-red-500 bg-red-50 dark:bg-red-950/30"
                                    : "border-border bg-background"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isCorrectAnswer && (
                                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                )}
                                {!isCorrectAnswer && isSelected && (
                                  <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                )}
                                <span
                                  className={
                                    isCorrectAnswer
                                      ? "font-medium text-green-700 dark:text-green-300"
                                      : isSelected
                                        ? "text-red-700 dark:text-red-300"
                                        : ""
                                  }
                                >
                                  {answer.text}
                                </span>
                                {isCorrectAnswer && (
                                  <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded">
                                    Correct Answer
                                  </span>
                                )}
                                {!isCorrectAnswer && isSelected && (
                                  <span className="ml-auto text-xs bg-red-600 text-white px-2 py-1 rounded">
                                    Your Answer
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {question.type === "ESSAY" && submission?.essayAnswer && (
                      <div className="bg-background border border-border rounded-lg p-4 mt-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Your Answer:
                        </p>
                        <p className="whitespace-pre-wrap">
                          {submission.essayAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <Button variant="outline" onClick={() => navigate(`/sets/${setId}`)}>
            Back to Set
          </Button>
          <Button onClick={() => navigate(`/sets/${setId}/exams/${examId}`)}>
            Review Exam
          </Button>
        </div>
      </div>
    </div>
  );
}
