import { X, Pencil, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CreateMethodModalProps {
    type: string;
    isOpen: boolean;
    onClose: () => void;
    onSelectManual: () => void;
    onSelectAI: () => void;
}

export default function CreateMethodModal({
    type,
    isOpen,
    onClose,
    onSelectManual,
    onSelectAI
}: CreateMethodModalProps) {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-background rounded-lg shadow-xl w-full max-w-4xl mx-4 px-10 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">{t('modal.method.header', { type })}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-card rounded transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Options */}
                <div className="grid grid-cols-2 gap-8 mb-2">
                    {/* Manual Creation */}
                    <button
                        onClick={onSelectManual}
                        className="p-6 border-2 border-dashed border-ring rounded-lg hover:border-foreground hover:bg-card transition-all cursor-pointer group"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-card group-hover:bg-foreground/10 flex items-center justify-center transition-colors">
                                <Pencil className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{t('modal.method.manualCreation')}</h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ {t('modal.method.customContent')}</li>
                                    <li>✓ {t('modal.method.addImages')}</li>
                                    <li>✓ {t('modal.method.importFromText')}</li>
                                </ul>
                            </div>
                        </div>
                    </button>

                    {/* AI Generation */}
                    <button
                        onClick={onSelectAI}
                        className="p-6 border-2 border-dashed border-ring rounded-lg hover:border-foreground hover:bg-card transition-all cursor-pointer group"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-card group-hover:bg-foreground/10 flex items-center justify-center transition-colors">
                                <Sparkles className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg mb-2">{t('modal.method.aiGeneration')}</h3>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>✓ {t('modal.method.quickGeneration')}</li>
                                    <li>✓ {t('modal.method.smartContentExtraction')}</li>
                                    <li>✓ {t('modal.method.multipleSources')}</li>
                                </ul>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}