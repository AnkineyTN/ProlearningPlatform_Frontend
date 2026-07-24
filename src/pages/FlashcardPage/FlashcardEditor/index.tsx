/* eslint-disable @typescript-eslint/no-explicit-any */
import { ArrowLeft, Plus, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
import { apiErrorMessage } from '@/lib/apiError';
import { cn } from '@/lib/utils';

import ImportModal from '../components/ImportModal';
import FlashcardItemWrapper from './FlashcardItemComponent';

const TITLE_MAX_LENGTH = 100;
const DESCRIPTION_MAX_LENGTH = 500;

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
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isUpdateMode = !!flashcardId;
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
  const [draggedCardId, setDraggedCardId] = useState<number | string | null>(
    null,
  );
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const pointerYRef = useRef<number | null>(null);

  useEffect(() => {
    if (draggedCardId === null) return;

    const EDGE_SIZE = 120;
    const MAX_SCROLL_SPEED = 18;
    let rafId: number;

    const tick = () => {
      const y = pointerYRef.current;
      if (y !== null) {
        const viewportHeight = window.innerHeight;
        if (y < EDGE_SIZE) {
          const intensity = (EDGE_SIZE - y) / EDGE_SIZE;
          window.scrollBy(0, -MAX_SCROLL_SPEED * intensity);
        } else if (y > viewportHeight - EDGE_SIZE) {
          const intensity = (y - (viewportHeight - EDGE_SIZE)) / EDGE_SIZE;
          window.scrollBy(0, MAX_SCROLL_SPEED * intensity);
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [draggedCardId]);

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
      setTitle(locationTitle || t('flashcard.editor.aiGeneratedDefaultTitle'));
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
  }, [generatedFlashcards, isUpdateMode, locationTitle, locationDescription, t]);

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

  const duplicateCard = (id: number | string) => {
    setCards((prev) => {
      const sourceIndex = prev.findIndex((card) => card.id === id);
      if (sourceIndex === -1) return prev;
      const duplicate: FlashcardCard = {
        ...prev[sourceIndex],
        id: crypto.randomUUID(),
        _action: 'CREATE',
      };
      const newCards = [...prev];
      newCards.splice(sourceIndex + 1, 0, duplicate);
      return newCards;
    });
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

  const handleDragStart = (cardId: number | string) => setDraggedCardId(cardId);
  const handleDragEnd = () => {
    setDraggedCardId(null);
    pointerYRef.current = null;
  };

  const handleDragOver = (
    e: React.DragEvent,
    targetCardId: number | string,
  ) => {
    e.preventDefault();
    pointerYRef.current = e.clientY;
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
      toast.error(t('flashcard.editor.titleRequired'));
      return;
    }
    const activeCards = cards.filter((c) => c._action !== 'DELETE');
    if (activeCards.length === 0) {
      toast.error(t('flashcard.editor.noValidCards'));
      return;
    }
    const hasEmptyCard = activeCards.some(
      (c) => !c.term.trim() || !c.definition.trim(),
    );
    if (hasEmptyCard) {
      setShowValidation(true);
      toast.error(t('flashcard.editor.emptyCardError'));
      return;
    }
    setShowValidation(false);

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
            cards: activeCards.map((card) => ({
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
        apiErrorMessage(error, t('flashcard.editor.duplicateTitleError')),
      );
    }
  };

  const handleBack = () => {
    if (isUpdateMode) navigate(`/sets/${setId}/flashcards/${flashcardId}`);
    else setShowLeaveConfirm(true);
  };

  const handleConfirmLeave = () => {
    setShowLeaveConfirm(false);
    navigate(`/sets/${setId}/flashcards`);
  };

  if (isUpdateMode && isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg-sunken)]'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
          <p className='text-sm text-muted-foreground'>
            {t('common.loading')}
          </p>
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
      <div className='sticky top-0 z-10 bg-[var(--pl-bg)] border-b border-[var(--pl-border)]'>
        <div className='max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6'>
          <Button onClick={handleBack} variant='ghost' size='sm'>
            <ArrowLeft className='w-4 h-4' />
            {t('exam.back')}
          </Button>
          <div className='flex-1 min-w-0'>
            <h1 className='font-[family-name:var(--font-display)] text-xl font-medium tracking-tight truncate'>
              {isUpdateMode
                ? t('flashcard.editor.editTitle')
                : t('flashcard.editor.newTitle')}
            </h1>
          </div>
          <div className='flex items-center gap-4 flex-shrink-0'>
            <Button
              variant='outline'
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className='w-3.5 h-3.5' />
              {t('flashcard.editor.import')}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                isSaving ||
                title.length > TITLE_MAX_LENGTH ||
                description.length > DESCRIPTION_MAX_LENGTH
              }
            >
              {isSaving
                ? t('common.saving')
                : isUpdateMode
                  ? t('modal.updateButton')
                  : t('modal.create')}
            </Button>
          </div>
        </div>
      </div>

      <div className='max-w-5xl mx-auto p-6'>
        {/* Metadata */}
        <div className='rounded-2xl border border-[var(--pl-border)] bg-[var(--pl-bg-elev)] mb-8 overflow-hidden'>
          <div className='p-6 border-b border-[var(--pl-border)] space-y-2'>
            <div className='flex items-baseline justify-between gap-2'>
              <Label
                htmlFor='fc-title'
                className='font-[family-name:var(--font-mono-pl)] text-[11px] tracking-[0.2em] text-[var(--pl-text-faint)]'
              >
                {t('exam.editor.titleLabel')}{' '}
                <span className='text-[var(--pl-danger)]'>*</span>
              </Label>
              <span
                className={cn(
                  'text-xs shrink-0',
                  title.length > TITLE_MAX_LENGTH
                    ? 'text-[var(--pl-danger-text)]'
                    : 'text-muted-foreground',
                )}
              >
                {t('modal.charCount', {
                  current: title.length,
                  max: TITLE_MAX_LENGTH,
                  defaultValue: '{{current}}/{{max}}',
                })}
              </span>
            </div>
            <Input
              id='fc-title'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('flashcard.editor.titlePlaceholder')}
              className='h-auto border-0 bg-transparent dark:bg-transparent p-0 shadow-none font-[family-name:var(--font-display)] text-2xl font-medium focus-visible:ring-0'
            />
          </div>
          <div className='p-6 space-y-2'>
            <div className='flex items-baseline justify-between gap-2'>
              <Label
                htmlFor='fc-desc'
                className='font-[family-name:var(--font-mono-pl)] text-[11px] tracking-[0.2em] text-[var(--pl-text-faint)] uppercase'
              >
                {t('exam.editor.descriptionLabel')}
              </Label>
              <span
                className={cn(
                  'text-xs shrink-0',
                  description.length > DESCRIPTION_MAX_LENGTH
                    ? 'text-[var(--pl-danger-text)]'
                    : 'text-muted-foreground',
                )}
              >
                {t('modal.charCount', {
                  current: description.length,
                  max: DESCRIPTION_MAX_LENGTH,
                  defaultValue: '{{current}}/{{max}}',
                })}
              </span>
            </div>
            <Textarea
              id='fc-desc'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('flashcard.editor.descriptionPlaceholder')}
              className='min-h-[48px] resize-none border-0 bg-transparent dark:bg-transparent p-0 shadow-none text-sm leading-relaxed text-[var(--pl-text-muted)] focus-visible:ring-0'
            />
          </div>
        </div>

        {/* Card count */}
        <div className='flex items-center gap-3 mb-4'>
          <p className='text-xs uppercase tracking-widest text-muted-foreground/60'>
            {t('flashcard.editor.cardsLabel')}
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
            onDuplicate={duplicateCard}
            canDelete={visibleCards.length > 1}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            isDragging={draggedCardId === card.id}
            isTermInvalid={showValidation && !card.term.trim()}
            isDefinitionInvalid={showValidation && !card.definition.trim()}
          />
        ))}

        {/* Add card */}
        <button
          onClick={addCard}
          className='w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-[var(--pl-border)] text-sm text-muted-foreground hover:border-[var(--pl-accent)] hover:text-[var(--pl-accent)] hover:bg-[var(--pl-bg)] transition-colors cursor-pointer mt-2'
        >
          <Plus className='w-4 h-4' />
          {t('flashcard.editor.addCard')}
        </button>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onInsert={handleImport}
      />

      <AlertDialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('flashcard.editor.leaveConfirmTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('flashcard.editor.leaveConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleConfirmLeave}>
              {t('flashcard.editor.leaveConfirmLeave')}
            </AlertDialogCancel>
            <AlertDialogAction>
              {t('flashcard.editor.leaveConfirmCancel')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
