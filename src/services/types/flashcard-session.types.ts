export type StudyMode = 'SPACED_REPETITION';
export type CardStatus = 'NEW' | 'LEARNING' | 'KNOWN';
export type SessionStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type SessionCard = {
    id: number;
    frontCard: string;
    backCard: string;
    imageUrl?: string | null;
    cardStatus: CardStatus;
    nextReviewAt: string;
}

export type StudySession = {
    id: number;
    studyMode: StudyMode;
    message: string;
    cards: SessionCard[];
}

export type SessionProgress = {
    id: number;
    status: SessionStatus;
    studyMode: StudyMode;
    totalCards: number;
    completedCount: number;
    remainingCount: number;
    progressPercent: number;
}

export type CardReview = {
    cardId: number;
    known: boolean;
}

export type ReviewLog = {
    cardId: number;
    known: boolean;
    reviewedAt: string;
}

export type SessionResult = {
    sessionId: number;
    correctCount: number;
    incorrectCount: number;
    finishedAt: string;
    logs: ReviewLog[];
}

// Request Types
export type StartSessionRequest = {
    status?: string;
    message?: string;
}

export type SyncProgressRequest = {
    cardItemReviews: CardReview[];
}

// Response Types
export type StartSessionResponse = {
    status: string;
    message: string;
    data: StudySession;
    metadata: null;
}

export type SessionStatusResponse = {
    status: string;
    message: string;
    data: SessionProgress[];
    metadata: null;
}

export type SyncProgressResponse = {
    status: string;
    message: string;
    data: SessionProgress;
    metadata: null;
}

export type SessionResultResponse = {
    status: string;
    message: string;
    data: SessionResult;
    metadata: null;
}

export type CancelSessionResponse = {
    status: string;
    message: string;
    data: null;
    metadata: null;
}