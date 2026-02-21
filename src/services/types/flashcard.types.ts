export type Flashcard = {
    id: number | string;
    title: string;
    description: string;
    status: 'NOT_COMPLETED' | 'COMPLETED';
    privacy: 'PUBLIC' | 'PRIVATE';
    lastStudy: string;
    known: number;
    learning: number;
    remain: number;
    createMethod: 'MANUAL' | 'AI';
}

export type FlashcardMetadata = {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
}

export type FlashcardResponse = {
    status: string;
    message: string;
    data: Flashcard[];
    metadata: FlashcardMetadata;
}

export type GetFlashcardsParams = {
    setId: number;
    page: number;
    size: number;
    sort?: string;
}

export type Card = {
    id: number;
    frontCard: string;
    backCard: string;
    imageUrl?: string | null;
    imageAssetId?: number;
    cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
}

export type FlashcardDetail = {
    id: string;
    title: string;
    description: string;
    status: 'NOT_COMPLETED' | 'COMPLETED';
    privacy: 'PUBLIC' | 'PRIVATE';
    lastStudy: string;
    known: number;
    learning: number;
    remain: number;
    createMethod: 'MANUAL' | 'AI';
    cards: Card[];
}

export type FlashcardDetailResponse = {
    status: string;
    message: string;
    data: FlashcardDetail;
    metadata: null;
}

export type CreateFlashcardManualRequest = {
    title: string;
    description: string;
    privacy: 'PUBLIC' | 'PRIVATE';
    cards: Card[];
}

export type CreateFlashcardResponse = {
    status: string;
    message: string;
    data: Flashcard;
    metadata: null;
}

export type UpdateFlashcardRequest = {
    title: string;
    description: string;
    privacy: 'PUBLIC' | 'PRIVATE';
}

export type UpdateFlashcardResponse = {
    status: string;
    message: string;
    data: Flashcard & {
        numCards: number;
        createdAt: string;
        updatedAt: string;
    };
    metadata: Record<string, never>;
}

export type DeleteFlashcardResponse = {
    status: string;
    message: string;
    data: null;
    metadata: Record<string, never>;
}

export type DeleteFlashcardRequest = {
    setId: number;
    flashcardId: number;
}

export type UpdateCardRequest = {
    id: number;
    frontCard: string;
    backCard: string;
    imageAssetId?: number;
    cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
}

export type UpdateCardResponse = {
    status: string;
    message: string;
    data: {
        id: number;
        frontCard: string;
        backCard: string;
        imageUrl?: string;
        cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
    };
    metadata: Record<string, never>;
}

export type DeleteCardResponse = {
    status: string;
    message: string;
    data: null;
    metadata: Record<string, never>;
}

export type AddCardsRequest = {
    frontCard: string;
    backCard: string;
    imageAssetId?: number;
    imageUrl?: string;
}

export type AddCardsResponse = {
    status: string;
    message: string;
    data: {
        id: string;
        title: string;
        description: string;
        status: 'COMPLETED' | 'NOT_COMPLETED';
        privacy: 'PUBLIC' | 'PRIVATE';
        lastStudy: string;
        known: number;
        learning: number;
        remain: number;
        createMethod: 'MANUAL' | 'AI';
        numCards: number;
        createdAt: string;
        updatedAt: string;
        cards: Card[];
    };
    metadata: Record<string, never>;
}

export type DeleteMultipleCardsRequest = {
    cardIds: number[];
}

export type DeleteMultipleCardsResponse = {
    status: string;
    message: string;
    data: string;
    metadata: Record<string, never>;
}

export type UpdateMultipleCardsRequest = {
    id: number;
    frontCard: string;
    backCard: string;
    imageAssetId?: number;
    imageUrl?: string;
    cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
}

export type UpdateMultipleCardsResponse = {
    status: string;
    message: string;
    data: Array<{
        id: number;
        frontCard: string;
        backCard: string;
        imageUrl?: string;
        cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
    }>;
    metadata: Record<string, never>;
}

export type GenerateFlashcardsFromNoteRequest = {
    noteIds: number[];
}

export type GenerateFlashcardsFromNoteResponse = {
    status: string,
    message: string,
    data: {
        content: string
    }
}

export type GenerateFlashcardsFromFileRequest =  {
    files: File[];
}