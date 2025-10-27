import { Blocks } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatchingViewProps {
    onBack: () => void;
}

export default function MatchingView({ onBack }: MatchingViewProps) {
    return (
        <>
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="text-center py-20">
                    <div className="mb-8">
                        <Blocks className="w-20 h-20 mx-auto mb-4 text-muted-foreground" />
                        <h2 className="text-2xl font-bold mb-2">Matching Game</h2>
                        <p className="text-xl text-muted-foreground">Coming soon!</p>
                    </div>
                    <Button variant="outline" onClick={onBack} className="cursor-pointer">
                        Back to Home
                    </Button>
                </div>
            </div>
        </>
    );
}