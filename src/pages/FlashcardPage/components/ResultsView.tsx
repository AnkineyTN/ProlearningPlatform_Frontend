import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import type { ReviewLog } from "@/services/types/flashcard-session.types";

interface ResultsViewProps {
  studiedCards: number;
  totalCards: number;
  onHome: () => void;
  onContinue: () => void;
  onReset: () => void;
  sessionResult?: {
    sessionId: number;
    correctCount: number;
    incorrectCount: number;
    finishedAt: string;
    logs: ReviewLog[];
  };
}

export default function ResultsView({ studiedCards, totalCards, onHome, onContinue, onReset }: ResultsViewProps) {
    return (
        <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="min-h-[70vh] flex items-center justify-center">
                <Card className="max-w-2xl w-full">
                    <CardContent className="p-12 text-center">
                        <div className="mb-8">
                            <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-bold mb-2">Great job!</h2>
                            <p className="text-muted-foreground">You've completed this study session</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-8">
                            <div className="p-6 bg-muted rounded-lg">
                                <div className="text-4xl font-bold text-foreground mb-2">
                                    {studiedCards}
                                </div>
                                <div className="text-sm text-muted-foreground">Cards Studied</div>
                            </div>
                            <div className="p-6 bg-muted rounded-lg">
                                <div className="text-4xl font-bold text-muted-foreground mb-2">
                                    {totalCards - studiedCards}
                                </div>
                                <div className="text-sm text-muted-foreground">Not Yet Studied</div>
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
                                Continue Studying
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