import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Plus, Shuffle, MoreHorizontal, Trash2 } from 'lucide-react';
import {
    useCreateFlashcardManual,
    useFlashcardDetail,
    useAddCards,
    useUpdateMultipleCards,
    useDeleteMultipleCards
} from '@/hooks/useFlashcards';
import FlashcardItemWrapper from './FlashcardItemComponent';

interface FlashcardCard {
    id: number | string;
    term: string;
    definition: string;
    imageUrl?: string;
    assetId?: number;
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

    // Xác định mode: Create hoặc Update
    const isUpdateMode = !!flashcardId;

    const createFlashcardMutation = useCreateFlashcardManual();
    const addCardsMutation = useAddCards();
    const updateCardsMutation = useUpdateMultipleCards();
    const deleteCardsMutation = useDeleteMultipleCards();

    // Fetch data nếu là Update mode
    const { data: flashcardData, isLoading } = useFlashcardDetail(
        setId,
        flashcardId || 0,
    );

    // State từ location (cho Create mode)
    const { title: locationTitle, description: locationDescription, privacy } = location.state || {};

    // State cho title và description
    const [title, setTitle] = useState(locationTitle || '');
    const [description, setDescription] = useState(locationDescription || '');

    const [cards, setCards] = useState<FlashcardCard[]>([
        { id: crypto.randomUUID(), term: '', definition: '', assetId: undefined, imageUrl: '' }
    ]);

    const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

    // Load data khi ở Update mode
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
                    assetId: card.imageAssetId || ''
                })));
            }
        }
    }, [flashcardData, isUpdateMode]);

    // Validate route cho Create mode
    useEffect(() => {
        if (!isUpdateMode && (!locationTitle || !setId)) {
            navigate(`/sets/${setId}`);
        }
    }, [locationTitle, setId, navigate, isUpdateMode]);

    const addCard = () => {
        setCards([...cards, { id: crypto.randomUUID(), term: '', definition: '' }]);
    };

    const removeCard = (id: number | string) => {
        if (cards.length > 1) {
            setCards(cards.filter(card => card.id !== id));
        }
    };

    const updateCard = (
        id: number | string,
        field: 'term' | 'definition' | 'imageUrl' | 'assetId',
        value?: string
    ) => {
        setCards(prevCards =>
            prevCards.map(card =>
                card.id === id ? { ...card, [field]: value } : card
            )
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

    const handleSave = async () => {
        // Validate
        const validCards = cards.filter(card => card.term.trim() && card.definition.trim());

        if (validCards.length === 0) {
            alert('Please add at least one card with both term and definition');
            return;
        }

        try {
            if (isUpdateMode) {
                // UPDATE MODE
                const originalCardIds = flashcardData?.data.cards?.map((c: any) => c.id) || [];
                const currentCardIds = validCards.filter(c => typeof c.id === 'number').map(c => c.id);

                // Tìm cards cần update (cards đã tồn tại)
                const cardsToUpdate = validCards.filter(card => typeof card.id === 'number');

                // Tìm cards cần add (cards mới tạo - có id là string UUID)
                const cardsToAdd = validCards.filter(card => typeof card.id === 'string');

                // Tìm cards cần delete (cards có trong original nhưng không có trong current)
                const cardsToDelete = originalCardIds.filter((id: number) => !currentCardIds.includes(id));

                // Execute updates
                if (cardsToUpdate.length > 0) {
                    await updateCardsMutation.mutateAsync({
                        setId: Number(setId),
                        flashcardId: flashcardId!,
                        cards: cardsToUpdate.map(card => ({
                            id: card.id as number,
                            frontCard: card.term,
                            backCard: card.definition,
                            imageUrl: card.imageUrl || undefined,
                            imageAssetId: card.assetId || undefined
                        }))
                    });
                }

                // Add new cards
                if (cardsToAdd.length > 0) {
                    await addCardsMutation.mutateAsync({
                        setId: Number(setId),
                        flashcardId: flashcardId!,
                        cards: cardsToAdd.map(card => ({
                            frontCard: card.term,
                            backCard: card.definition,
                            imageUrl: card.imageUrl || undefined,
                            imageAssetId: card.assetId || undefined
                        }))
                    });
                }

                // Delete removed cards
                if (cardsToDelete.length > 0) {
                    await deleteCardsMutation.mutateAsync({
                        setId: Number(setId),
                        flashcardId: flashcardId!,
                        data: { cardIds: cardsToDelete }
                    });
                }

                // Navigate back to flashcard detail
                navigate(`/sets/${setId}/flashcards/${flashcardId}`);
            } else {
                await createFlashcardMutation.mutateAsync({
                    setId: Number(setId),
                    data: {
                        title,
                        description,
                        privacy: privacy as 'PUBLIC' | 'PRIVATE',
                        cards: validCards.map(({ id, term, definition, imageUrl, assetId }) => ({
                            id: id as number,
                            frontCard: term,
                            backCard: definition,
                            imageUrl: imageUrl || undefined,
                            imageAssetId: assetId || undefined
                        }))
                    }
                });

                // Navigate back to set page
                navigate(`/sets/${setId}`);
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
                        className="mb-4 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>

                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{title}</h1>
                            <p className="text-muted-foreground">{description}</p>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="bg-foreground text-background px-8"
                        >
                            {isSaving ? 'Saving...' : (isUpdateMode ? 'Update' : 'Create')}
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

                {/* Add Card Button */}
                <div className="flex justify-center mt-6">
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
        </div>
    );
}