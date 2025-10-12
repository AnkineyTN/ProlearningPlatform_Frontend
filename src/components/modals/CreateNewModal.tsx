import { useState } from 'react';
import { X, Lock, Heading, AlignJustify } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CreateModalProps {
    type: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; privacy: string }) => void;
}

export default function CreateNewModal({ type, isOpen, onClose, onSubmit }: CreateModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [privacy, setPrivacy] = useState('Public');

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
        // Reset form
        setTitle('');
        setDescription('');
        setPrivacy('Public');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black opacity-50"
                onClick={handleCancel}
            />

            {/* Modal */}
            <div className="relative bg-background rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">New {type}</h2>
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
                            Set Title
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
                            Privacy
                        </label>
                        <select
                            value={privacy}
                            onChange={(e) => setPrivacy(e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-foreground"
                        >
                            <option>Public</option>
                            <option>Private</option>
                            <option>Unlisted</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium mb-2">
                            <AlignJustify className="w-4 h-4" />
                            Description <span className="text-muted-foreground">(Optional)</span>
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
                        className="px-6 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-card-secondary transition-colors cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!title.trim()}
                        className="px-6 py-2 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}