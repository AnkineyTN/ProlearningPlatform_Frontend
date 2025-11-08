// service/types/flashcard.types.ts

export interface Flashcard {
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
    frontCard: string;
    backCard: string;
    imageUrl: string | null;
    imageAssetId: string | null;
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
    cards:  Card[];
}

export interface CreateFlashcardResponse {
    status: string;
    message: string;
    data: Flashcard;
    metadata: null;
}