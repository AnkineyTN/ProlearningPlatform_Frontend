export interface Flashcard {
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

export interface FlashcardMetadata {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
}

export interface FlashcardResponse {
    status: string;
    message: string;
    data: Flashcard[];
    metadata: FlashcardMetadata;
}

export interface GetFlashcardsParams {
    setId: number;
    page: number;
    size: number;
    sort?: string;
}

export interface Card {
    id: number;
    frontCard: string;
    backCard: string;
    imageUrl?: string;
    imageAssetId?: number;
    cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
}

export interface FlashcardDetail {
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

export interface FlashcardDetailResponse {
    status: string;
    message: string;
    data: FlashcardDetail;
    metadata: null;
}

export interface CreateFlashcardManualRequest {
    title: string;
    description: string;
    privacy: 'PUBLIC' | 'PRIVATE';
    cards: Card[];
}

export interface CreateFlashcardResponse {
    status: string;
    message: string;
    data: Flashcard;
    metadata: null;
}

export interface UpdateFlashcardRequest {
    title: string;
    description: string;
    privacy: 'PUBLIC' | 'PRIVATE';
}

export interface UpdateFlashcardResponse {
    status: string;
    message: string;
    data: Flashcard & {
        numCards: number;
        createdAt: string;
        updatedAt: string;
    };
    metadata: Record<string, never>;
}

export interface DeleteFlashcardResponse {
    status: string;
    message: string;
    data: null;
    metadata: Record<string, never>;
}

export interface DeleteFlashcardRequest {
    setId: number;
    flashcardId: number;
}

export interface UpdateCardRequest {
    id: number;
    frontCard: string;
    backCard: string;
    imageAssetId?: number;
    cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
}

export interface UpdateCardResponse {
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

export interface DeleteCardResponse {
    status: string;
    message: string;
    data: null;
    metadata: Record<string, never>;
}

export interface AddCardsRequest {
    frontCard: string;
    backCard: string;
    imageAssetId?: number;
    imageUrl?: string;
}

export interface AddCardsResponse {
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

export interface DeleteMultipleCardsRequest {
    cardIds: number[];
}

export interface DeleteMultipleCardsResponse {
    status: string;
    message: string;
    data: string;
    metadata: Record<string, never>;
}

export interface UpdateMultipleCardsRequest {
    id: number;
    frontCard: string;
    backCard: string;
    imageAssetId?: number;
    imageUrl?: string;
    cardStatus?: 'NEW' | 'LEARNING' | 'KNOWN';
}

export interface UpdateMultipleCardsResponse {
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

export interface GenerateFlashcardsFromNoteRequest {
    noteIds: number[];
}

export interface GenerateFlashcardsFromNoteResponse {
    status: string,
    message: string,
    data: {
        content: string
    }
}

export interface GenerateFlashcardsFromFileRequest {
    files: File[];
}