import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Plus, Shuffle, MoreHorizontal, Trash2 } from 'lucide-react';
import {
    useCreateFlashcardManual,
    useFlashcardDetail,
    useAddCards,
    useUpdateMultipleCards,
    useDeleteMultipleCards
} from '@/hooks/useFlashcards';
import FlashcardItemWrapper from './FlashcardItemComponent';
import ImportModal from '../components/ImportModal';

interface FlashcardCard {
    id: number | string;
    term: string;
    definition: string;
    imageUrl?: string;
    assetId?: number;
    _action?: 'CREATE' | 'UPDATE' | 'DELETE' | null;
}

export default function FlashcardEditor({
    setId,
    flashcardId
}: {
    setId: number;
    flashcardId?: number;
}) {
    const location = useLocation();
    const navigate = useNavigate();

    const isUpdateMode = !!flashcardId;

    const createFlashcardMutation = useCreateFlashcardManual();
    const addCardsMutation = useAddCards();
    const updateCardsMutation = useUpdateMultipleCards();
    const deleteCardsMutation = useDeleteMultipleCards();

    const { data: flashcardData, isLoading } = useFlashcardDetail(
        setId,
        flashcardId || 0,
    );

    const { title: locationTitle, description: locationDescription, privacy, generatedFlashcards } = location.state || {};

    const [title, setTitle] = useState(locationTitle || '');
    const [description, setDescription] = useState(locationDescription || '');

    const [cards, setCards] = useState<FlashcardCard[]>([
        { id: crypto.randomUUID(), term: '', definition: '', imageUrl: '', assetId: undefined, _action: 'CREATE' as 'CREATE' }
    ]);

    const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    useEffect(() => {
        if (isUpdateMode && flashcardData?.data) {
            const flashcard = flashcardData.data;
            setTitle(flashcard.title || '');
            setDescription(flashcard.description || '');

            if (flashcard.cards && flashcard.cards.length > 0) {
                setCards(flashcard.cards.map((card: any) => ({
                    id: card.id,
                    term: card.frontCard || '',
                    definition: card.backCard || '',
                    imageUrl: card.imageUrl || '',
                    assetId: card.imageAssetId || undefined,
                    _action: null
                })));
            }
        }
    }, [flashcardData, isUpdateMode]);

    useEffect(() => {
        if (!isUpdateMode && (!locationTitle || !setId)) {
            navigate(`/sets/${setId}`);
        }
    }, [locationTitle, setId, navigate, isUpdateMode]);

    // If navigation provided generated flashcards (from AI), populate the editor with them
    useEffect(() => {
        if (!isUpdateMode && Array.isArray(generatedFlashcards) && generatedFlashcards.length > 0) {
            setTitle(locationTitle || 'AI Generated Flashcards');
            setDescription(locationDescription || '');

            const imported = generatedFlashcards.map((card: any) => ({
                id: crypto.randomUUID(),
                term: card.frontCard || card.front || '',
                definition: card.backCard || card.back || '',
                assetId: undefined,
                _action: 'CREATE' as 'CREATE'
            }));

            setCards(imported);
        }
    }, [generatedFlashcards, isUpdateMode, locationTitle, locationDescription]);

    const addCard = () => {
        setCards([...cards, { id: crypto.randomUUID(), term: '', definition: '', imageUrl: '', assetId: undefined, _action: 'CREATE' as 'CREATE' }]);
    };

    const removeCard = (id: number | string) => {
        if (cards.length <= 1) return;

        setCards(prev => prev.map(card => {
            if (card.id === id) {
                if (typeof id === 'number') {
                    return { ...card, _action: 'DELETE' as 'DELETE' };
                }
                return null as any;
            }
            return card;
        }).filter(Boolean));
    };

    const updateCard = (
        id: number | string,
        field: 'term' | 'definition' | 'imageUrl' | 'assetId',
        value?: string | number
    ) => {
        setCards(prevCards =>
            prevCards.map(card => {
                if (card.id !== id) return card;

                const updated = { ...card, [field]: value } as FlashcardCard;

                if (card._action === 'CREATE') {
                    updated._action = 'CREATE' as 'CREATE';
                } else if (card._action !== 'DELETE') {
                    updated._action = 'UPDATE' as 'UPDATE';
                }

                return updated;
            })
        );
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

    const handleImport = (importedCards: { term: string; definition: string }[]) => {
        const newCards = importedCards.map(card => ({
            id: crypto.randomUUID(),
            term: card.term,
            definition: card.definition,
            assetId: undefined,
            _action: 'CREATE' as 'CREATE'
        }));

        if (cards.length === 1 && !cards[0].term && !cards[0].definition) {
            setCards(newCards);
        } else {
            setCards([...cards, ...newCards]);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            alert('Please enter a title');
            return;
        }

        const validCards = cards.filter(card => card.term.trim() && card.definition.trim());

        if (validCards.length === 0) {
            alert('Please add at least one card with both term and definition');
            return;
        }

        try {
            if (isUpdateMode) {
                const cardsToCreate = cards.filter(
                    c => c._action === 'CREATE' && typeof c.id === 'string'
                );
                const cardsToUpdate = cards.filter(
                    c => c._action === 'UPDATE' && typeof c.id === 'number'
                );
                const cardsToDelete = cards
                    .filter(c => c._action === 'DELETE' && typeof c.id === 'number')
                    .map(c => c.id as number);

                if (cardsToUpdate.length > 0) {
                    await updateCardsMutation.mutateAsync({
                        setId,
                        flashcardId: flashcardId!,
                        cards: cardsToUpdate.map(c => ({
                            id: c.id as number,
                            frontCard: c.term,
                            backCard: c.definition,
                            imageAssetId: c.assetId ? Number(c.assetId) : undefined
                        }))
                    });
                }

                if (cardsToCreate.length > 0) {
                    await addCardsMutation.mutateAsync({
                        setId,
                        flashcardId: flashcardId!,
                        cards: cardsToCreate.map(c => ({
                            frontCard: c.term,
                            backCard: c.definition,
                            imageAssetId: c.assetId ? Number(c.assetId) : undefined
                        }))
                    });
                }


                if (cardsToDelete.length > 0) {
                    await deleteCardsMutation.mutateAsync({
                        setId: Number(setId),
                        flashcardId: flashcardId!,
                        data: { cardIds: cardsToDelete }
                    });
                }

                navigate(`/sets/${setId}/flashcards/${flashcardId}`);
            } else {
                const res = await createFlashcardMutation.mutateAsync({
                    setId: Number(setId),
                    data: {
                        title,
                        description,
                        privacy: privacy as 'PUBLIC' | 'PRIVATE',
                        cards: (cards
                            .filter(c => c._action !== 'DELETE' && c.term.trim() && c.definition.trim())
                            .map(card => ({
                                frontCard: card.term,
                                backCard: card.definition,
                                imageAssetId: card.assetId as number | undefined
                            })) as any)
                    }
                });

                navigate(`/sets/${setId}/flashcards/${res.data.data.id}`);
            }
        } catch (error) {
            console.error('Error saving flashcard:', error);
            alert('Failed to save. Please try again.');
        }
    };

    const handleBack = () => {
        if (isUpdateMode) {
            navigate(`/sets/${setId}/flashcards/${flashcardId}`);
        } else {
            navigate(`/sets/${setId}`);
        }
    };

    if (isUpdateMode && isLoading) {
        return (
            <div className="min-h-screen p-6 bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    const isSaving = createFlashcardMutation.isPending ||
        addCardsMutation.isPending ||
        updateCardsMutation.isPending ||
        deleteCardsMutation.isPending;

    return (
        <div className="min-h-screen p-6 bg-background">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        onClick={handleBack}
                        variant="ghost"
                        className="mb-4 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                            <div>
                                <Label htmlFor="title" className="text-sm font-medium mb-2 block">
                                    Title *
                                </Label>
                                <Input
                                    id="title"
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter flashcard set title"
                                    className="text-2xl bg-card font-bold border-2 focus:border-primary"
                                />
                            </div>
                            <div>
                                <Label htmlFor="description" className="text-sm font-medium mb-2 block">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Add a description (optional)"
                                    className="min-h-[80px] resize-none bg-card border-2 focus:border-primary"
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-foreground cursor-pointer text-background px-8 mt-6"
                        >
                            {isSaving ? 'Saving...' : (isUpdateMode ? 'Update' : 'Create')}
                        </Button>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setIsImportModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-card text-foreground border border-border rounded-lg hover:bg-secondary transition-colors cursor-pointer"
                        >
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

                {/* Cards (hide those marked for deletion) */}
                {cards
                    .filter(c => c._action !== 'DELETE')
                    .map((card, index) => (
                        <FlashcardItemWrapper
                            key={card.id}
                            card={card}
                            index={index}
                            onUpdate={updateCard}
                            onDelete={removeCard}
                            canDelete={cards.filter(c => c._action !== 'DELETE').length > 1}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedCardId === card.id}
                        />
                    ))}

                {/* Add Card Button */}
                <div className="flex justify-center mt-6">
                    <Button
                        onClick={addCard}
                        variant="outline"
                        className="flex items-center gap-2 w-full max-w-md border-dashed border-2 cursor-pointer hover:bg-secondary transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Card
                    </Button>
                </div>
            </div>

            {/* Import Modal */}
            <ImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onInsert={handleImport}
            />
        </div>
    );
}