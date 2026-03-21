import { ArrowLeft, Plus, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { apiQuizDetailToExam, uiQuestionToCreateRequest, parseAIGeneratedContent } from "../utils/examMapper";
import type { PrivacyType } from "@/services/types/exam.types";

export type QuestionErrors = {
  questionText?: boolean;
  noCorrectAnswer?: boolean;
  emptyAnswers?: Set<string>;
};

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
  const { t } = useTranslation();
  const { setId, examId } = useParams<{ setId: string; examId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isUpdateMode = !!examId;

  const {
    title: locationTitle,
    description: locationDescription,
    privacy: locationPrivacy,
    aiContent: locationAIContent,
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

  const [titleError, setTitleError] = useState(false);
  const [questionErrors, setQuestionErrors] = useState<
    Map<string | number, QuestionErrors>
  >(new Map());

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

      if (locationAIContent && typeof locationAIContent === "string") {
        const parsed = parseAIGeneratedContent(locationAIContent);
        if (parsed.length > 0) {
          setQuestions(parsed);
        }
      }
    }
  }, [isUpdateMode, locationTitle, locationDescription, locationAIContent]);

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

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (value.trim()) setTitleError(false);
  };

  const clearQuestionError = (
    qId: string | number,
    field: keyof QuestionErrors,
    answerId?: string,
  ) => {
    setQuestionErrors((prev) => {
      const errs = prev.get(qId);
      if (!errs) return prev;
      const next = new Map(prev);
      if (field === "emptyAnswers" && answerId) {
        const newSet = new Set(errs.emptyAnswers);
        newSet.delete(answerId);
        if (newSet.size === 0) {
          const { emptyAnswers: _, ...rest } = errs;
          void _;
          next.set(qId, rest);
        } else {
          next.set(qId, { ...errs, emptyAnswers: newSet });
        }
      } else {
        const { [field]: _, ...rest } = errs;
        void _;
        next.set(qId, rest);
      }
      const updated = next.get(qId);
      if (updated && Object.keys(updated).length === 0) next.delete(qId);
      return next;
    });
  };

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

    if (updates.questionText !== undefined && updates.questionText.trim()) {
      clearQuestionError(id, "questionText");
    }
    if (updates.answers !== undefined) {
      const hasCorrect = updates.answers.some((a) => a.isCorrect);
      if (hasCorrect) clearQuestionError(id, "noCorrectAnswer");
    }
  };

  const handleDeleteQuestion = (id: string | number) => {
    if (questions.length === 1) {
      toast.error(t("exam.editor.minOneQuestion"));
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
    setQuestionErrors((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
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

  const validate = (): boolean => {
    let valid = true;
    const errors = new Map<string | number, QuestionErrors>();

    if (!title.trim()) {
      setTitleError(true);
      valid = false;
    } else {
      setTitleError(false);
    }

    const activeQuestions = questions.filter((q) => q._action !== "DELETE");
    if (activeQuestions.length === 0) {
      toast.error(t("exam.editor.minOneQuestion"));
      return false;
    }

    for (const q of activeQuestions) {
      const qErrs: QuestionErrors = {};

      if (!q.questionText.trim()) {
        qErrs.questionText = true;
        valid = false;
      }

      if (q.type !== "ESSAY") {
        if (!q.answers.some((a) => a.isCorrect)) {
          qErrs.noCorrectAnswer = true;
          valid = false;
        }
        if (q.type === "MULTIPLE_CHOICE") {
          const empty = new Set<string>();
          for (const a of q.answers) {
            if (!a.text.trim()) empty.add(a.id);
          }
          if (empty.size > 0) {
            qErrs.emptyAnswers = empty;
            valid = false;
          }
        }
      }

      if (Object.keys(qErrs).length > 0) {
        errors.set(q.id, qErrs);
      }
    }

    setQuestionErrors(errors);

    if (!valid) {
      toast.error(t("exam.editor.fixBeforeSave"));
    }

    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const activeQuestions = questions.filter((q) => q._action !== "DELETE");
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
              uiQuestionToCreateRequest(q),
            ),
          });
        }
        for (let i = 0; i < toUpdate.length; i++) {
          const q = toUpdate[i];
          await updateQuestionMutation.mutateAsync({
            setId: setIdNum,
            examId,
            questionId: q.id,
            data: uiQuestionToCreateRequest(q),
          });
        }

        toast.success(t("exam.editor.successUpdated"));
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
          toast.error(t("exam.editor.failedCreate"));
          return;
        }

        await createQuestionsMutation.mutateAsync({
          setId: setIdNum,
          examId: newExamId,
          data: activeQuestions.map((q) => uiQuestionToCreateRequest(q)),
        });

        toast.success("Exam created successfully");
        navigate(`/sets/${setId}/exams/${newExamId}`);
      }
    } catch (error) {
      console.error("Error saving exam:", error);
      toast.error(t("exam.editor.failedSave"));
    }
  };

  const visibleQuestions = questions.filter((q) => q._action !== "DELETE");

  if (isUpdateMode && isLoadingDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          {t("exam.editor.loading")}
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
                {t("exam.back")}
              </Button>
              <h1 className="text-2xl font-bold">
                {isUpdateMode
                  ? t("exam.editor.editExam")
                  : t("exam.editor.createExam")}
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
              {isUpdateMode
                ? t("exam.editor.updateExam")
                : t("exam.editor.createExam")}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-card border border-border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {t("exam.editor.examInfo")}
          </h2>
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t("exam.editor.titleLabel")}{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder={t("exam.editor.titlePlaceholder")}
                className={`w-full ${titleError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              />
              {titleError && (
                <p className="text-red-500 text-xs mt-1">
                  {t("exam.editor.titleRequired")}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t("exam.editor.descriptionLabel")}
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("exam.editor.descriptionPlaceholder")}
                className="w-full min-h-[80px] resize-none"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label className="text-sm font-medium mb-2 block">
                  {t("exam.editor.timeLimitMinutes")}
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
                  {t("exam.editor.totalScore")}
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
              {t("exam.editor.questionsHeading", {
                count: visibleQuestions.length,
              })}
            </h2>
            <Button
              onClick={handleAddQuestion}
              variant="outline"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {t("exam.editor.addQuestion")}
            </Button>
          </div>

          {visibleQuestions.map((question, index) => (
            <QuestionItem
              key={question.id}
              question={question}
              index={index}
              errors={questionErrors.get(question.id)}
              onClearError={(field, answerId) =>
                clearQuestionError(question.id, field, answerId)
              }
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
              <p className="text-muted-foreground mb-4">
                {t("exam.editor.noQuestionsYet")}
              </p>
              <Button onClick={handleAddQuestion} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                {t("exam.editor.addFirstQuestion")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
