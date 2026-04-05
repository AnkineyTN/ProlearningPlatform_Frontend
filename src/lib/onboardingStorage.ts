import type {
  OnboardingDraft,
  OnboardingSubmission,
} from "@/components/onboarding/type";

const DRAFT_KEY = "onboarding_draft_v1";
const SUBMISSIONS_KEY = "onboarding_submissions_v1";

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function loadOnboardingDraft(): OnboardingDraft | null {
  const parsed = safeParse<OnboardingDraft>(localStorage.getItem(DRAFT_KEY));
  if (!parsed?.data || typeof parsed.currentStep !== "number") return null;
  return parsed;
}

export function saveOnboardingDraft(draft: OnboardingDraft): void {
  localStorage.setItem(
    DRAFT_KEY,
    JSON.stringify({
      ...draft,
      updatedAt: new Date().toISOString(),
    }),
  );
}

export function clearOnboardingDraft(): void {
  localStorage.removeItem(DRAFT_KEY);
}

export function loadOnboardingSubmissions(): OnboardingSubmission[] {
  const parsed = safeParse<OnboardingSubmission[]>(
    localStorage.getItem(SUBMISSIONS_KEY),
  );
  return Array.isArray(parsed) ? parsed : [];
}

export function appendOnboardingSubmission(
  submission: Omit<OnboardingSubmission, "id" | "submittedAt"> & {
    id?: string;
    submittedAt?: string;
  },
): OnboardingSubmission {
  const list = loadOnboardingSubmissions();
  const full: OnboardingSubmission = {
    id: submission.id ?? crypto.randomUUID(),
    submittedAt: submission.submittedAt ?? new Date().toISOString(),
    userId: submission.userId,
    email: submission.email,
    displayName: submission.displayName,
    data: submission.data,
    completedVia: submission.completedVia,
  };
  list.unshift(full);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
  return full;
}

export function clearOnboardingSubmissions(): void {
  localStorage.removeItem(SUBMISSIONS_KEY);
}

const MOCK_NOW = "2026-03-15T10:00:00.000Z";

export function seedMockOnboardingSubmissions(): void {
  const existing = loadOnboardingSubmissions();
  if (existing.length > 0) return;

  const samples: OnboardingSubmission[] = [
    {
      id: "mock-1",
      submittedAt: MOCK_NOW,
      userId: null,
      email: "demo.user@example.com",
      displayName: "Nguyễn Demo",
      completedVia: "complete",
      data: {
        language: "vi",
        education: "College",
        source: "YouTube",
        premium: false,
        studySet: {
          name: "Ôn IELTS Reading",
          description: "Tài liệu luyện đề",
          privacy: "private",
        },
      },
    },
    {
      id: "mock-2",
      submittedAt: "2026-03-14T08:30:00.000Z",
      userId: null,
      email: "teacher@example.com",
      displayName: "Trần Giáo Viên",
      completedVia: "skip",
      data: {
        language: "en",
        education: "Grad School",
        source: "Google",
        premium: true,
        studySet: {
          name: "",
          description: "",
          privacy: "public",
        },
      },
    },
  ];

  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(samples));
}
