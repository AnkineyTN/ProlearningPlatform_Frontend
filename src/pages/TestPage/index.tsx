import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TestHomeView from "./components/TestHomeView";
import TestTaking from "./components/TestTaking";
import TestResults from "./components/TestResults";
import type { Test, TestResult, TestSubmission } from "./types";

type ViewMode = "home" | "taking" | "results";

type Props = {
  setId: number;
  testId: number | string;
};

// Mock test data - replace with API call
const mockTest: Test = {
  id: 1,
  title: "OOP Interview Questions",
  description: "Test your knowledge of Object-Oriented Programming concepts",
  privacy: "Public",
  totalScore: 50,
  timeLimit: 30,
  questions: [
    {
      id: 1,
      type: "multiple-choice",
      questionText: "What is polymorphism in Object-Oriented Programming?",
      answers: [
        {
          id: "a1",
          text: "The ability of different objects to respond to the same message in different ways",
          isCorrect: true,
        },
        {
          id: "a2",
          text: "The process of hiding implementation details",
          isCorrect: false,
        },
        {
          id: "a3",
          text: "The ability to create multiple instances of a class",
          isCorrect: false,
        },
        {
          id: "a4",
          text: "The process of inheriting properties from a parent class",
          isCorrect: false,
        },
      ],
      score: 10,
    },
    {
      id: 2,
      type: "true-false",
      questionText:
        "In Java, multiple inheritance is supported through classes.",
      answers: [
        { id: "true", text: "True", isCorrect: false },
        { id: "false", text: "False", isCorrect: true },
      ],
      score: 10,
    },
    {
      id: 3,
      type: "multiple-choice",
      questionText:
        "Which of the following are principles of OOP? (Select all that apply)",
      answers: [
        { id: "a1", text: "Encapsulation", isCorrect: true },
        { id: "a2", text: "Inheritance", isCorrect: true },
        { id: "a3", text: "Compilation", isCorrect: false },
        { id: "a4", text: "Abstraction", isCorrect: true },
      ],
      score: 15,
    },
    {
      id: 4,
      type: "essay",
      questionText:
        "Explain the difference between abstract classes and interfaces in Java. Provide examples of when you would use each.",
      answers: [],
      score: 15,
    },
  ],
};

const TestPage = ({ setId, testId }: Props) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // TODO: Fetch test data from API
  const test = mockTest;

  const handleStartTest = () => {
    setViewMode("taking");
  };

  const handleEditTest = () => {
    navigate(`/sets/${setId}/tests/${testId}/edit`, {
      state: {
        title: test.title,
        description: test.description,
        privacy: test.privacy,
      },
    });
  };

  const handleSubmitTest = (
    submissions: TestSubmission[],
    timeTaken: number,
  ) => {
    // Calculate results
    let earnedScore = 0;

    test.questions.forEach((question) => {
      const submission = submissions.find((s) => s.questionId === question.id);

      if (!submission) return;

      if (question.type === "essay") {
        // Essay questions need manual grading - skip for now
        return;
      }

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

    const percentage = (earnedScore / test.totalScore) * 100;
    const passed = percentage >= 60; // 60% passing grade

    const result: TestResult = {
      totalScore: test.totalScore,
      earnedScore,
      percentage,
      passed,
      timeTaken,
      submissions,
    };

    setTestResult(result);
    setViewMode("results");
  };

  if (viewMode === "home") {
    return (
      <TestHomeView
        test={test}
        onStartTest={handleStartTest}
            onEditTest={handleEditTest}
        onBack={() => navigate(`/sets/${setId}/tests`)}
      />
    );
  }

  if (viewMode === "taking") {
    return (
      <TestTaking
        setId={setId}
        testId={Number(testId)}
        test={test}
        onSubmit={handleSubmitTest}
      />
    );
  }

  if (viewMode === "results" && testResult) {
    return (
      <TestResults
        setId={setId}
        testId={Number(testId)}
        test={test}
        result={testResult}
      />
    );
  }

  return null;
};

export default TestPage;
