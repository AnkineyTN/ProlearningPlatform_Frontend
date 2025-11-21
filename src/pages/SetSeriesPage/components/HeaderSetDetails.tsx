import { useNavigate } from 'react-router-dom';
import { BookOpen, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ModeToggle } from "@/components/theme/mode-toggle";
import { LanguageToggle } from "@/components/language/language-toggle";

interface HeaderSetDetailsProps {
    onUpdate?: () => void;
    onDelete: () => void;
}

export default function HeaderSetDetails({ onUpdate, onDelete }: HeaderSetDetailsProps) {
    const navigate = useNavigate();
    const handleSetList = () => {
        navigate('/sets');
    }

    return (
        <div className='flex items-start justify-between mb-6 gap-10'>
            <div className="bg-card w-full rounded-2xl p-6 shadow-sm border border-card-secondary mb-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        <Button className="w-12 h-12 bg-card-secondary rounded-lg flex items-center hover:bg-card-secondary/60 justify-center cursor-pointer" onClick={handleSetList}>
                            <BookOpen className="text-foreground" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold text-foreground mb-1">Software Engineering</h1>
                            <p className="text-sm text-muted-foreground">Comprehensive software engineering concepts and practices for modern development</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button className="p-2 bg-card hover:bg-card-secondary rounded-lg transition-colors cursor-pointer" onClick={onUpdate}>
                            <Pencil className="w-5 h-5 text-muted-foreground" />
                        </Button>
                        <Button className="p-2 bg-card hover:bg-card-secondary rounded-lg transition-colors cursor-pointer" onClick={onDelete}>
                            <Trash2 className="w-5 h-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-between px-4 gap-4">
                <ModeToggle />
                <LanguageToggle />
            </div>
        </div>
    );
}