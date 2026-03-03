import { AlertCircle, ArrowLeft, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Test, TestSubmission } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TestTakingProps {
  setId: number;
  testId: number;
  test: Test;
  onSubmit: (submissions: TestSubmission[], timeTaken: number) => void;
}

export default function TestTaking({
  setId,
  testId,
  test,
  onSubmit,
}: TestTakingProps) {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [submissions, setSubmissions] = useState<
    Map<string | number, TestSubmission>
  >(new Map());
  const [timeRemaining, setTimeRemaining] = useState(test.timeLimit * 60); // in seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set(),
  );

  const currentQuestion = test.questions[currentQuestionIndex];
  const totalQuestions = test.questions.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerChange = (
    questionId: string | number,
    answerId: string,
    isChecked: boolean,
  ) => {
    const currentSubmission = submissions.get(questionId) || {
      questionId,
      selectedAnswers: [],
    };

    const question = test.questions.find((q) => q.id === questionId);
    if (!question) return;

    let newSelectedAnswers: string[];

    if (question.type === "true-false") {
      newSelectedAnswers = [answerId];
    } else {
      if (isChecked) {
        newSelectedAnswers = [...currentSubmission.selectedAnswers, answerId];
      } else {
        newSelectedAnswers = currentSubmission.selectedAnswers.filter(
          (id) => id !== answerId,
        );
      }
    }

    const newSubmission: TestSubmission = {
      ...currentSubmission,
      selectedAnswers: newSelectedAnswers,
    };

    setSubmissions(new Map(submissions.set(questionId, newSubmission)));

    // Mark question as answered if it has any selection
    if (newSelectedAnswers.length > 0) {
      setAnsweredQuestions(
        new Set(answeredQuestions.add(currentQuestionIndex)),
      );
    } else {
      const newAnswered = new Set(answeredQuestions);
      newAnswered.delete(currentQuestionIndex);
      setAnsweredQuestions(newAnswered);
    }
  };

  const handleEssayChange = (questionId: string | number, text: string) => {
    const newSubmission: TestSubmission = {
      questionId,
      selectedAnswers: [],
      essayAnswer: text,
    };

    setSubmissions(new Map(submissions.set(questionId, newSubmission)));

    if (text.trim()) {
      setAnsweredQuestions(
        new Set(answeredQuestions.add(currentQuestionIndex)),
      );
    } else {
      const newAnswered = new Set(answeredQuestions);
      newAnswered.delete(currentQuestionIndex);
      setAnsweredQuestions(newAnswered);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = (timeExpired = false) => {
    if (timeExpired) {
      toast.warning("Time's up! Submitting your test...");
    }
    const submissionsArray = Array.from(submissions.values());
    const timeTaken = test.timeLimit * 60 - timeRemaining;
    onSubmit(submissionsArray, timeTaken);
  };

  const currentSubmission = submissions.get(currentQuestion.id);

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <div className='bg-card border-b border-border sticky top-0 z-10'>
        <div className='max-w-6xl mx-auto px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => navigate(`/sets/${setId}/tests/${testId}`)}
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back
              </Button>
              <h1 className='text-2xl font-bold'>{test.title}</h1>
            </div>
            <div className='flex items-center gap-4'>
              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  timeRemaining < 300
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                <Clock className='w-5 h-5' />
                <span className='font-semibold text-lg'>
                  {formatTime(timeRemaining)}
                </span>
              </div>
              <Button onClick={() => setShowSubmitDialog(true)}>
                Submit Test
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-12 gap-6'>
          {/* Main Question Area */}
          <div className='col-span-8'>
            <div className='bg-card border border-border rounded-lg p-6'>
              {/* Question Header */}
              <div className='flex items-center justify-between mb-4 pb-4 border-b border-border'>
                <div>
                  <span className='text-sm text-muted-foreground'>
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='text-xs bg-primary/10 text-primary px-2 py-1 rounded'>
                      {currentQuestion.type === "multiple-choice"
                        ? "Multiple Choice"
                        : currentQuestion.type === "true-false"
                          ? "True/False"
                          : "Essay"}
                    </span>
                    <span className='text-xs bg-secondary/10 text-secondary-foreground px-2 py-1 rounded'>
                      {currentQuestion.score} points
                    </span>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className='mb-6'>
                <p className='text-lg font-medium mb-4'>
                  {currentQuestion.questionText}
                </p>
              </div>

              {/* Answers */}
              {currentQuestion.type !== "essay" ? (
                <div className='space-y-3'>
                  {currentQuestion.answers.map((answer) => (
                    <label
                      key={answer.id}
                      className='flex items-start gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors'
                    >
                      <Checkbox
                        checked={
                          currentSubmission?.selectedAnswers.includes(
                            answer.id,
                          ) || false
                        }
                        onCheckedChange={(checked) =>
                          handleAnswerChange(
                            currentQuestion.id,
                            answer.id,
                            checked as boolean,
                          )
                        }
                      />
                      <span className='flex-1'>{answer.text}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <Textarea
                    value={currentSubmission?.essayAnswer || ""}
                    onChange={(e) =>
                      handleEssayChange(currentQuestion.id, e.target.value)
                    }
                    placeholder='Type your answer here...'
                    className='w-full min-h-[200px] resize-none'
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className='flex items-center justify-between mt-6 pt-6 border-t border-border'>
                <Button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  variant='outline'
                >
                  Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>

          {/* Question Navigator Sidebar */}
          <div className='col-span-4'>
            <div className='bg-card border border-border rounded-lg p-4 sticky top-24'>
              <h3 className='font-semibold mb-4'>Questions</h3>
              <div className='grid grid-cols-5 gap-2'>
                {test.questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => handleQuestionNavigation(index)}
                    className={`
                      aspect-square rounded-lg border-2 font-semibold text-sm
                      transition-all hover:scale-105
                      ${
                        index === currentQuestionIndex
                          ? "border-primary bg-primary text-primary-foreground"
                          : answeredQuestions.has(index)
                            ? "border-green-500 bg-green-50 text-green-700"
                            : "border-border bg-background"
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className='mt-6 space-y-2 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded bg-primary' />
                  <span>Current</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded bg-green-50 border-2 border-green-500' />
                  <span>Answered</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded bg-background border-2 border-border' />
                  <span>Not Answered</span>
                </div>
              </div>

              <div className='mt-6 pt-4 border-t border-border'>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Answered:</span>
                    <span className='font-semibold'>
                      {answeredQuestions.size}/{totalQuestions}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>Total Score:</span>
                    <span className='font-semibold'>{test.totalScore}</span>
                  </div>
                </div>
              </div>

              {answeredQuestions.size < totalQuestions && (
                <div className='mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800'>
                  <AlertCircle className='w-4 h-4 inline mr-1' />
                  You have unanswered questions
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Test?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to submit your test? You have answered{" "}
              {answeredQuestions.size} out of {totalQuestions} questions.
              {answeredQuestions.size < totalQuestions && (
                <span className='block mt-2 text-yellow-600'>
                  Warning: You still have unanswered questions.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Test</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSubmitDialog(false);
                handleSubmit();
              }}
            >
              Submit Test
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
