import { useState } from 'react';
import { X, Lock, Heading, AlignJustify, ArrowLeft } from 'lucide-react';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface CreateNewModalProps {
    type: string;
    isOpen: boolean;
    onClose: () => void;
    onBack?: () => void;
    onSubmit: (data: { title: string; description: string; privacy: string }) => void;
    initialData?: { title: string; description: string; privacy: string };
}

export default function CreateNewModal({ type, isOpen, onClose, onBack, onSubmit, initialData }: CreateNewModalProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [privacy, setPrivacy] = useState(initialData?.privacy || 'Public');
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (title.trim()) {
            onSubmit({ title, description, privacy });
            // Reset form
            setTitle('');
            setDescription('');
            setPrivacy('Public');
            onClose();
        }
    };

    const handleCancel = () => {
        if (onBack) {
            // If there's a back handler, use it
            onBack();
        } else {
            // Otherwise, close and reset
            setTitle('');
            setDescription('');
            setPrivacy('Public');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={handleCancel}
            />

            {/* Modal */}
            <div className="relative bg-background rounded-lg shadow-xl w-full max-w-4xl mx-4 p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t('modal.new')} {type}</h2>
                    <button
                        onClick={handleCancel}
                        className="p-1 hover:bg-card rounded transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    {/* Set Title */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Heading className="w-4 h-4" />
                            {type} {t('modal.title')}
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                            placeholder="Enter set title"
                        />
                    </div>

                    {/* Privacy */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <Lock className="w-4 h-4" />
                            {t('modal.privacy')}
                        </label>
                        <Select
                            value={privacy}
                            onValueChange={(val) => setPrivacy(val)}
                        >
                            <SelectTrigger className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground">
                                <SelectValue placeholder="Select privacy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Public">🌐 {t('modal.public')}</SelectItem>
                                <SelectItem value="Private">🔒 {t('modal.private')}</SelectItem>
                                <SelectItem value="Unlisted">👁️ {t('modal.unlisted')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <AlignJustify className="w-4 h-4" />
                            <span>{t('modal.description')}</span> <span className="text-muted-foreground">({t('modal.optional')})</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground resize-none"
                            rows={4}
                            placeholder="Enter description"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                    <Button
                        onClick={handleCancel}
                        className="px-6 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-card-secondary transition-colors cursor-pointer flex items-center gap-2"
                    >
                        {onBack && <ArrowLeft className="w-4 h-4" />}
                        {onBack ? t('modal.back') : t('modal.cancel')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="px-6 py-2 bg-foreground text-background rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('modal.create')}
                    </Button>
                </div>
            </div>
        </div>
    );
}