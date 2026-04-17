import { BookOpen, Share2, SwatchBook } from "lucide-react";
import { useState } from "react";
import ModeToggle from "@/components/theme/mode-toggle";
import LanguageToggle  from "@/components/language/language-toggle";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { ShareDialog } from "@/components/collaboration/ShareDialog";
import type { CollabRole } from "@/services/types/collaboration.types";
import { useAppSelector } from "@/hooks/redux";

interface FlashcardHeaderProps {
    setId: number;
    flashcardId: number;
    title: string;
    description: string;
    userRole?: CollabRole;
}

export default function FlashcardHeader({ setId, flashcardId, title, description, userRole = 'OWNER' }: FlashcardHeaderProps) {
    const navigate = useNavigate();
    const currentUserId = useAppSelector((s) => s.auth.user?.id);
    const [shareOpen, setShareOpen] = useState(false);

    const handleClick = () => {
        navigate(`/sets/${setId}/flashcards`);
    };

    return (
        <div className="border-b">
            <div className="max-w-4xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-end gap-4">
                        <div className="flex items-center gap-4">
                            <SwatchBook className="w-8 h-8" />
                            <h1 className="text-3xl font-bold">{title}</h1>
                        </div>
                        <div
                            className="flex items-center gap-2 cursor-pointer hover:underline"
                            onClick={handleClick}
                        >
                            <BookOpen className="w-5 h-5 text-muted-foreground" />
                            <span className="text-muted-foreground text-sm">setTitle</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setShareOpen(true)}
                        >
                            <Share2 className="size-4" />
                            Share
                        </Button>
                        <NotificationBell />
                        <ModeToggle />
                        <LanguageToggle />
                    </div>
                </div>
                <div className="text-sm text-muted-foreground">
                    {description}
                </div>
            </div>
            <ShareDialog
                open={shareOpen}
                onOpenChange={setShareOpen}
                setId={setId}
                resourceType="flashcards"
                resourceId={flashcardId}
                userRole={userRole}
                currentUserId={currentUserId}
            />
        </div>
    );
}