/* eslint-disable react-refresh/only-export-components */
import { useCallback, useEffect, useRef, useState } from 'react';

import { CommentPin } from '@/pages/NotePage/components/FilePanel/CommentPin';
import { CommentPopover } from '@/pages/NotePage/components/FilePanel/CommentPopover';
import { NewCommentBox } from '@/pages/NotePage/components/FilePanel/NewCommentBox';
import {
  norm,
  pct,
  type DragState,
  type Rect,
  type RegionComment,
  type RegionCommentSavePayload,
} from '@/pages/NotePage/components/FilePanel/regionCommentUtils';

export {
  buildRegionCommentPayload,
  fileRegionCommentDtoToRegion,
  uid,
} from '@/pages/NotePage/components/FilePanel/regionCommentUtils';
export type {
  NoteAttachedFile,
  NoteFileRegionCommentPayload,
  RegionComment,
  RegionCommentSavePayload,
} from '@/pages/NotePage/components/FilePanel/regionCommentUtils';

interface RegionCommentOverlayProps {
  drawEnabled: boolean;
  pageNumber: number;
  comments: RegionComment[];
  onSaveComment: (rect: Rect, payload: RegionCommentSavePayload) => void;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onDeleteComment: (id: string) => void;
}

export function RegionCommentOverlay({
  drawEnabled,
  pageNumber,
  comments,
  onSaveComment,
  activeId,
  setActiveId,
  onDeleteComment,
}: RegionCommentOverlayProps) {
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

  const saveComment = (payload: RegionCommentSavePayload) => {
    if (!pendingRect) return;
    onSaveComment(pendingRect, payload);
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
        drawEnabled ? 'cursor-crosshair' : 'pointer-events-none'
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
