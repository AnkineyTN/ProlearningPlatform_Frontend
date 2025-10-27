export interface FlashcardItem {
    id: string;
    term: string;
    definition: string;
    imageUrl?: string;
}

export interface FlashcardItemProps {
    card: FlashcardItem;
    index: number;
    onUpdate: (id: string, field: 'term' | 'definition', value: string) => void;
    onDelete: (id: string) => void;
    canDelete: boolean;
}

export interface FlashcardItemWrapperProps {
    card: FlashcardItem;
    index: number;
    onUpdate: (id: string, field: 'term' | 'definition', value: string) => void;
    onDelete: (id: string) => void;
    canDelete: boolean;
    onDragStart: (id: string) => void;
    onDragOver: (e: React.DragEvent, id: string) => void;
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

