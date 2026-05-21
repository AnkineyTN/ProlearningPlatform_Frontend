import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';

export interface NoteFileRegionCommentPayload {
  noteId: number;
  noteAssetId: number;
  publicId: string;
  extension: string;
  kind: 'doc' | 'image';
  fileUrl: string;
  fileName: string;
  /** 1-based; images always use `1`. */
  pageNumber: number;
  /** Selection in percent of the page/image box (0–100). */
  rectPercent: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  content: string;
  clientCommentId: string;
  createdAtIso: string;
}

export interface NoteAttachedFile {
  id: number;
  fileName: string;
  fileUrl: string;
  extension: string;
  publicId: string;
  kind?: 'doc' | 'image';
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RegionComment {
  id: string;
  pageNumber: number;
  rect: Rect;
  text: string;
  createdAt: string;
  /** Inline image (screenshot) URL from API. */
  imageUrl?: string;
  attachmentAssetId?: number;
}

/** Payload when saving a new region comment (text and/or pasted/uploaded image). */
export interface RegionCommentSavePayload {
  text: string;
  attachmentAssetId?: number;
  imageUrl?: string;
}

export interface DragState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export function pct(e: React.MouseEvent | MouseEvent, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
    y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
  };
}

export function norm(x1: number, y1: number, x2: number, y2: number): Rect {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

const COMMENT_FLOAT_W = 288;
const COMMENT_FLOAT_H = 240;
export const NOTE_FILE_SCROLL_SEL = '[data-note-file-scroll]';

function getClampedFloatingPanelPosition(overlayEl: HTMLElement, rect: Rect) {
  const r = overlayEl.getBoundingClientRect();
  const selLeft = r.left + (rect.x / 100) * r.width;
  const selRight = r.left + ((rect.x + rect.width) / 100) * r.width;
  const selTop = r.top + (rect.y / 100) * r.height;
  const gap = 14;
  let left = selRight + gap;
  if (left + COMMENT_FLOAT_W > window.innerWidth - 12) {
    left = selLeft - gap - COMMENT_FLOAT_W;
  }
  const m = 12;
  left = Math.max(m, Math.min(left, window.innerWidth - COMMENT_FLOAT_W - m));
  let top = selTop;
  top = Math.max(m, Math.min(top, window.innerHeight - COMMENT_FLOAT_H - m));
  return { left, top };
}

export function useFloatingCommentPosition(
  overlayRef: React.RefObject<HTMLDivElement | null>,
  rect: Rect | null,
  active: boolean,
) {
  const [pos, setPos] = useState({ left: 0, top: 0 });

  const update = useCallback(() => {
    if (!active || !rect || !overlayRef.current) return;
    setPos(getClampedFloatingPanelPosition(overlayRef.current, rect));
  }, [active, rect, overlayRef]);

  useLayoutEffect(() => {
    update();
  }, [update]);

  useEffect(() => {
    if (!active || !rect) return;
    const scrollRoot = overlayRef.current?.closest(NOTE_FILE_SCROLL_SEL);
    const onReposition = () => {
      requestAnimationFrame(update);
    };
    scrollRoot?.addEventListener('scroll', onReposition, { passive: true });
    window.addEventListener('resize', onReposition);
    return () => {
      scrollRoot?.removeEventListener('scroll', onReposition);
      window.removeEventListener('resize', onReposition);
    };
  }, [active, rect, overlayRef, update]);

  return pos;
}

export function buildRegionCommentPayload(
  noteId: number,
  file: NoteAttachedFile,
  kind: 'doc' | 'image',
  c: RegionComment,
): NoteFileRegionCommentPayload {
  return {
    noteId,
    noteAssetId: file.id,
    publicId: file.publicId,
    extension: file.extension,
    kind,
    fileUrl: file.fileUrl,
    fileName: file.fileName,
    pageNumber: c.pageNumber,
    rectPercent: { ...c.rect },
    content: c.text,
    clientCommentId: c.id,
    createdAtIso: c.createdAt,
  };
}

/** Maps persisted API DTO to overlay state (server id as string). */
export function fileRegionCommentDtoToRegion(d: {
  id: number;
  pageNumber: number;
  rectPercent: { x: number; y: number; width: number; height: number };
  content: string;
  createdAt: string | null;
  attachmentAssetId?: number | null;
  attachmentImageUrl?: string | null;
}): RegionComment {
  return {
    id: String(d.id),
    pageNumber: d.pageNumber,
    rect: { ...d.rectPercent },
    text: d.content ?? '',
    createdAt: d.createdAt ?? new Date().toISOString(),
    imageUrl: d.attachmentImageUrl ?? undefined,
    attachmentAssetId: d.attachmentAssetId ?? undefined,
  };
}
