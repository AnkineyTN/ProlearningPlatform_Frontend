import { ArrowLeft, Plus, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import QuestionItem from "./QuestionItem";
import type { ExamQuestion } from "../types";
import {
  useCreateExam,
  useUpdateExam,
  useCreateQuestions,
  useUpdateQuestion,
  useDeleteQuestion,
  useExamDetail,
} from "@/hooks/useExams";
import { apiQuizDetailToExam, uiQuestionToCreateRequest } from "../utils/examMapper";
import type { PrivacyType } from "@/services/types/exam.types";

const emptyQuestion = (): ExamQuestion => ({
  id: crypto.randomUUID(),
  type: "MULTIPLE_CHOICE",
  questionText: "",
  answers: [
    { id: crypto.randomUUID(), text: "", isCorrect: false },
    { id: crypto.randomUUID(), text: "", isCorrect: false },
    { id: crypto.randomUUID(), text: "", isCorrect: false },
    { id: crypto.randomUUID(), text: "", isCorrect: false },
  ],
  score: 10,
  _action: "CREATE",
});

export default function ExamEditor() {
  const { setId, examId } = useParams<{ setId: string; examId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isUpdateMode = !!examId;

  const {
    title: locationTitle,
    description: locationDescription,
    privacy: locationPrivacy,
  } = (location.state as Record<string, unknown>) || {};

  const [title, setTitle] = useState(locationTitle as string || "");
  const [description, setDescription] = useState(
    (locationDescription as string) || "",
  );
  const [timeLimit, setTimeLimit] = useState(60);
  const [questions, setQuestions] = useState<ExamQuestion[]>([emptyQuestion()]);
  const [draggedQuestionId, setDraggedQuestionId] = useState<
    string | number | null
  >(null);

  const { data: examDetailData, isLoading: isLoadingDetail } = useExamDetail(
    Number(setId),
    examId ?? 0,
  );

  const createExamMutation = useCreateExam();
  const updateExamMutation = useUpdateExam();
  const createQuestionsMutation = useCreateQuestions();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  useEffect(() => {
    if (!isUpdateMode) {
      setTitle((locationTitle as string) || "");
      setDescription((locationDescription as string) || "");
    }
  }, [isUpdateMode, locationTitle, locationDescription]);

  const loadedExamIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!isUpdateMode || !examDetailData?.data) return;
    const dataId = (examDetailData.data as { id?: string | number }).id;
    if (loadedExamIdRef.current === dataId) return;
    loadedExamIdRef.current = dataId ?? null;

    const exam = apiQuizDetailToExam(examDetailData.data);
    setTitle(exam.title);
    setDescription(exam.description);
    setTimeLimit(exam.timeLimit);
    setQuestions(
      exam.questions.length > 0
        ? exam.questions.map((q) => ({
            ...q,
            _action: typeof q.id === "number" ? ("UPDATE" as const) : null,
          }))
        : [emptyQuestion()],
    );
  }, [isUpdateMode, examDetailData]);

  useEffect(() => {
    if (!isUpdateMode) loadedExamIdRef.current = null;
  }, [isUpdateMode, examId]);

  const handleAddQuestion = () => {
    setQuestions([...questions, emptyQuestion()]);
  };

  const handleUpdateQuestion = (
    id: string | number,
    updates: Partial<ExamQuestion>,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          const updated = { ...q, ...updates };
          if (typeof q.id === "number" && !q._action) {
            updated._action = "UPDATE";
          }
          return updated;
        }
        return q;
      }),
    );
  };

  const handleDeleteQuestion = (id: string | number) => {
    if (questions.length === 1) {
      toast.error("Exam must have at least one question");
      return;
    }
    setQuestions((prev) => {
      if (typeof id === "number") {
        return prev.map((q) =>
          q.id === id ? { ...q, _action: "DELETE" as const } : q,
        );
      }
      return prev.filter((q) => q.id !== id);
    });
  };

  const handleDragStart = (id: string | number) => setDraggedQuestionId(id);
  const handleDragEnd = () => setDraggedQuestionId(null);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetId: string | number) => {
    e.preventDefault();
    if (!draggedQuestionId || draggedQuestionId === targetId) return;
    const draggedIndex = questions.findIndex((q) => q.id === draggedQuestionId);
    const targetIndex = questions.findIndex((q) => q.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newQuestions = [...questions];
    const [removed] = newQuestions.splice(draggedIndex, 1);
    newQuestions.splice(targetIndex, 0, removed);
    setQuestions(newQuestions);
  };

  const calculateTotalScore = () =>
    questions
      .filter((q) => q._action !== "DELETE")
      .reduce((sum, q) => sum + q.score, 0);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter an exam title");
      return;
    }

    const activeQuestions = questions.filter((q) => q._action !== "DELETE");
    if (activeQuestions.length === 0) {
      toast.error("Exam must have at least one question");
      return;
    }

    for (const question of activeQuestions) {
      if (!question.questionText.trim()) {
        toast.error("All questions must have text");
        return;
      }
      if (question.type !== "ESSAY") {
        const hasCorrectAnswer = question.answers.some((a) => a.isCorrect);
        if (!hasCorrectAnswer) {
          toast.error("All questions must have at least one correct answer");
          return;
        }
        if (question.type === "MULTIPLE_CHOICE") {
          const hasEmptyAnswer = question.answers.some((a) => !a.text.trim());
          if (hasEmptyAnswer) {
            toast.error("All answer options must have text");
            return;
          }
        }
      }
    }

    const privacy: PrivacyType =
      (locationPrivacy as string)?.toUpperCase() === "PRIVATE"
        ? "PRIVATE"
        : "PUBLIC";

    const setIdNum = Number(setId);

    try {
      if (isUpdateMode && examId) {
        await updateExamMutation.mutateAsync({
          setId: setIdNum,
          examId,
          data: {
            title,
            description,
            privacy,
            duration: timeLimit,
          },
        });

        const toDelete = questions.filter(
          (q) => q._action === "DELETE" && typeof q.id === "number",
        );

        for (const q of toDelete) {
          await deleteQuestionMutation.mutateAsync({
            setId: setIdNum,
            examId,
            questionId: q.id,
          });
        }

        const toCreate = activeQuestions.filter(
          (q) => q._action === "CREATE" || typeof q.id !== "number",
        );
        const toUpdate = activeQuestions.filter(
          (q) => typeof q.id === "number" && q._action === "UPDATE",
        );

        if (toCreate.length > 0) {
          await createQuestionsMutation.mutateAsync({
            setId: setIdNum,
            examId,
            data: toCreate.map((q) =>
              uiQuestionToCreateRequest(q, activeQuestions.indexOf(q)),
            ),
          });
        }
        for (let i = 0; i < toUpdate.length; i++) {
          const q = toUpdate[i];
          await updateQuestionMutation.mutateAsync({
            setId: setIdNum,
            examId,
            questionId: q.id,
            data: uiQuestionToCreateRequest(q, activeQuestions.indexOf(q)),
          });
        }

        toast.success("Exam updated successfully");
        navigate(`/sets/${setId}/exams/${examId}`);
      } else {
        const { data } = await createExamMutation.mutateAsync({
          setId: setIdNum,
          data: {
            title,
            description,
            privacy,
            duration: timeLimit,
          },
        });

        const newExamId = data?.data?.id;
        if (!newExamId) {
          toast.error("Failed to create exam");
          return;
        }

        await createQuestionsMutation.mutateAsync({
          setId: setIdNum,
          examId: newExamId,
          data: activeQuestions.map((q, i) => uiQuestionToCreateRequest(q, i)),
        });

        toast.success("Exam created successfully");
        navigate(`/sets/${setId}/exams/${newExamId}`);
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error("Failed to save exam. Please try again.");
    }
  };

  const visibleQuestions = questions.filter((q) => q._action !== "DELETE");

  if (isUpdateMode && isLoadingDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading exam...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/sets/${setId}/exams`)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold">
                {isUpdateMode ? "Edit Exam" : "Create Exam"}
              </h1>
            </div>
            <Button
              onClick={handleSave}
              className="gap-2"
              disabled={
                createExamMutation.isPending ||
                updateExamMutation.isPending ||
                createQuestionsMutation.isPending ||
                updateQuestionMutation.isPending ||
                deleteQuestionMutation.isPending
              }
            >
              <Save className="w-4 h-4" />
              {isUpdateMode ? "Update Exam" : "Create Exam"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Exam Information</h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter exam title"
                className="w-full"
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Description (Optional)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter exam description"
                className="w-full min-h-[80px] resize-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">
                  Time Limit (minutes)
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">
                  Total Score
                </Label>
                <Input
                  type="text"
                  value={calculateTotalScore()}
                  readOnly
                  className="w-full bg-muted"
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Questions ({visibleQuestions.length})
            </h2>
            <Button
              onClick={handleAddQuestion}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Question
            </Button>
          </div>

          {visibleQuestions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              onUpdate={handleUpdateQuestion}
              onDelete={handleDeleteQuestion}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}

          {visibleQuestions.length === 0 && (
            <div className="text-center py-12 bg-card border border-dashed border-border rounded-lg">
              <p className="text-muted-foreground mb-4">No questions yet</p>
              <Button onClick={handleAddQuestion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Question
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
