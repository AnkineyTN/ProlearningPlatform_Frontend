export type StudyMode = 'SPACED_REPETITION';
export type CardStatus = 'NEW' | 'LEARNING' | 'KNOWN';
export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface SessionCard {
    id: number;
    frontCard: string;
    backCard: string;
    imageUrl: string | null;
    cardStatus: CardStatus;
    nextReviewAt: string;
}

export interface StudySession {
    id: number;
    studyMode: StudyMode;
    message: string;
    cards: SessionCard[];
}

export interface SessionProgress {
    id: number;
    status: SessionStatus;
    studyMode: StudyMode;
    totalCards: number;
    completedCount: number;
    remainingCount: number;
    progressPercent: number;
}

export interface CardReview {
    cardId: number;
    known: boolean;
}

export type ReviewLog = {
    cardId: number;
    known: boolean;
    reviewedAt: string;
}

export interface SessionResult {
    sessionId: number;
    correctCount: number;
    incorrectCount: number;
    finishedAt: string;
    logs: ReviewLog[];
}

// Request Types
export interface StartSessionRequest {
    status?: string;
    message?: string;
}

export interface SyncProgressRequest {
    cardItemReviews: CardReview[];
}

// Response Types
export interface StartSessionResponse {
    status: string;
    message: string;
    data: StudySession;
    metadata: null;
}

export interface SessionStatusResponse {
    status: string;
    message: string;
    data: SessionProgress[];
    metadata: null;
}

export interface SyncProgressResponse {
    status: string;
    message: string;
    data: SessionProgress;
    metadata: null;
}

export interface SessionResultResponse {
    status: string;
    message: string;
    data: SessionResult;
    metadata: null;
}

export interface CancelSessionResponse {
    status: string;
    message: string;
    data: null;
    metadata: null;
}