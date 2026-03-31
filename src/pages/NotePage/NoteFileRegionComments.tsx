import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

export interface NoteFileRegionCommentPayload {
  noteId: number;
  noteAssetId: number;
  publicId: string;
  extension: string;
  kind: "doc" | "image";
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
  kind?: "doc" | "image";
}

interface Rect {
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
}

interface DragState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

function pct(e: React.MouseEvent | MouseEvent, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return {
    x: Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100)),
    y: Math.max(0, Math.min(100, ((e.clientY - r.top) / r.height) * 100)),
  };
}

function norm(x1: number, y1: number, x2: number, y2: number): Rect {
  return {
    x: Math.min(x1, x2),
    y: Math.min(y1, y2),
    width: Math.abs(x2 - x1),
    height: Math.abs(y2 - y1),
  };
}

const COMMENT_FLOAT_W = 288;
const COMMENT_FLOAT_H = 240;
const NOTE_FILE_SCROLL_SEL = "[data-note-file-scroll]";

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

function useFloatingCommentPosition(
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
    scrollRoot?.addEventListener("scroll", onReposition, { passive: true });
    window.addEventListener("resize", onReposition);
    return () => {
      scrollRoot?.removeEventListener("scroll", onReposition);
      window.removeEventListener("resize", onReposition);
    };
  }, [active, rect, overlayRef, update]);

  return pos;
}

