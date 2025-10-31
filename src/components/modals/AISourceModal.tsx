import { useState } from 'react';
import { X, FileText, Upload, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotesBySet } from '@/hooks/useNotes';
import NoteCardSelect from '@/components/cards/NoteCardSelect';
import { useTranslation } from 'react-i18next';

interface AISourceModalProps {
    setId: number;
    currentPage: number;
    pageSize: number;
    type: string;
    isOpen: boolean;
    onClose: () => void;
    onBack: () => void;
    onSubmit: (data: { source: 'notes' | 'files'; selectedItems: any[] }) => void;
}

function getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

    if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
}

export default function AISourceModal({ setId, currentPage, pageSize, type, isOpen, onClose, onBack, onSubmit }: AISourceModalProps) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'notes' | 'files'>('notes');
    const [selectedNotes] = useState<number[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const { data: notesData } = useNotesBySet(
        setId,
        currentPage,
        pageSize
    );
    const notes = notesData?.items || [];

    if (!isOpen) return null;

    // const toggleNoteSelection = (noteId: number) => {
    //     setSelectedNotes(prev =>
    //         prev.includes(noteId)
    //             ? prev.filter(id => id !== noteId)
    //             : [...prev, noteId]
    //     );
    // };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploadedFiles(Array.from(e.target.files));
        }
    };

    const handleSubmit = () => {
        if (activeTab === 'notes' && selectedNotes.length > 0) {
            onSubmit({ source: 'notes', selectedItems: selectedNotes });
        } else if (activeTab === 'files' && uploadedFiles.length > 0) {
            onSubmit({ source: 'files', selectedItems: uploadedFiles });
        }
    };

    const canSubmit =
        (activeTab === 'notes' && selectedNotes.length > 0) ||
        (activeTab === 'files' && uploadedFiles.length > 0);

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
                    <h2 className="text-2xl font-bold">{t('modal.ai.header', { type: type.toLowerCase() })}</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-card rounded transition-colors cursor-pointer"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-border">
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === 'notes'
                            ? 'text-foreground border-b-2 border-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            {t('modal.ai.fromNotes')}
                        </div>
                    </button>
                    <button
                        onClick={() => setActiveTab('files')}
                        className={`px-4 py-2 font-medium transition-colors cursor-pointer ${activeTab === 'files'
                            ? 'text-foreground border-b-2 border-foreground'
                            : 'text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            {t('modal.ai.uploadFiles')}
                        </div>
                    </button>
                </div>

                {/* Content */}
                <div className="min-h-[300px] mb-6">
                    {activeTab === 'notes' && (
                        <div>
                            <p className="text-sm text-muted-foreground mb-4">
                                {t('modal.ai.selectNotes', { type: type.toLowerCase() })}
                            </p>
                            <div className="space-y-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                    {notes.map((note) => (
                                        <NoteCardSelect
                                            key={note.id}
                                            note={{
                                                id: note.id,
                                                title: note.title,
                                                description: note.description || 'No description available...',
                                                privacy: note.privacy,
                                                timeAgo: getTimeAgo(note.updated_at),
                                                created_at: new Date(note.created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })
                                            }}
                                            onSelected={() => null}
                                        />
                                    ))}
                                </div>
                            </div>
                            {selectedNotes.length > 0 && (
                                <p className="text-sm text-muted-foreground mt-3">
                                    {selectedNotes.length} note{selectedNotes.length > 1 ? 's' : ''} {t('modal.ai.selected')}
                                </p>
                            )}
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className="flex flex-col items-center justify-center">
                            <div className="mt-2 w-full border-2 border-dashed border-ring rounded-lg p-8 text-center hover:border-foreground transition-colors">
                                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="font-medium mb-2">{t('modal.uploadFiles')}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    PDF, DOCX, TXT
                                </p>
                                <label className="inline-block">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileUpload}
                                        className="hidden"
                                        accept=".pdf,.docx,.txt,.doc"
                                    />
                                    <span className="px-4 py-2 bg-foreground text-background rounded-lg cursor-pointer hover:opacity-90 transition-opacity inline-block">
                                        {t('modal.ai.chooseFiles')}
                                    </span>
                                </label>
                            </div>

                            {uploadedFiles.length > 0 && (
                                <div className="w-full mt-4">
                                    <p className="text-sm font-medium mb-2">{t('modal.uploadedFiles')}:</p>
                                    <div className="space-y-2">
                                        {uploadedFiles.map((file, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-2 bg-card rounded border border-border"
                                            >
                                                <span className="text-sm truncate">{file.name}</span>
                                                <button
                                                    onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== index))}
                                                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <Button
                        onClick={onBack}
                        className="px-6 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-card transition-colors cursor-pointer flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('modal.back')}
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="px-6 py-2 bg-foreground text-background rounded-lg cursor-pointer hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {t('modal.generateWithAI')}
                    </Button>
                </div>
            </div>
        </div>
    );
}