export type CollabRole = 'OWNER' | 'EDITOR' | 'VIEWER';
export type MemberStatus = 'PENDING' | 'ACTIVE' | 'DECLINED';

export type CollabMember = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: CollabRole;
  status: MemberStatus;
};

export type UserSearchResult = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
};

export type InviteTarget =
  | { userId: number; email?: never }
  | { email: string; userId?: never };

export type InviteRequest = {
  targets: InviteTarget[];
  role: 'EDITOR' | 'VIEWER';
};

export type InviteResultItem = {
  userId: number | null;
  email: string | null;
  success: boolean;
  error: string | null;
};

export type InviteResponse = {
  status: string;
  message: string;
  data: InviteResultItem[];
  metadata: null;
};

export type MembersListResponse = {
  status: string;
  message: string;
  data: CollabMember[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  } | null;
};

export type UserSearchResponse = {
  status: string;
  message: string;
  data: UserSearchResult[];
  metadata: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  } | null;
};

export type PendingNoteInvite = {
  noteId: number;
  noteTitle: string;
  setId: number;
  role: CollabRole;
  invitedAt: string;
};

export type PendingFlashcardInvite = {
  flashcardId: number;
  flashcardTitle: string;
  setId: number;
  role: CollabRole;
  invitedAt: string;
};

export type PendingExamInvite = {
  examId: number;
  examTitle: string;
  setId: number;
  role: CollabRole;
  invitedAt: string;
};

export type PendingInvitesResponse<T> = {
  status: string;
  message: string;
  data: T[];
  metadata: null;
};

export type AcceptByTokenResponse = {
  status: string;
  message: string;
  data: {
    success: boolean;
    error: string | null;
    noteId: number | null;
    flashcardId?: number | null;
    examId?: number | null;
  };
  metadata: null;
};

export type CollabVoidResponse = {
  status: string;
  message: string;
  data: null;
  metadata: null;
};

export type SharedNote = {
  id: number;
  title: string;
  description: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  created_at: string;
  updated_at: string;
  setId: number;
  userRole: CollabRole;
};

export type SharedFlashcard = {
  id: string;
  title: string;
  description: string;
  status: 'COMPLETED' | 'NOT_COMPLETED';
  privacy: 'PUBLIC' | 'PRIVATE';
  lastStudy: string;
  known: number;
  learning: number;
  remain: number;
  createMethod: 'MANUAL' | 'AI' | 'REVIEW';
  numCards: number;
  createdAt: string;
  updatedAt: string;
  userRole: CollabRole;
  setId: number;
};

export type SharedExam = {
  id: number;
  title: string;
  privacy: 'PUBLIC' | 'PRIVATE';
  description: string;
  duration: number;
  numQuestions: number;
  creationMethod: 'MANUAL' | 'AI' | 'REVIEW';
  createdAt: string;
  updatedAt: string;
  userRole: CollabRole;
  setId: number;
};

export type SharedResourcesResponse<T> = {
  status: string;
  message: string;
  data: T[];
  metadata: Record<string, unknown>;
};
