import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface DropdownMenuProps {
    onUpdate: (e: React.MouseEvent) => void;
    onDelete: (e: React.MouseEvent) => void;
}

export default function DropdownMenu({ onUpdate, onDelete }: DropdownMenuProps) {
    const { t } = useTranslation();
    return (
        <div className="absolute right-0 mt-1 w-30 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
            <Button
                variant="ghost"
                onClick={onUpdate}
                className="w-full transition-colors cursor-pointer flex justify-start pl-3 items-center gap-2"
            >
                <Edit className="w-4 h-4" />
                {t('modal.update')}
            </Button>
            <Button
                variant="ghost"
                onClick={onDelete}
                className="w-full text-destructive hover:text-red-500 transition-colors cursor-pointer flex justify-start pl-3 items-center gap-2"
            >
                <Trash2 className="w-4 h-4" />
                {t('modal.delete')}
            </Button>
        </div>
    );
}