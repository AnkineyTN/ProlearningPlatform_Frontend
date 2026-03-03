import { ArrowLeft, Plus, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import QuestionItem from "./QuestionItem";
import type { Question } from "../types";

interface TestEditorProps {
  setId: number;
  testId?: number;
}

export default function TestEditor({ setId, testId }: TestEditorProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isUpdateMode = !!testId;

  const {
    title: locationTitle,
    description: locationDescription,
    privacy,
    generatedQuestions,
  } = location.state || {};

  const [title, setTitle] = useState(locationTitle || "");
  const [description, setDescription] = useState(locationDescription || "");
  const [timeLimit, setTimeLimit] = useState(60); // minutes
  const [questions, setQuestions] = useState<Question[]>([
    {
      id: crypto.randomUUID(),
      type: "multiple-choice",
      questionText: "",
      answers: [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
      score: 10,
      _action: "CREATE",
    },
  ]);

  const [draggedQuestionId, setDraggedQuestionId] = useState<
    string | number | null
  >(null);

  useEffect(() => {
    if (
      !isUpdateMode &&
      Array.isArray(generatedQuestions) &&
      generatedQuestions.length > 0
    ) {
      setTitle(locationTitle || "AI Generated Test");
      setDescription(locationDescription || "");
      setQuestions(
        generatedQuestions.map((q) => ({
          id: crypto.randomUUID(),
          type: q.type || "multiple-choice",
          questionText: q.question || q.questionText || "",
          answers: q.answers || [],
          score: q.score || 10,
          _action: "CREATE",
        })),
      );
    }
  }, [generatedQuestions, locationTitle, locationDescription, isUpdateMode]);

  useEffect(() => {
    if (!isUpdateMode && !locationTitle && !setId) {
      navigate(`/sets/${setId}/tests`, { replace: true });
    }
  }, [locationTitle, setId, navigate, isUpdateMode]);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: "multiple-choice",
      questionText: "",
      answers: [
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
        { id: crypto.randomUUID(), text: "", isCorrect: false },
      ],
      score: 10,
      _action: "CREATE",
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleUpdateQuestion = (
    id: string | number,
    updates: Partial<Question>,
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
      toast.error("Test must have at least one question");
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

  const handleDragStart = (id: string | number) => {
    setDraggedQuestionId(id);
  };

  const handleDragEnd = () => {
    setDraggedQuestionId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

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

  const calculateTotalScore = () => {
    return questions
      .filter((q) => q._action !== "DELETE")
      .reduce((sum, q) => sum + q.score, 0);
  };

  const handleSave = async () => {
    // Validation
    if (!title.trim()) {
      toast.error("Please enter a test title");
      return;
    }

    const activeQuestions = questions.filter((q) => q._action !== "DELETE");

    if (activeQuestions.length === 0) {
      toast.error("Test must have at least one question");
      return;
    }

    for (const question of activeQuestions) {
      if (!question.questionText.trim()) {
        toast.error("All questions must have text");
        return;
      }

      if (question.type !== "essay") {
        const hasCorrectAnswer = question.answers.some((a) => a.isCorrect);
        if (!hasCorrectAnswer) {
          toast.error("All questions must have at least one correct answer");
          return;
        }

        if (question.type === "multiple-choice") {
          const hasEmptyAnswer = question.answers.some((a) => !a.text.trim());
          if (hasEmptyAnswer) {
            toast.error("All answer options must have text");
            return;
          }
        }
      }
    }

    const testData = {
      title,
      description,
      privacy: privacy || "Public",
      timeLimit,
      totalScore: calculateTotalScore(),
      questions: activeQuestions,
    };

    try {
      // TODO: Implement API call to save test
      console.log("Saving test:", testData);
      toast.success(
        isUpdateMode
          ? "Test updated successfully"
          : "Test created successfully",
      );
      navigate(`/sets/${setId}/tests`);
    } catch (error) {
      console.error("Error saving test:", error);
      toast.error("Failed to save test");
    }
  };

  const visibleQuestions = questions.filter((q) => q._action !== "DELETE");

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
                onClick={() => navigate(`/sets/${setId}/tests`)}
              >
                <ArrowLeft className='w-4 h-4 mr-2' />
                Back
              </Button>
              <h1 className='text-2xl font-bold'>
                {isUpdateMode ? "Edit Test" : "Create Test"}
              </h1>
            </div>
            <Button onClick={handleSave} className='gap-2'>
              <Save className='w-4 h-4' />
              {isUpdateMode ? "Update Test" : "Create Test"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='max-w-6xl mx-auto px-6 py-8'>
        {/* Test Info Section */}
        <div className='bg-card border border-border rounded-lg p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Test Information</h2>
          <div className='space-y-4'>
            <div>
              <Label className='text-sm font-medium mb-2 block'>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='Enter test title'
                className='w-full'
              />
            </div>

            <div>
              <Label className='text-sm font-medium mb-2 block'>
                Description (Optional)
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder='Enter test description'
                className='w-full min-h-[80px] resize-none'
              />
            </div>

            <div className='flex gap-4'>
              <div className='flex-1'>
                <Label className='text-sm font-medium mb-2 block'>
                  Time Limit (minutes)
                </Label>
                <Input
                  type='number'
                  min='1'
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className='w-full'
                />
              </div>
              <div className='flex-1'>
                <Label className='text-sm font-medium mb-2 block'>
                  Total Score
                </Label>
                <Input
                  type='text'
                  value={calculateTotalScore()}
                  readOnly
                  className='w-full bg-muted'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Questions Section */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold'>
              Questions ({visibleQuestions.length})
            </h2>
            <Button
              onClick={handleAddQuestion}
              variant='outline'
              className='gap-2'
            >
              <Plus className='w-4 h-4' />
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
            <div className='text-center py-12 bg-card border border-dashed border-border rounded-lg'>
              <p className='text-muted-foreground mb-4'>No questions yet</p>
              <Button onClick={handleAddQuestion} variant='outline'>
                <Plus className='w-4 h-4 mr-2' />
                Add Your First Question
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
