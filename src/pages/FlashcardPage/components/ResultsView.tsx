import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { ReviewLog } from "@/services/types/flashcard-session.types";
import type { Card as Flashcard } from "@/services/types/flashcard.types";

interface ResultsViewProps {
  studiedCards: number;
  totalCards: number;
  flashcards?: Flashcard[];
  onHome: () => void;
  onContinue: () => void;
  onReset: () => void;
  sessionResult?: {
    sessionId?: number;
    correctCount?: number;
    incorrectCount?: number;
    finishedAt?: string;
    logs?: ReviewLog[];
  };
}

export default function ResultsView({
  studiedCards,
  totalCards,
  flashcards = [],
  onHome,
  onContinue,
  onReset,
  sessionResult,
}: ResultsViewProps) {
  const correct = sessionResult?.correctCount ?? 0;
  const incorrect = sessionResult?.incorrectCount ?? 0;
  const finishedAt = sessionResult?.finishedAt
    ? new Date(sessionResult.finishedAt).toLocaleString()
    : undefined;
  const logs = sessionResult?.logs ?? [];

  const findCardTitle = (cardId: number) => {
    const found = flashcards.find((c) => c.id === cardId);
    return found ? found.frontCard : String(cardId);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="min-h-[70vh] flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-10 h-10 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-1">Great job!</h2>
              <p className="text-muted-foreground">
                You've completed this study session
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Studied {studiedCards} of {totalCards} cards
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-foreground mb-1">
                  {correct}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-3xl font-bold text-destructive mb-1">
                  {incorrect}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">
                  Finished At
                </div>
                <div className="text-sm">{finishedAt ?? "-"}</div>
              </div>
            </div>

            <div className="text-left mb-4">
              <h3 className="font-medium mb-2">Review Logs</h3>
              <div className="space-y-2 max-h-48 overflow-auto">
                {logs.length === 0 && (
                  <div className="text-sm text-muted-foreground">
                    No logs available
                  </div>
                )}
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-background/50 rounded flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {findCardTitle((log as any).cardId)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date((log as any).reviewedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="ml-4">
                      {(log as any).known ? (
                        <span className="text-green-600">Known</span>
                      ) : (
                        <span className="text-destructive">Unknown</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 cursor-pointer"
                onClick={onHome}
              >
                Back to Home
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 cursor-pointer"
                onClick={onContinue}
              >
                Practice with Test
              </Button>
              <Button
                variant="default"
                size="lg"
                className="flex-1 cursor-pointer"
                onClick={onReset}
              >
                Reset Progress
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
