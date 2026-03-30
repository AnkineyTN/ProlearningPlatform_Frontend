import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Values accepted by AI note/file APIs (explain, summarize, flashcards). */
export type AiApiLanguage = "English" | "Vietnamese";

export function mapI18nToAiApiLanguage(
  i18nLanguage: string | undefined,
): AiApiLanguage {
  const lang = (i18nLanguage ?? "en").toLowerCase();
  return lang.startsWith("vi") ? "Vietnamese" : "English";
}

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "bmp",
  "avif",
  "ico",
]);

/** Uses file extension (and optional MIME) — for note attachments and uploads. */
export function isImageExtension(ext: string): boolean {
  const e = ext.replace(/^\./, "").toLowerCase();
  return IMAGE_EXTENSIONS.has(e);
}

export function isBrowserImageFile(file: File): boolean {
  if (file.type?.startsWith("image/")) return true;
  const dot = file.name.lastIndexOf(".");
  const ext = dot >= 0 ? file.name.slice(dot + 1) : "";
  return isImageExtension(ext);
}

export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }
}
