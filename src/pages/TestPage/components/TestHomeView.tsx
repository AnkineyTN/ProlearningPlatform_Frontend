import { Clock, FileText, Play, Edit, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Test } from "../types";
import ModeToggle from "@/components/theme/mode-toggle";

interface TestHomeViewProps {
  test: Test;
  onStartTest: () => void;
  onEditTest: () => void;
  onBack: () => void;
}

export default function TestHomeView({
  test,
  onStartTest,
  onEditTest,
  onBack,
}: TestHomeViewProps) {
  return (
    <div className='min-h-[calc(100vh-200px)] flex items-center justify-center p-8'>
      <div className='absolute top-10 right-40'>
        <ModeToggle />
      </div>
      <div className='max-w-2xl w-full'>
        <Button
          variant='outline'
          className='absolute top-10 left-40'
          onClick={onBack}
        >
          <ChevronLeft className='w-4 h-4' />
          Back
        </Button>
        {/* Test Info Card */}
        <div className='bg-card border-2 border-border rounded-xl p-8 shadow-lg'>
          <div className='text-center mb-8'>
            <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4'>
              <FileText className='w-8 h-8 text-primary' />
            </div>
            <h2 className='text-3xl font-bold mb-2'>{test.title}</h2>
            {test.description && (
              <p className='text-muted-foreground'>{test.description}</p>
            )}
          </div>

          {/* Test Details */}
          <div className='grid grid-cols-3 gap-4 mb-8'>
            <div className='bg-background rounded-lg p-4 text-center border border-border'>
              <FileText className='w-6 h-6 mx-auto mb-2 text-primary' />
              <div className='text-2xl font-bold mb-1'>
                {test.questions.length}
              </div>
              <div className='text-sm text-muted-foreground'>Questions</div>
            </div>

            <div className='bg-background rounded-lg p-4 text-center border border-border'>
              <Clock className='w-6 h-6 mx-auto mb-2 text-primary' />
              <div className='text-2xl font-bold mb-1'>
                {test.timeLimit}
                <span className='text-base'> min</span>
              </div>
              <div className='text-sm text-muted-foreground'>Time Limit</div>
            </div>

            <div className='bg-background rounded-lg p-4 text-center border border-border'>
              <div className='text-2xl font-bold mb-1 text-primary'>
                {test.totalScore}
              </div>
              <div className='text-sm text-muted-foreground'>Total Points</div>
            </div>
          </div>

          {/* Question Types Breakdown */}
          <div className='bg-background rounded-lg p-4 mb-8 border border-border'>
            <h3 className='font-semibold mb-3 text-sm'>Question Types:</h3>
            <div className='space-y-2 text-sm'>
              {test.questions.filter((q) => q.type === "multiple-choice")
                .length > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>
                    Multiple Choice:
                  </span>
                  <span className='font-medium'>
                    {
                      test.questions.filter((q) => q.type === "multiple-choice")
                        .length
                    }
                  </span>
                </div>
              )}
              {test.questions.filter((q) => q.type === "true-false").length >
                0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>True/False:</span>
                  <span className='font-medium'>
                    {
                      test.questions.filter((q) => q.type === "true-false")
                        .length
                    }
                  </span>
                </div>
              )}
              {test.questions.filter((q) => q.type === "essay").length > 0 && (
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Essay:</span>
                  <span className='font-medium'>
                    {test.questions.filter((q) => q.type === "essay").length}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm'>
            <h3 className='font-semibold mb-2 text-blue-900'>
              Before you start:
            </h3>
            <ul className='space-y-1 text-blue-800'>
              <li>• Make sure you have a stable internet connection</li>
              <li>• You cannot pause the test once started</li>
              <li>• Your progress will be auto-saved</li>
              <li>
                • Review all questions before submitting your final answers
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3'>
            <Button onClick={onEditTest} variant='outline' className='flex-1'>
              <Edit className='w-4 h-4 mr-2' />
              Edit Test
            </Button>
            <Button onClick={onStartTest} className='flex-1'>
              <Play className='w-4 h-4 mr-2' />
              Start Test
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
