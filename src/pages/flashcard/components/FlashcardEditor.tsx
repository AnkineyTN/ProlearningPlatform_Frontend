import { useState } from 'react';
import { Plus, Lock, Image, Shuffle, Trash2, GripVertical, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FlashcardItem {
    id: string;
    term: string;
    definition: string;
    imageUrl?: string;
}

interface FlashcardEditorProps {
    initialTitle?: string;
    initialDescription?: string;
    initialPrivacy?: string;
    onSave?: (data: any) => void;
    onCancel?: () => void;
}

export default function FlashcardEditor({
    initialTitle = '',
    initialDescription = '',
    initialPrivacy = 'Public',
    onSave,
    onCancel
}: FlashcardEditorProps) {
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [privacy] = useState(initialPrivacy);
    const [flashcards, setFlashcards] = useState<FlashcardItem[]>([
        { id: '1', term: '', definition: '' },
        { id: '2', term: '', definition: '' },
    ]);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);

    const addFlashcard = () => {
        const newId = (flashcards.length + 1).toString();
        setFlashcards([...flashcards, { id: newId, term: '', definition: '' }]);
    };

    const deleteFlashcard = (id: string) => {
        if (flashcards.length > 2) {
            setFlashcards(flashcards.filter(card => card.id !== id));
        }
    };

    const updateFlashcard = (id: string, field: 'term' | 'definition', value: string) => {
        setFlashcards(flashcards.map(card =>
            card.id === id ? { ...card, [field]: value } : card
        ));
    };

    const handleDragStart = (id: string) => {
        setDraggedItem(id);
    };

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (draggedItem && draggedItem !== id) {
            const draggedIndex = flashcards.findIndex(card => card.id === draggedItem);
            const targetIndex = flashcards.findIndex(card => card.id === id);

            const newCards = [...flashcards];
            const [removed] = newCards.splice(draggedIndex, 1);
            newCards.splice(targetIndex, 0, removed);

            setFlashcards(newCards);
        }
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const handleSave = () => {
        onSave?.({
            title,
            description,
            privacy,
            flashcards: flashcards.filter(card => card.term.trim() || card.definition.trim())
        });
    };

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Create a new flashcard set</h1>
                    <div className="flex gap-3">
                        <Button
                            onClick={onCancel}
                            className="px-6 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-secondary transition-colors cursor-pointer"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!title.trim()}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Create and Practice
                        </Button>
                    </div>
                </div>

                {/* Title and Description */}
                <div className="bg-card rounded-lg p-6 mb-6 border border-border">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Title"
                        className="w-full text-2xl font-semibold bg-transparent border-none focus:outline-none mb-4 placeholder:text-muted-foreground"
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add description..."
                        className="w-full bg-transparent border-none focus:outline-none resize-none placeholder:text-muted-foreground"
                        rows={2}
                    />
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-3">
                        <Button className="flex items-center gap-2 px-4 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                            <Plus className="w-4 h-4" />
                            Import
                        </Button>
                        <Button className="flex items-center gap-2 px-4 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                            <Plus className="w-4 h-4" />
                            Add diagram
                        </Button>
                        <Button className="p-2 bg-card text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                            <Lock className="w-4 h-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">Suggestions</span>
                        <Label className="relative inline-flex items-center cursor-pointer">
                            <Input type="checkbox" className="sr-only peer" />
                            <div className="w-11 h-6 bg-muted-foreground rounded-full peer peer-checked:bg-blue-600 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </Label>
                        <Button className="p-2 bg-card text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                            <Shuffle className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-card text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 bg-card text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Flashcards */}
                <div className="space-y-4 mb-6">
                    {flashcards.map((card, index) => (
                        <div
                            key={card.id}
                            draggable
                            onDragStart={() => handleDragStart(card.id)}
                            onDragOver={(e) => handleDragOver(e, card.id)}
                            onDragEnd={handleDragEnd}
                            className="bg-card rounded-lg p-6 border border-border hover:border-muted-foreground transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {/* Number and Drag Handle */}
                                <div className="flex flex-col items-center gap-2 pt-2">
                                    <span className="text-lg font-semibold text-muted-foreground">{index + 1}</span>
                                    <button className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground">
                                        <GripVertical className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="flex-1 grid grid-cols-2 gap-4">
                                    {/* Term */}
                                    <div className="space-y-2">
                                        <textarea
                                            value={card.term}
                                            onChange={(e) => updateFlashcard(card.id, 'term', e.target.value)}
                                            placeholder="Term"
                                            className="w-full px-4 py-3 bg-background border-b-2 border-border focus:border-foreground focus:outline-none resize-none min-h-[100px]"
                                        />
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                                            TERM
                                        </label>
                                        <button className="p-2 hover:bg-secondary rounded transition-colors">
                                            <div className="w-full border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-foreground transition-colors cursor-pointer">
                                                <Image className="w-6 h-6 mb-1" />
                                                <span className="text-xs font-semibold uppercase">Image</span>
                                            </div>
                                        </button>
                                    </div>

                                    {/* Definition */}
                                    <div className="space-y-2">
                                        <textarea
                                            value={card.definition}
                                            onChange={(e) => updateFlashcard(card.id, 'definition', e.target.value)}
                                            placeholder="Definition"
                                            className="w-full px-4 py-3 bg-background border-b-2 border-border focus:border-foreground focus:outline-none resize-none min-h-[100px]"
                                        />
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">
                                            DEFINITION
                                        </label>
                                        <button className="p-2 hover:bg-secondary rounded transition-colors">
                                            <div className="w-full border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center text-muted-foreground hover:border-foreground transition-colors cursor-pointer">
                                                <Image className="w-6 h-6 mb-1" />
                                                <span className="text-xs font-semibold uppercase">Image</span>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                    onClick={() => deleteFlashcard(card.id)}
                                    disabled={flashcards.length <= 2}
                                    className="p-2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Card Button */}
                <button
                    onClick={addFlashcard}
                    className="w-full py-4 border-2 border-dashed border-border rounded-lg text-foreground font-semibold hover:border-foreground hover:bg-card transition-all cursor-pointer"
                >
                    + Add card
                </button>
            </div>
        </div>
    );
}