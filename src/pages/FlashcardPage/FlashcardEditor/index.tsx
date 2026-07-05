/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeft, Plus, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  useAddCards,
  useCreateFlashcardManual,
  useDeleteMultipleCards,
  useFlashcardDetail,
  useUpdateMultipleCards,
} from '@/hooks/useFlashcards';

import ImportModal from '../components/ImportModal';
import FlashcardItemWrapper from './FlashcardItemComponent';

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
  flashcardId,
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

  const {
    title: locationTitle,
    description: locationDescription,
    privacy,
    generatedFlashcards,
  } = location.state || {};

  const [title, setTitle] = useState(locationTitle || '');
  const [description, setDescription] = useState(locationDescription || '');
  const [cards, setCards] = useState<FlashcardCard[]>([
    {
      id: crypto.randomUUID(),
      term: '',
      definition: '',
      imageUrl: '',
      assetId: undefined,
      _action: 'CREATE',
    },
  ]);
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  useEffect(() => {
    if (isUpdateMode && flashcardData?.data) {
      const fc = flashcardData.data;
      setTitle(fc.title || '');
      setDescription(fc.description || '');
      if (fc.cards?.length > 0) {
        setCards(
          fc.cards.map((card: any) => ({
            id: card.id,
            term: card.frontCard || '',
            definition: card.backCard || '',
            imageUrl: card.imageUrl || '',
            assetId: card.imageAssetId || undefined,
            _action: null,
          })),
        );
      }
    }
  }, [flashcardData, isUpdateMode]);

  useEffect(() => {
    if (!isUpdateMode && (!locationTitle || !setId)) {
      navigate(`/sets/${setId}`);
    }
  }, [locationTitle, setId, navigate, isUpdateMode]);

  useEffect(() => {
    if (
      !isUpdateMode &&
      Array.isArray(generatedFlashcards) &&
      generatedFlashcards.length > 0
    ) {
      setTitle(locationTitle || 'AI Generated Flashcards');
      setDescription(locationDescription || '');
      setCards(
        generatedFlashcards.map((card: any) => ({
          id: crypto.randomUUID(),
          term: card.frontCard || card.front || '',
          definition: card.backCard || card.back || '',
          assetId: undefined,
          _action: 'CREATE' as const,
        })),
      );
    }
  }, [generatedFlashcards, isUpdateMode, locationTitle, locationDescription]);

  const addCard = () => {
    setCards([
      ...cards,
      {
        id: crypto.randomUUID(),
        term: '',
        definition: '',
        imageUrl: '',
        assetId: undefined,
        _action: 'CREATE',
      },
    ]);
  };

  const removeCard = (id: number | string) => {
    if (cards.length <= 1) return;
    setCards((prev) =>
      prev
        .map((card) => {
          if (card.id !== id) return card;
          if (typeof id === 'number')
            return { ...card, _action: 'DELETE' as const };
          return null as any;
        })
        .filter(Boolean),
    );
  };

  const updateCard = (
    id: number | string,
    field: 'term' | 'definition' | 'imageUrl' | 'assetId',
    value?: string | number,
  ) => {
    setCards((prev) =>
      prev.map((card) => {
        if (card.id !== id) return card;
        const updated = { ...card, [field]: value } as FlashcardCard;
        if (card._action === 'CREATE') {
          updated._action = 'CREATE';
        } else if (card._action !== 'DELETE') {
          updated._action = 'UPDATE';
        }
        return updated;
      }),
    );
  };

  const handleDragStart = (cardId: string) => setDraggedCardId(cardId);
  const handleDragEnd = () => setDraggedCardId(null);

  const handleDragOver = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    if (!draggedCardId || draggedCardId === targetCardId) return;
    const draggedIndex = cards.findIndex((c) => c.id === draggedCardId);
    const targetIndex = cards.findIndex((c) => c.id === targetCardId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const newCards = [...cards];
    const [dragged] = newCards.splice(draggedIndex, 1);
    newCards.splice(targetIndex, 0, dragged);
    setCards(newCards);
  };

  const handleImport = (
    importedCards: { term: string; definition: string }[],
  ) => {
    const newCards = importedCards.map((card) => ({
      id: crypto.randomUUID(),
      term: card.term,
      definition: card.definition,
      assetId: undefined,
      _action: 'CREATE' as const,
    }));
    if (cards.length === 1 && !cards[0].term && !cards[0].definition) {
      setCards(newCards);
    } else {
      setCards([...cards, ...newCards]);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    const validCards = cards.filter(
      (c) => c.term.trim() && c.definition.trim(),
    );
    if (validCards.length === 0) {
      toast.error('Please add at least one card with both term and definition');
      return;
    }

    try {
      if (isUpdateMode) {
        const toCreate = cards.filter(
          (c) => c._action === 'CREATE' && typeof c.id === 'string',
        );
        const toUpdate = cards.filter(
          (c) => c._action === 'UPDATE' && typeof c.id === 'number',
        );
        const toDelete = cards
          .filter((c) => c._action === 'DELETE' && typeof c.id === 'number')
          .map((c) => c.id as number);

        if (toUpdate.length > 0) {
          await updateCardsMutation.mutateAsync({
            setId,
            flashcardId: flashcardId!,
            cards: toUpdate.map((c) => ({
              id: c.id as number,
              frontCard: c.term,
              backCard: c.definition,
              imageAssetId: c.assetId ? Number(c.assetId) : undefined,
            })),
          });
        }
        if (toCreate.length > 0) {
          await addCardsMutation.mutateAsync({
            setId,
            flashcardId: flashcardId!,
            cards: toCreate.map((c) => ({
              frontCard: c.term,
              backCard: c.definition,
              imageAssetId: c.assetId ? Number(c.assetId) : undefined,
            })),
          });
        }
        if (toDelete.length > 0) {
          await deleteCardsMutation.mutateAsync({
            setId: Number(setId),
            flashcardId: flashcardId!,
            data: { cardIds: toDelete },
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
            cards: cards
              .filter(
                (c) =>
                  c._action !== 'DELETE' &&
                  c.term.trim() &&
                  c.definition.trim(),
              )
              .map((card) => ({
                frontCard: card.term,
                backCard: card.definition,
                imageAssetId: card.assetId as number | undefined,
              })) as any,
          },
        });
        navigate(`/sets/${setId}/flashcards/${res.data.data.id}`);
      }
    } catch (error) {
      toast.error(
        apiErrorMessage(
          error,
          'Flashcard title already exists. Please choose a different title.',
        ),
      );
    }
  };

  const handleBack = () => {
    if (isUpdateMode) navigate(`/sets/${setId}/flashcards/${flashcardId}`);
    else navigate(`/sets/${setId}`);
  };

  if (isUpdateMode && isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg-sunken)]'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
          <p className='text-sm text-muted-foreground'>Loading…</p>
        </div>
      </div>
    );
  }

  const isSaving =
    createFlashcardMutation.isPending ||
    addCardsMutation.isPending ||
    updateCardsMutation.isPending ||
    deleteCardsMutation.isPending;

  const visibleCards = cards.filter((c) => c._action !== 'DELETE');

  return (
    <div className='min-h-screen bg-[var(--pl-bg-sunken)]'>
      {/* Sticky header */}
      <div className='sticky top-0 z-10 bg-[var(--pl-bg)] border-b border-border'>
        <div className='max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6'>
          <button
            onClick={handleBack}
            className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            Back
          </button>
          <div className='flex-1 min-w-0'>
            <h1 className='font-[family-name:var(--font-display)] text-xl font-medium tracking-tight truncate'>
              {isUpdateMode ? 'Edit Flashcard Set' : 'New Flashcard Set'}
            </h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className='px-6 flex-shrink-0'
          >
            {isSaving ? 'Saving…' : isUpdateMode ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>

      <div className='max-w-5xl mx-auto p-6'>
        {/* Metadata */}
        <div className='bg-[var(--pl-bg)] border border-border rounded-xl p-6 mb-8 space-y-5'>
          <div>
            <Label
              htmlFor='fc-title'
              className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block'
            >
              Title <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='fc-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='Enter a title for your flashcard set'
              className='text-lg font-medium border-border focus:border-primary'
            />
          </div>
          <div>
            <Label
              htmlFor='fc-desc'
              className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block'
            >
              Description
            </Label>
            <Textarea
              id='fc-desc'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder='Add a description (optional)'
              className='min-h-[80px] resize-none border-border focus:border-primary'
            />
          </div>
        </div>

        {/* Controls bar */}
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className='w-3.5 h-3.5' />
              Import
            </Button>
          </div>
        </div>

        {/* Card count */}
        <div className='flex items-center gap-3 mb-4'>
          <p className='text-xs uppercase tracking-widest text-muted-foreground/60'>
            Cards
          </p>
          <span className='font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground'>
            {visibleCards.length}
          </span>
        </div>

        {/* Cards */}
        {visibleCards.map((card, index) => (
          <FlashcardItemWrapper
            key={card.id}
            card={card}
            index={index}
            onUpdate={updateCard}
            onDelete={removeCard}
            canDelete={visibleCards.length > 1}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            isDragging={draggedCardId === card.id}
          />
        ))}

        {/* Add card */}
        <button
          onClick={addCard}
          className='w-full flex items-center justify-center gap-2 py-5 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-[var(--pl-bg)] transition-colors cursor-pointer mt-2'
        >
          <Plus className='w-4 h-4' />
          Add Card
        </button>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onInsert={handleImport}
      />
    </div>
  );
}
