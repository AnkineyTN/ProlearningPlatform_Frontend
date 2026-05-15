export type AdminApiEnvelope<T> = {
  status: string;
  message: string;
  data: T;
  metadata?: Record<string, unknown>;
};

/** User row as returned inside admin directory `user` field. */
export type AdminDirectoryUser = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  language: string | null;
  education: string | null;
  hearAppFrom: string | null;
  accountType: string | null;
  avatarUrl: string | null;
  isBlocked: boolean;
  blockReason: string | null;
};

export type AdminOnboardingSnapshot = {
  language: string;
  education: string;
  hearAppFrom: string;
  accountType: string | null;
} | null;

export type AdminUserDirectoryRow = {
  user: AdminDirectoryUser;
  onboarding: AdminOnboardingSnapshot;
  onboardingSubmittedAt: string | null;
};

export type AdminUpdateUserRequest = Partial<{
  firstName: string;
  lastName: string;
  accountType: string;
}>;

export type AdminBlockUserRequest = {
  reason: string;
};

export type AdminUserStats = {
  noteCount: number;
  flashcardCount: number;
  examCount: number;
  pomodoroSessionCount: number;
  registeredAt: string | null;
};

export type AdminPlatformStats = {
  totalUsers: number;
  blockedUsers: number;
  proUsers: number;
  freeUsers: number;
  totalNotes: number;
  totalFlashcards: number;
  totalExams: number;
  totalPomodoroSessions: number;
  totalStudySessions: number;
};
