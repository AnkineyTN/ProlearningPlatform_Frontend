// pages/FlashcardEditor.tsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCreateFlashcardManual } from '@/hooks/useFlashcards';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import FlashcardItemWrapper from './FlashcardItemComponent';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Shuffle } from 'lucide-react';
import { MoreHorizontal } from 'lucide-react';
import { Trash2 } from 'lucide-react';

interface FlashcardCard {
    id: string;
    term: string;
    definition: string;
    imageUrl?: string;
    assetId?: string | null;
}

export default function FlashcardEditor({ setId }: { setId: string }) {
    const location = useLocation();
    const navigate = useNavigate();
    const createFlashcardMutation = useCreateFlashcardManual();

    const { title, description, privacy } = location.state || {};

    const [cards, setCards] = useState<FlashcardCard[]>([
        { id: crypto.randomUUID(), term: '', definition: '', assetId: '' }
    ]);

    const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

    useEffect(() => {
        if (!title || !setId) {
            navigate(`/sets/${setId}`);
        }
    }, [title, setId, navigate]);

    const addCard = () => {
        setCards([...cards, { id: crypto.randomUUID(), term: '', definition: '' }]);
    };

    const removeCard = (id: string) => {
        if (cards.length > 1) {
            setCards(cards.filter(card => card.id !== id));
        }
    };

    const updateCard = (id: string, field: 'term' | 'definition', value: string) => {
        setCards(cards.map(card =>
            card.id === id ? { ...card, [field]: value } : card
        ));
    };

    const handleDragStart = (cardId: string) => {
        setDraggedCardId(cardId);
    };

    const handleDragOver = (e: React.DragEvent, targetCardId: string) => {
        e.preventDefault();

        if (!draggedCardId || draggedCardId === targetCardId) return;

        const draggedIndex = cards.findIndex(c => c.id === draggedCardId);
        const targetIndex = cards.findIndex(c => c.id === targetCardId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        const newCards = [...cards];
        const [draggedCard] = newCards.splice(draggedIndex, 1);
        newCards.splice(targetIndex, 0, draggedCard);

        setCards(newCards);
    };

    const handleDragEnd = () => {
        setDraggedCardId(null);
    };

    const handleSave = async () => {
        // Validate
        const validCards = cards.filter(card => card.term.trim() && card.definition.trim());

        if (validCards.length === 0) {
            alert('Please add at least one card with both term and definition');
            return;
        }

        try {
            await createFlashcardMutation.mutateAsync({
                setId: Number(setId),
                data: {
                    title,
                    description,
                    privacy: privacy as 'PUBLIC' | 'PRIVATE',
                    cards: validCards.map(({ term, definition, imageUrl, assetId }) => ({
                        frontCard: term,
                        backCard: definition,
                        imageUrl: imageUrl || null,
                        imageAssetId: assetId || null
                    }))
                }
            });

            // Navigate back to set page
            navigate(`/sets/${setId}`);
        } catch (error) {
            console.error('Error saving flashcard:', error);
        }
    };

    const handleBack = () => {
        navigate(`/sets/${setId}`);
    };

    return (
        <div className="min-h-screen p-6 bg-background">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        onClick={handleBack}
                        variant="ghost"
                        className="mb-4 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{title}</h1>
                            <p className="text-muted-foreground">{description}</p>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={createFlashcardMutation.isPending}
                            className="bg-foreground text-background px-8"
                        >
                            {createFlashcardMutation.isPending ? 'Saving...' : 'Create'}
                        </Button>
                    </div>
                </div>


                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-3">
                        <Button className="flex items-center gap-2 px-4 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer">
                            <Plus className="w-4 h-4" />
                            Import
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

                {/* Cards */}
                {cards.map((card, index) => (
                    <FlashcardItemWrapper
                        key={card.id}
                        card={card}
                        index={index}
                        onUpdate={updateCard}
                        onDelete={removeCard}
                        canDelete={cards.length > 1}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                        isDragging={draggedCardId === card.id}
                    />
                ))}
            </div>

            {/* Add Card Button */}
            <div className="flex justify-center">
                <Button
                    onClick={addCard}
                    variant="outline"
                    className="flex items-center gap-2 w-full max-w-md border-dashed border-2"
                >
                    <Plus className="w-5 h-5" />
                    Add Card
                </Button>
            </div>
        </div>
    );
}