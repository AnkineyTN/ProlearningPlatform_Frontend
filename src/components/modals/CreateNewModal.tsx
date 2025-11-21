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
import { Label } from '../ui/label';
import { Input } from '../ui/input';

interface CreateNewModalProps {
    type: string;
    isOpen: boolean;
    onClose: () => void;
    onBack?: () => void;
    onSubmit: (data: { title: string; description: string; privacy: string }) => void;
    initialData?: { title: string; description: string; privacy: string };
    isUpdateMode?: boolean;
}

export default function CreateNewModal({ type, isOpen, onClose, onBack, onSubmit, initialData, isUpdateMode }: CreateNewModalProps) {
    const [title, setTitle] = useState(initialData?.title || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [privacy, setPrivacy] = useState(initialData?.privacy || 'Public');
    const [errors, setErrors] = useState<{ titleEmpty?: boolean; titleTooLong?: boolean; privacy?: boolean }>({});
    const { t } = useTranslation();

    if (!isOpen) return null;

    const handleSubmit = () => {
        // Validate fields
        const newErrors: { titleEmpty?: boolean; titleTooLong?: boolean; privacy?: boolean } = {};

        if (!title.trim()) {
            newErrors.titleEmpty = true;
        }

        if (title.length >= 100) {
            newErrors.titleTooLong = true;
        }

        if (!privacy) {
            newErrors.privacy = true;
        }

        // If there are errors, set them and don't submit
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit if validation passes
        onSubmit({ title, description, privacy });

        // Reset form
        setTitle('');
        setDescription('');
        setPrivacy('Public');
        setErrors({});
        onClose();
    };

    const handleCancel = () => {
        if (onBack) {
            onBack();
        } else {
            setTitle('');
            setDescription('');
            setPrivacy('Public');
            setErrors({});
            onClose();
        }
    };

    // Clear error when user starts typing
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        if (errors.titleEmpty || errors.titleTooLong) {
            setErrors(prev => ({ ...prev, titleEmpty: false, titleTooLong: false }));
        }
    };

    const handlePrivacyChange = (val: string) => {
        setPrivacy(val);
        if (errors.privacy) {
            setErrors(prev => ({ ...prev, privacy: false }));
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
            <div className="relative bg-background rounded-lg shadow-xl w-full max-w-xl mx-4 p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold"> {isUpdateMode ? t('modal.update') : t('modal.new')} {type}</h2>
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
                        <Label className="flex items-center gap-2 font-medium mb-3">
                            <Heading className="w-4 h-4" />
                            {t('modal.title')}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            className={`w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 ${errors.titleEmpty || errors.titleTooLong
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-border focus:ring-foreground'
                                }`}
                            placeholder={t('modal.title')}
                        />
                        {errors.titleEmpty && (
                            <p className="text-red-500 text-sm mt-1">{t('modal.titleEmpty')}</p>
                        )}
                        {errors.titleTooLong && (
                            <p className="text-red-500 text-sm mt-1">{t('modal.titleTooLong')}</p>
                        )}
                    </div>

                    {/* Privacy */}
                    <div>
                        <Label className="flex items-center gap-2 font-medium mb-3">
                            <Lock className="w-4 h-4" />
                            {t('modal.privacy')}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={privacy}
                            onValueChange={handlePrivacyChange}
                        >
                            <SelectTrigger className={`w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 ${errors.privacy
                                    ? 'border-red-500 focus:ring-red-500'
                                    : 'border-border focus:ring-foreground'
                                }`}>
                                <SelectValue placeholder="Select privacy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Public">🌐 {t('modal.public')}</SelectItem>
                                <SelectItem value="Private">🔒 {t('modal.private')}</SelectItem>
                                <SelectItem value="Unlisted">👁️ {t('modal.unlisted')}</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.privacy && (
                            <p className="text-red-500 text-sm mt-1">{t('modal.privacyRequired')}</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <Label className="flex items-center gap-2 font-medium mb-3">
                            <AlignJustify className="w-4 h-4" />
                            <span>{t('modal.description')}</span>
                        </Label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground resize-none"
                            rows={4}
                            placeholder={t('modal.enterDescription')}
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
                        className="px-6 py-2 bg-foreground text-background rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        {isUpdateMode ? t('modal.update') : t('modal.create')}
                    </Button>
                </div>
            </div>
        </div>
    );
}