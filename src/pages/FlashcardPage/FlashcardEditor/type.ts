/* eslint-disable @typescript-eslint/no-explicit-any */
export interface FlashcardItem {
  id: number | string;
  term: string;
  definition: string;
  imageUrl?: string;
}

export interface FlashcardItemProps {
  card: FlashcardItem;
  index: number;
  onDragStart: (id: string) => void;
  onDragOver: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  onUpdate: (
    id: number | string,
    field: 'term' | 'definition' | 'imageUrl' | 'assetId',
    value?: string | number,
  ) => void;
  onDelete: (id: number | string) => void;
  onDuplicate: (id: number | string) => void;
  canDelete: boolean;
  isTermInvalid?: boolean;
  isDefinitionInvalid?: boolean;
}

export interface FlashcardItemWrapperProps {
  card: FlashcardItem;
  index: number;
  onUpdate: (
    id: number | string,
    field: 'term' | 'definition' | 'imageUrl' | 'assetId',
    value?: string | number,
  ) => void;
  onDelete: (id: number | string) => void;
  onDuplicate: (id: number | string) => void;
  canDelete: boolean;
  onDragStart: (id: number | string) => void;
  onDragOver: (e: React.DragEvent, id: number | string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export interface FlashcardEditorProps {
  initialTitle?: string;
  initialDescription?: string;
  initialPrivacy?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}
