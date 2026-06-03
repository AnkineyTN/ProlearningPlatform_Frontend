import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useUploadImageFile } from '@/hooks/useImageUpload';
import type { Card as CardData } from '@/services/types/flashcard.types';

interface EditData {
  frontCard: string;
  backCard: string;
  imageUrl?: string;
  imageAssetId?: number;
  imageRemoved: boolean;
}

const emptyEditData: EditData = {
  frontCard: '',
  backCard: '',
  imageUrl: undefined,
  imageAssetId: undefined,
  imageRemoved: false,
};

interface UpdateCardArgs {
  id: number;
  frontCard: string;
  backCard: string;
  imageAssetId?: number | null;
  cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
}

export function useCardEdit(
  onUpdateCard: (data: UpdateCardArgs) => void | Promise<void>,
) {
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editData, setEditData] = useState<EditData>(emptyEditData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadImageMutation = useUploadImageFile();

  const beginEdit = (card: CardData) => {
    setEditingCardId(card.id);
    setEditData({
      frontCard: card.frontCard,
      backCard: card.backCard,
      imageUrl: card.imageUrl || undefined,
      imageAssetId: undefined,
      imageRemoved: false,
    });
  };

  const cancelEdit = () => {
    setEditingCardId(null);
    setEditData(emptyEditData);
  };

  const saveEdit = async (card: CardData) => {
    if (!editData.frontCard.trim() || !editData.backCard.trim()) {
      toast.error('Front and back card cannot be empty');
      return;
    }
    await onUpdateCard({
      id: card.id,
      frontCard: editData.frontCard.trim(),
      backCard: editData.backCard.trim(),
      imageAssetId: editData.imageRemoved ? null : editData.imageAssetId,
      cardStatus: card.cardStatus,
    });
    cancelEdit();
  };

  const updateField = (key: 'frontCard' | 'backCard', value: string) => {
    setEditData((prev) => ({ ...prev, [key]: value }));
  };

  const triggerFilePicker = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      setEditData((prev) => ({
        ...prev,
        imageUrl: result.url,
        imageAssetId: result.assetId,
        imageRemoved: false,
      }));
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const removeImage = () => {
    setEditData((prev) => ({
      ...prev,
      imageUrl: undefined,
      imageAssetId: undefined,
      imageRemoved: true,
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return {
    editingCardId,
    editData,
    fileInputRef,
    isUploading: uploadImageMutation.isPending,
    beginEdit,
    cancelEdit,
    saveEdit,
    updateField,
    triggerFilePicker,
    handleFileChange,
    removeImage,
  };
}

export type UseCardEditReturn = ReturnType<typeof useCardEdit>;
