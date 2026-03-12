import { GripVertical, Trash2, Plus } from "lucide-react";
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

interface QuestionItemProps {
  question: ExamQuestion;
  index: number;
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
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: QuestionItemProps) {
  const handleTypeChange = (type: QuestionType) => {
    let newAnswers: Answer[] = [];
    if (type === "multiple-choice") {
      newAnswers = [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ];
    } else if (type === "true-false") {
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
    if (question.type === "multiple-choice") {
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
  };

  const handleCorrectAnswerChange = (answerId: string) => {
    const updatedAnswers = question.answers.map((ans) =>
      ans.id === answerId
        ? { ...ans, isCorrect: !ans.isCorrect }
        : question.type === "true-false"
          ? { ...ans, isCorrect: false }
          : ans,
    );
    onUpdate(question.id, { answers: updatedAnswers });
  };

  const handleDeleteAnswer = (answerId: string) => {
    if (question.answers.length > 2) {
      const updatedAnswers = question.answers.filter(
        (ans) => ans.id !== answerId,
      );
      onUpdate(question.id, { answers: updatedAnswers });
    }
  };

  return (
    <div
      draggable
      onDragStart={() => onDragStart(question.id)}
      onDragEnd={onDragEnd}
      onDragOver={(e) => onDragOver(e, question.id)}
      onDrop={(e) => onDrop(e, question.id)}
      className="bg-card border border-border rounded-lg p-6 mb-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-4">
        <div className="cursor-move pt-2">
          <GripVertical className="w-5 h-5 text-muted-foreground" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-lg">Question {index + 1}</span>
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
              Question Type
            </Label>
            <Select
              value={question.type}
              onValueChange={(value) => handleTypeChange(value as QuestionType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Question</Label>
            <Textarea
              value={question.questionText}
              onChange={(e) =>
                onUpdate(question.id, { questionText: e.target.value })
              }
              placeholder="Enter your question here..."
              className="w-full min-h-[80px] resize-none"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label className="text-sm font-medium mb-2 block">Points</Label>
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
          {question.type !== "essay" && (
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Answers{" "}
                {question.type === "multiple-choice" &&
                  "(Select correct answer(s))"}
              </Label>
              <div className="space-y-2">
                {question.answers.map((answer, idx) => (
                  <div
                    key={answer.id}
                    className="flex items-center gap-2 bg-background p-3 rounded border border-border"
                  >
                    <Checkbox
                      checked={answer.isCorrect}
                      onCheckedChange={() =>
                        handleCorrectAnswerChange(answer.id)
                      }
                      className="flex-shrink-0"
                    />
                    {question.type === "true-false" ? (
                      <span className="flex-1 font-medium">{answer.text}</span>
                    ) : (
                      <>
                        <Input
                          value={answer.text}
                          onChange={(e) =>
                            handleAnswerChange(answer.id, e.target.value)
                          }
                          placeholder={`Answer ${idx + 1}`}
                          className="flex-1"
                        />
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
                ))}
                {question.type === "multiple-choice" &&
                  question.answers.length < 6 && (
                    <Button
                      onClick={handleAddAnswer}
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Answer
                    </Button>
                  )}
              </div>
            </div>
          )}
          {question.type === "essay" && (
            <div className="bg-muted/50 p-3 rounded text-sm text-muted-foreground">
              Essay questions will be graded by AI in the future.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
