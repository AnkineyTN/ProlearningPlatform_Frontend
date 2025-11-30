import { Edit, Trash2, Volume2, Brain, Blocks, Heart, MoreVertical, Share2, X, Check, Image as ImageIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FlipFlashcard from "./FlipFlashcard";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Card as CardData } from "@/services/types/flashcard.types";
import { useUploadImageFile } from '@/hooks/useImageUpload';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';

interface HomeViewProps {
    setId: number;
    flashcardId: number | string;
    flashcards: CardData[];
    onCardClick: (index: number) => void;
    onStudy: () => void;
    onMatching: () => void;
    isFlipped: boolean;
    currentCardIndex: number;
    onFlip: () => void;
    onPrevious: () => void;
    onNext: () => void;
    onUpdateCard: (data: {
        id: number;
        frontCard: string;
        backCard: string;
        imageAssetId?: number;
        cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
    }) => void;
    onDeleteCard: (cardId: number) => void;
    isUpdating?: boolean;
    onDeleteFlashcard?: () => void;
    isDeletingFlashcard?: boolean;
    onShuffle: () => void;
}

export default function HomeView({
    setId,
    flashcards,
    flashcardId,
    onCardClick,
    onStudy,
    onMatching,
    isFlipped,
    currentCardIndex,
    onFlip,
    onPrevious,
    onNext,
    onShuffle,
    onUpdateCard,
    onDeleteCard,
    onDeleteFlashcard,
    isUpdating = false
}: HomeViewProps) {
    const navigate = useNavigate();
    const [showMenu, setShowMenu] = useState(false);
    const [editingCardId, setEditingCardId] = useState<number | null>(null);
    const [editData, setEditData] = useState<{
        frontCard: string;
        backCard: string;
        imageUrl?: string;
        imageAssetId?: number;
    }>({
        frontCard: '',
        backCard: '',
        imageUrl: undefined,
        imageAssetId: undefined
    });
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showDeleteCardDialog, setShowDeleteCardDialog] = useState(false);
    const uploadImageMutation = useUploadImageFile();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showMenu]);

    const handleMoreClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
    };

    const handleDeleteFlashcard = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        setShowDeleteDialog(true);
    };

    const handleConfirmDeleteFlashcard = () => {
        if (onDeleteFlashcard) {
            onDeleteFlashcard();
        }
        setShowDeleteDialog(false);
    };

    const handleUpdate = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        // Navigate to update page
        navigate(`/sets/${setId}/flashcards/${flashcardId}/update`);
    };

    const handleEditCard = (card: CardData, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCardId(card.id);
        setEditData({
            frontCard: card.frontCard,
            backCard: card.backCard,
            imageUrl: card.imageUrl || undefined,
            imageAssetId: undefined
        });
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingCardId(null);
        setEditData({
            frontCard: '',
            backCard: '',
            imageUrl: undefined,
            imageAssetId: undefined
        });
    };

    const handleSaveEdit = async (card: CardData, e: React.MouseEvent) => {
        e.stopPropagation();

        if (!editData.frontCard.trim() || !editData.backCard.trim()) {
            alert('Front and back card cannot be empty');
            return;
        }

        await onUpdateCard({
            id: card.id,
            frontCard: editData.frontCard.trim(),
            backCard: editData.backCard.trim(),
            imageAssetId: editData.imageAssetId,
            cardStatus: card.cardStatus
        });

        setEditingCardId(null);
        setEditData({
            frontCard: '',
            backCard: '',
            imageUrl: undefined,
            imageAssetId: undefined
        });
    };

    const handleDeleteCard = (e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        setShowDeleteCardDialog(true);
    };

    const handleConfirmDeleteCard = (cardId: number) => {
        onDeleteCard(cardId);
        setShowDeleteCardDialog(false);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
        }

        try {
            const result = await uploadImageMutation.mutateAsync(file);
            setEditData(prev => ({
                ...prev,
                imageUrl: result.url,
                imageAssetId: result.assetId
            }));
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Upload failed:', error);
            alert('Failed to upload image. Please try again.');
        }
    };

    const handleRemoveImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditData(prev => ({
            ...prev,
            imageUrl: undefined,
            imageAssetId: undefined
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleImageClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        fileInputRef.current?.click();
    };

    return (
        <>
            <div className="max-w-4xl mx-auto p-6">
                <div className="flex gap-2 mb-6">
                    <Button
                        variant="default"
                        onClick={onStudy}
                        className="gap-2 cursor-pointer"
                    >
                        <Brain className="w-5 h-5" />
                        Study
                    </Button>
                    <Button
                        variant="default"
                        onClick={onMatching}
                        className="gap-2 cursor-pointer"
                    >
                        <Blocks className="w-5 h-5" />
                        Matching
                    </Button>
                    <div className="ml-auto flex gap-2">
                        <Button variant="ghost" size="icon" className='cursor-pointer'>
                            <Heart className="w-5 h-5" />
                        </Button>
                        <div className="relative" ref={menuRef}>
                            <Button
                                variant="ghost"
                                onClick={handleMoreClick}
                                className="hover:bg-card-secondary p-1 rounded cursor-pointer transition-colors"
                                title="More options"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>

                            {showMenu && (
                                <div className="absolute right-0 mt-1 w-30 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
                                    <Button
                                        variant="ghost"
                                        onClick={handleUpdate}
                                        className="w-full text-center transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Update
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={handleDeleteFlashcard}
                                        className="w-full text-center text-destructive cursor-pointer transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" size="icon" className='cursor-pointer'>
                            <Share2 className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="mb-6">
                    <FlipFlashcard
                        isFlipped={isFlipped}
                        flashcards={flashcards}
                        currentCardIndex={currentCardIndex}
                        onFlip={onFlip}
                        onPrevious={onPrevious}
                        onNext={onNext}
                        onShuffle={onShuffle}
                    />
                </div>

                <h2 className="text-lg font-bold mb-4">Card ({flashcards.length})</h2>

                <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />

                <div className="space-y-3">
                    {flashcards.map((card, index) => (
                        <Card
                            key={card.id}
                            className={`transition-all ${editingCardId === card.id ? 'shadow-lg' : 'cursor-pointer hover:shadow-md'}`}
                            onClick={() => editingCardId !== card.id && onCardClick(index)}
                        >
                            <CardContent>
                                {editingCardId === card.id ? (
                                    // Edit Mode
                                    <div className="space-y-4 flex flex-col justify-end" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-end gap-4">
                                            <div className="flex-1 max-w-[250px]">
                                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                    Term
                                                </label>
                                                <Textarea
                                                    value={editData.frontCard}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, frontCard: e.target.value }))}
                                                    placeholder="Enter front card text"
                                                    className="min-h-[50px] resize-none"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="flex-1 border-l pl-6">
                                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                    Definition
                                                </label>
                                                <Textarea
                                                    value={editData.backCard}
                                                    onChange={(e) => setEditData(prev => ({ ...prev, backCard: e.target.value }))}
                                                    placeholder="Enter back card text"
                                                    className="min-h-[50px] resize-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {editData.imageUrl ? (
                                                    <div className="relative group">
                                                        <img
                                                            src={editData.imageUrl}
                                                            alt="Card"
                                                            className="w-16 h-16 object-cover rounded border-2 border-border"
                                                        />
                                                        <button
                                                            onClick={handleRemoveImage}
                                                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        variant="outline"
                                                        onClick={handleImageClick}
                                                        disabled={uploadImageMutation.isPending}
                                                        className="h-16 w-16 rounded transition-colors cursor-pointer border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground hover:border-foreground disabled:opacity-50"
                                                    >
                                                        {uploadImageMutation.isPending ? (
                                                            <Loader2 className="w-6 h-6 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <ImageIcon className="w-6 h-6" />
                                                                <span className="text-xs">Image</span>
                                                            </>
                                                        )}
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-auto">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleCancelEdit}
                                                className="gap-2 cursor-pointer"
                                            >
                                                <X className="w-4 h-4" />
                                                Cancel
                                            </Button>
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={(e) => handleSaveEdit(card, e)}
                                                disabled={isUpdating || !editData.frontCard.trim() || !editData.backCard.trim()}
                                                className="gap-2 cursor-pointer"
                                            >
                                                <Check className="w-4 h-4" />
                                                {isUpdating ? 'Saving...' : 'Save'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    // View Mode
                                    <div className="flex items-start gap-4">
                                        <div className="flex-1 max-w-[250px]">
                                            <p className="font-medium mb-2">{card.frontCard}</p>
                                        </div>
                                        <div className="flex-1 border-l pl-6">
                                            <p className="text-foreground">{card.backCard}</p>
                                        </div>
                                        <div className="">
                                            {card.imageUrl && (
                                                <img
                                                    src={card.imageUrl}
                                                    alt="Flashcard"
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer hover:bg-accent"
                                                onClick={(e) => handleEditCard(card, e)}
                                                title="Edit card"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={(e) => handleDeleteCard(e)}
                                                title="Delete card"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer hover:bg-accent">
                                                <Volume2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <DeleteConfirmDialog
                    isOpen={showDeleteCardDialog}
                    onClose={() => setShowDeleteCardDialog(false)}
                    onConfirm={() => handleConfirmDeleteCard(editingCardId!)}
                    title="Delete Card"
                    itemName={`this card`}
                />

                <DeleteConfirmDialog
                    isOpen={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    onConfirm={handleConfirmDeleteFlashcard}
                    title="Delete Flashcard"
                    itemName={`this flashcard`}
                />
            </div>
        </>
    );
}