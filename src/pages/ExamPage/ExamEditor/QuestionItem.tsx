import { GripVertical, Trash2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Answer, ExamQuestion, QuestionType } from "../types";
import { Checkbox } from "@/components/ui/checkbox";
import type { QuestionErrors } from "./index";

interface QuestionItemProps {
  question: ExamQuestion;
  index: number;
  errors?: QuestionErrors;
  onClearError: (field: keyof QuestionErrors, answerId?: string) => void;
  onUpdate: (id: string | number, updates: Partial<ExamQuestion>) => void;
  onDelete: (id: string | number) => void;
  onDragStart: (id: string | number) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent, id: string | number) => void;
  onDrop: (e: React.DragEvent, id: string | number) => void;
}

export default function QuestionItem({
  question,
  index,
  errors,
  onClearError,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: QuestionItemProps) {
  const { t } = useTranslation();

  const handleTypeChange = (type: QuestionType) => {
    let newAnswers: Answer[] = [];
    if (type === "MULTIPLE_CHOICE") {
      newAnswers = [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ];
    } else if (type === "TRUE_FALSE") {
      newAnswers = [
        { id: "true", text: "True", isCorrect: false },
        { id: "false", text: "False", isCorrect: false },
      ];
    } else {
      newAnswers = [];
    }
    onUpdate(question.id, { type, answers: newAnswers });
  };

  const handleAddAnswer = () => {
    if (question.type === "MULTIPLE_CHOICE") {
      const newAnswer: Answer = {
        id: crypto.randomUUID(),
        text: "",
        isCorrect: false,
      };
      onUpdate(question.id, { answers: [...question.answers, newAnswer] });
    }
  };

  const handleAnswerChange = (answerId: string, text: string) => {
    const updatedAnswers = question.answers.map((ans) =>
      ans.id === answerId ? { ...ans, text } : ans,
    );
    onUpdate(question.id, { answers: updatedAnswers });
    if (text.trim()) {
      onClearError("emptyAnswers", answerId);
    }
  };

  const handleCorrectAnswerChange = (answerId: string) => {
    const updatedAnswers = question.answers.map((ans) =>
      ans.id === answerId
        ? { ...ans, isCorrect: !ans.isCorrect }
        : question.type === "TRUE_FALSE"
          ? { ...ans, isCorrect: false }
          : ans,
    );
    onUpdate(question.id, { answers: updatedAnswers });
    onClearError("noCorrectAnswer");
  };

  const handleDeleteAnswer = (answerId: string) => {
    if (question.answers.length > 2) {
      const updatedAnswers = question.answers.filter(
        (ans) => ans.id !== answerId,
      );
      onUpdate(question.id, { answers: updatedAnswers });
    }
  };

  const hasError = !!errors && Object.keys(errors).length > 0;

  return (
    <div
      draggable
      onDragStart={() => onDragStart(question.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, question.id)}
      onDrop={(e) => onDrop(e, question.id)}
      className={`bg-card border rounded-lg p-6 mb-4 hover:shadow-md transition-shadow ${
        hasError ? "border-red-400" : "border-border"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="cursor-move pt-2">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">
              {t("exam.editor.questionLabel")} {index + 1}
            </span>
            <Button
              onClick={() => onDelete(question.id)}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t("exam.editor.questionType")}
            </Label>
            <Select
              value={question.type}
              onValueChange={(value) => handleTypeChange(value as QuestionType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MULTIPLE_CHOICE">
                  {t("exam.common.multipleChoice")}
                </SelectItem>
                <SelectItem value="TRUE_FALSE">
                  {t("exam.common.trueFalse")}
                </SelectItem>
                <SelectItem value="ESSAY">{t("exam.common.essay")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">
              {t("exam.editor.questionLabel")}{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={question.questionText}
              onChange={(e) =>
                onUpdate(question.id, { questionText: e.target.value })
              }
              placeholder={t("exam.editor.questionPlaceholder")}
              className={`w-full min-h-[80px] resize-none ${
                errors?.questionText ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
            />
            {errors?.questionText && (
              <p className="text-red-500 text-xs mt-1">Question text is required</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">
                {t("exam.editor.pointsLabel")}
              </Label>
              <Input
                type="number"
                min="0"
                value={question.score}
                onChange={(e) =>
                  onUpdate(question.id, { score: Number(e.target.value) })
                }
                className="w-full"
              />
            </div>
          </div>
          {question.type !== "ESSAY" && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                {t("exam.editor.answersLabel")}{" "}
                {question.type === "MULTIPLE_CHOICE" &&
                  t("exam.editor.answersHintMcq")}
                {" "}
                <span className="text-red-500">*</span>
              </Label>
              {errors?.noCorrectAnswer && (
                <p className="text-red-500 text-xs mb-2">
                  {t("exam.editor.selectCorrect")}
                </p>
              )}
              <div className="space-y-2">
                {question.answers.map((answer, idx) => {
                  const answerHasError = errors?.emptyAnswers?.has(answer.id);
                  return (
                    <div
                      key={answer.id}
                      className={`flex items-center gap-2 bg-background p-3 rounded border ${
                        answerHasError ? "border-red-500" : "border-border"
                      }`}
                    >
                      <Checkbox
                        checked={answer.isCorrect}
                        onCheckedChange={() =>
                          handleCorrectAnswerChange(answer.id)
                        }
                        className="flex-shrink-0"
                      />
                      {question.type === "TRUE_FALSE" ? (
                        <span className="flex-1 font-medium">{answer.text}</span>
                      ) : (
                        <>
                          <div className="flex-1">
                            <Input
                              value={answer.text}
                              onChange={(e) =>
                                handleAnswerChange(answer.id, e.target.value)
                              }
                              placeholder={t("exam.editor.answerN", {
                                n: idx + 1,
                              })}
                              className={
                                answerHasError ? "border-red-500 focus-visible:ring-red-500" : ""
                              }
                            />
                            {answerHasError && (
                              <p className="text-red-500 text-xs mt-1">
                                {t("exam.editor.answerRequired")}
                              </p>
                            )}
                          </div>
                          {question.answers.length > 2 && (
                            <Button
                              onClick={() => handleDeleteAnswer(answer.id)}
                              variant="ghost"
                              size="sm"
                              className="flex-shrink-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
                {question.type === "MULTIPLE_CHOICE" &&
                  question.answers.length < 6 && (
                    <Button
                      onClick={handleAddAnswer}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t("exam.editor.addAnswer")}
                    </Button>
                  )}
              </div>
            </div>
          )}
          {question.type === "ESSAY" && (
            <div className="bg-muted/50 p-3 rounded text-sm text-muted-foreground">
              {t("exam.editor.essayGradingNote")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