export function buildRegionCommentPayload(
  noteId: number,
  file: NoteAttachedFile,
  kind: "doc" | "image",
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

function CommentPin({
  comment,
  isActive,
  onClick,
}: {
  comment: RegionComment;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <>
      <div
        role='button'
        tabIndex={0}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={`absolute rounded cursor-pointer transition-all z-10 border-2 pointer-events-auto ${
          isActive
            ? "border-amber-500 bg-amber-300/30"
            : "border-amber-400/60 bg-amber-200/25 hover:bg-amber-200/40"
        }`}
        style={{
          left: `${comment.rect.x}%`,
          top: `${comment.rect.y}%`,
          width: `${comment.rect.width}%`,
          height: `${comment.rect.height}%`,
        }}
      />
      <button
        type='button'
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        className={`absolute z-20 w-6 h-6 rounded-full text-xs shadow-md transition-transform hover:scale-110 flex items-center justify-center text-white pointer-events-auto ${
          isActive ? "bg-amber-500 scale-110" : "bg-amber-500/85"
        }`}
        style={{
          left: `calc(${comment.rect.x + comment.rect.width}% + 4px)`,
          top: `${comment.rect.y}%`,
        }}
      >
        💬
      </button>
    </>
  );
}

function CommentPopover({
  comment,
  overlayRef,
  onClose,
  onDelete,
}: {
  comment: RegionComment;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const pos = useFloatingCommentPosition(overlayRef, comment.rect, true);
  return createPortal(
    <div
      className='w-64 rounded-lg shadow-lg border bg-popover text-popover-foreground p-3'
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        zIndex: 9999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className='flex items-center justify-between gap-2 mb-2'>
        <p className='text-[10px] text-muted-foreground'>
          {new Date(comment.createdAt).toLocaleString()}
        </p>
        <button
          type='button'
          onClick={onClose}
          className='text-muted-foreground hover:text-foreground text-lg leading-none'
        >
          ×
        </button>
      </div>
      <p className='text-sm bg-muted/50 rounded-md px-3 py-2'>{comment.text}</p>
      <div className='flex justify-end mt-2'>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          className='text-destructive hover:text-destructive h-8 text-xs'
          onClick={() => onDelete(comment.id)}
        >
          Remove
        </Button>
      </div>
    </div>,
    document.body,
  );
}

function NewCommentBox({
  rect,
  overlayRef,
  onSave,
  onCancel,
}: {
  rect: Rect;
  overlayRef: React.RefObject<HTMLDivElement | null>;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const pos = useFloatingCommentPosition(overlayRef, rect, true);
  return createPortal(
    <div
      className='w-64 rounded-lg shadow-lg border bg-popover text-popover-foreground p-3'
      style={{
        position: "fixed",
        left: pos.left,
        top: pos.top,
        zIndex: 9999,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <p className='text-xs font-medium text-muted-foreground mb-2'>New comment</p>
      <textarea
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && text.trim()) onSave(text);
          if (e.key === "Escape") onCancel();
        }}
        placeholder='Comment… (Ctrl+Enter to save)'
        rows={3}
        className='w-full text-sm border rounded-md p-2 resize-none bg-background focus:outline-none focus:ring-2 focus:ring-ring'
      />
      <div className='flex gap-2 mt-2 justify-end'>
        <Button type='button' variant='outline' size='sm' onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type='button'
          size='sm'
          disabled={!text.trim()}
          onClick={() => text.trim() && onSave(text)}
        >
          Save
        </Button>
      </div>
    </div>,
    document.body,
  );
}

export function RegionCommentOverlay({
  drawEnabled,
  pageNumber,
  comments,
  onSaveComment,
  activeId,
  setActiveId,
  onDeleteComment,
}: {
  drawEnabled: boolean;
  pageNumber: number;
  comments: RegionComment[];
  onSaveComment: (rect: Rect, text: string) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onDeleteComment: (id: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  const [pendingRect, setPendingRect] = useState<Rect | null>(null);

  const pageComments = comments.filter((c) => c.pageNumber === pageNumber);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!drawEnabled || !overlayRef.current) return;
      if (e.target !== overlayRef.current) return;
      e.preventDefault();
      setPendingRect(null);
      setActiveId(null);
      const { x, y } = pct(e, overlayRef.current);
      setDrag({ active: true, startX: x, startY: y, currentX: x, currentY: y });
    },
    [drawEnabled, setActiveId],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!drag.active || !overlayRef.current) return;
      const { x, y } = pct(e, overlayRef.current);
      setDrag((d) => ({ ...d, currentX: x, currentY: y }));
    },
    [drag.active],
  );

  const onMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!drag.active || !overlayRef.current) return;
      const { x, y } = pct(e, overlayRef.current);
      const rect = norm(drag.startX, drag.startY, x, y);
      if (rect.width > 1 && rect.height > 0.5) setPendingRect(rect);
      setDrag({
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      });
    },
    [drag],
  );

  const saveComment = (text: string) => {
    if (!pendingRect) return;
    onSaveComment(pendingRect, text);
    setPendingRect(null);
  };

  const dragRect = drag.active
    ? norm(drag.startX, drag.startY, drag.currentX, drag.currentY)
    : null;

  useEffect(() => {
    if (!drawEnabled) {
      setPendingRect(null);
      setDrag({
        active: false,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      });
    }
  }, [drawEnabled]);

  const showLayer = drawEnabled || pageComments.length > 0;
  if (!showLayer) return null;

  return (
    <div
      ref={overlayRef}
      className={`absolute inset-0 z-[15] rounded-sm select-none ${
        drawEnabled ? "cursor-crosshair" : "pointer-events-none"
      }`}
      onMouseDown={drawEnabled ? onMouseDown : undefined}
      onMouseMove={drawEnabled ? onMouseMove : undefined}
      onMouseUp={drawEnabled ? onMouseUp : undefined}
    >
      {dragRect && dragRect.width > 0 && dragRect.height > 0 && (
        <div
          className='absolute border-2 border-primary bg-primary/15 rounded pointer-events-none'
          style={{
            left: `${dragRect.x}%`,
            top: `${dragRect.y}%`,
            width: `${dragRect.width}%`,
            height: `${dragRect.height}%`,
          }}
        />
      )}
      {pageComments.map((c) => (
        <CommentPin
          key={c.id}
          comment={c}
          isActive={activeId === c.id}
          onClick={() => setActiveId(activeId === c.id ? null : c.id)}
        />
      ))}
      {pendingRect && (
        <div
          className='absolute border-2 border-dashed border-primary bg-primary/10 rounded z-10 pointer-events-none'
          style={{
            left: `${pendingRect.x}%`,
            top: `${pendingRect.y}%`,
            width: `${pendingRect.width}%`,
            height: `${pendingRect.height}%`,
          }}
        />
      )}
      {activeId &&
        (() => {
          const c = pageComments.find((x) => x.id === activeId);
          return c ? (
            <CommentPopover
              comment={c}
              overlayRef={overlayRef}
              onClose={() => setActiveId(null)}
              onDelete={onDeleteComment}
            />
          ) : null;
        })()}
      {pendingRect && (
        <NewCommentBox
          rect={pendingRect}
          overlayRef={overlayRef}
          onSave={saveComment}
          onCancel={() => setPendingRect(null)}
        />
      )}
    </div>
  );
}
