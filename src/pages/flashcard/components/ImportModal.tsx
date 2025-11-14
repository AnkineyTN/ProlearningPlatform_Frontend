import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ImportedCard {
    term: string;
    definition: string;
}

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInsert: (cards: ImportedCard[]) => void;
}

const FORMATS = {
    simple: {
        label: 'Simple (Term | Definition)',
        example: 'Variable | A container for storing data values\nFunction | A block of code that performs a specific task\nArray | A data structure that stores multiple values',
        separator: '|',
        description: 'Each line: Term | Definition'
    },
    tab: {
        label: 'Tab Separated',
        example: 'Variable\tA container for storing data values\nFunction\tA block of code that performs a specific task\nArray\tA data structure that stores multiple values',
        separator: '\t',
        description: 'Each line: Term [TAB] Definition'
    },
    comma: {
        label: 'Comma Separated',
        example: 'Variable,A container for storing data values\nFunction,A block of code that performs a specific task\nArray,A data structure that stores multiple values',
        separator: ',',
        description: 'Each line: Term, Definition'
    }
};

export default function ImportModal({ isOpen, onClose, onInsert }: ImportModalProps) {
    const [format, setFormat] = useState<keyof typeof FORMATS>('simple');
    const [content, setContent] = useState('');
    const [preview, setPreview] = useState<ImportedCard[]>([]);
    const [showPreview, setShowPreview] = useState(false);

    if (!isOpen) return null;

    const handleParse = () => {
        if (!content.trim()) {
            alert('Please enter content to import');
            return;
        }

        const lines = content.split('\n').filter(line => line.trim());
        const separator = FORMATS[format].separator;
        const parsed: ImportedCard[] = [];

        lines.forEach((line, index) => {
            const parts = line.split(separator);
            if (parts.length >= 2) {
                parsed.push({
                    term: parts[0].trim(),
                    definition: parts.slice(1).join(separator).trim()
                });
            } else if (parts.length === 1 && parts[0].trim()) {
                // Dòng chỉ có term, không có definition
                console.warn(`Line ${index + 1}: Missing definition`);
            }
        });

        if (parsed.length === 0) {
            alert('No valid cards found. Please check the format.');
            return;
        }

        setPreview(parsed);
        setShowPreview(true);
    };

    const handleInsert = () => {
        if (preview.length === 0) {
            alert('Please parse content first');
            return;
        }
        onInsert(preview);
        handleClose();
    };

    const handleClose = () => {
        setContent('');
        setPreview([]);
        setShowPreview(false);
        onClose();
    };

    const handleBack = () => {
        setShowPreview(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-background rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold">
                        {showPreview ? 'Preview Import' : 'Insert data'}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {!showPreview ? (
                        <>
                            {/* Format Selection */}
                            <div className="mb-6">
                                <Label className="text-sm font-medium mb-2 block">
                                    Choose import format:
                                </Label>
                                <Select value={format} onValueChange={(val) => setFormat(val as keyof typeof FORMATS)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="simple">{FORMATS.simple.label}</SelectItem>
                                        <SelectItem value="tab">{FORMATS.tab.label}</SelectItem>
                                        <SelectItem value="comma">{FORMATS.comma.label}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Format Example */}
                            <div className="mb-6 p-4 bg-muted rounded-lg">
                                <Label className="text-sm font-medium mb-2 block">
                                    Format example:
                                </Label>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {FORMATS[format].description}
                                </p>
                                <pre className="text-xs bg-background p-3 rounded border overflow-x-auto whitespace-pre-wrap">
                                    {FORMATS[format].example}
                                </pre>
                            </div>

                            {/* Content Input */}
                            <div className="mb-4">
                                <Label className="text-sm font-medium mb-2 block">
                                    Your content:
                                </Label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Paste your flashcard content here..."
                                    className="w-full h-64 p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Preview */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-sm text-muted-foreground">
                                        Found {preview.length} card{preview.length !== 1 ? 's' : ''}
                                    </p>
                                    <Button
                                        onClick={handleBack}
                                        variant="ghost"
                                        size="sm"
                                    >
                                        ← Back to edit
                                    </Button>
                                </div>

                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {preview.map((card, index) => (
                                        <div key={index} className="p-4 border rounded-lg bg-card">
                                            <div className="flex items-start gap-4">
                                                <span className="text-sm font-medium text-muted-foreground min-w-[24px]">
                                                    {index + 1}
                                                </span>
                                                <div className="flex items-start gap-4">
                                                    <div className='w-[160px]'>
                                                        <Label className="text-xs text-muted-foreground mb-1 block">
                                                            Term
                                                        </Label>
                                                        <p className="text-sm">{card.term}</p>
                                                    </div>
                                                    <div className="flex-1 border-l pl-6">
                                                        <Label className="text-xs text-muted-foreground mb-1 block">
                                                            Definition
                                                        </Label>
                                                        <p className="text-sm">{card.definition}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t">
                    <Button
                        onClick={handleClose}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    {!showPreview ? (
                        <Button
                            onClick={handleParse}
                            className="bg-foreground text-background"
                        >
                            Preview
                        </Button>
                    ) : (
                        <Button
                            onClick={handleInsert}
                            className="bg-foreground text-background"
                        >
                            Insert
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}