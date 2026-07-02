import type { OnboardingData } from "@/components/onboarding/type";
import type { OnboardingSubmissionPayload } from "@/services/types/onboarding.types";

const EDUCATION_UI_TO_API: Record<string, string> = {
  "High School": "HIGH_SCHOOL",
  College: "COLLEGE",
  "Grad School": "GRAD_SCHOOL",
  "Med School": "MED_SCHOOL",
  Other: "OTHER",
};

const SOURCE_UI_TO_API: Record<string, string> = {
  YouTube: "YOUTUBE",
  TikTok: "OTHER",
  ChatGPT: "CHATGPT",
  Facebook: "FACEBOOK",
  Google: "GOOGLE",
  Instagram: "OTHER",
  Classmate: "CLASSMATE",
  Reddit: "REDDIT",
  Other: "OTHER",
};

export function mapOnboardingDataToSubmissionPayload(
  data: OnboardingData,
): OnboardingSubmissionPayload {
  const lang = data.language?.toLowerCase() === "vi" ? "VI" : "EN";
  const education =
    EDUCATION_UI_TO_API[data.education] ?? "OTHER";
  const hearAppFrom =
    SOURCE_UI_TO_API[data.source] ?? "OTHER";
  // Onboarding never grants PRO directly — upgrading to PRO goes through the
  // real payment flow at /upgrade. Always submit FREE here.
  return {
    language: lang,
    education,
    hearAppFrom,
    accountType: "FREE",
  };
}
