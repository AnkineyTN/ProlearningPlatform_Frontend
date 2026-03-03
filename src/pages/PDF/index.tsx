"use client";
import { useState, useRef, useCallback, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Comment {
  id: string;
  rect: Rect;
  text: string;
  author: string;
  createdAt: string;
  pageNumber: number;
}

interface DragState {
  active: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);

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

// ─── usePdfJs hook ────────────────────────────────────────────────────────────

function usePdfJs() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ((window as any).pdfjsLib) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      setReady(true);
    };
    document.head.appendChild(script);
  }, []);

  return ready;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CommentPin({
  comment,
  isActive,
  onClick,
}: {
  comment: Comment;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <>
      <div
        onClick={onClick}
        className={`absolute rounded cursor-pointer transition-all z-10 border-2 ${
          isActive
            ? "border-amber-500 bg-amber-300/30"
            : "border-amber-400/60 bg-amber-200/15 hover:bg-amber-200/35"
        }`}
        style={{
          left: `${comment.rect.x}%`,
          top: `${comment.rect.y}%`,
          width: `${comment.rect.width}%`,
          height: `${comment.rect.height}%`,
        }}
      />
      <button
        onClick={onClick}
        className={`absolute z-20 w-6 h-6 rounded-full text-xs shadow-lg transition-transform hover:scale-110 flex items-center justify-center text-white ${
          isActive ? "bg-amber-500 scale-110" : "bg-amber-400"
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
  onClose,
  onDelete,
}: {
  comment: Comment;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div
      className='absolute z-30 w-60 bg-white rounded-2xl shadow-2xl border border-gray-100 p-3'
      style={{
        left: `calc(${comment.rect.x + comment.rect.width}% + 14px)`,
        top: `${comment.rect.y}%`,
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className='flex items-center gap-2 mb-2'>
        <div className='w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0'>
          {comment.author[0]}
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-xs font-semibold text-gray-800 truncate'>
            {comment.author}
          </p>
          <p className='text-[10px] text-gray-400'>
            {new Date(comment.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>
        <button
          onClick={onClose}
          className='text-gray-300 hover:text-gray-500 text-xl leading-none ml-1'
        >
          ×
        </button>
      </div>
      <p className='text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-2'>
        {comment.text}
      </p>
      <div className='flex justify-end mt-2'>
        <button
          onClick={() => onDelete(comment.id)}
          className='text-[11px] text-red-400 hover:text-red-600 transition-colors'
        >
          Xóa
        </button>
      </div>
    </div>
  );
}

function NewCommentBox({
  rect,
  onSave,
  onCancel,
}: {
  rect: Rect;
  onSave: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  return (
    <>
      <div
        className='absolute border-2 border-dashed border-blue-500 bg-blue-100/25 rounded z-10 pointer-events-none'
        style={{
          left: `${rect.x}%`,
          top: `${rect.y}%`,
          width: `${rect.width}%`,
          height: `${rect.height}%`,
        }}
      />
      <div
        className='absolute z-30 w-64 bg-white rounded-2xl shadow-2xl border border-blue-100 p-3'
        style={{
          left: `calc(${rect.x + rect.width}% + 14px)`,
          top: `${rect.y}%`,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <p className='text-xs font-semibold text-gray-600 mb-2'>Thêm comment</p>
        <textarea
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && text.trim())
              onSave(text);
            if (e.key === "Escape") onCancel();
          }}
          placeholder='Nhập comment... (Ctrl+Enter để lưu)'
          rows={3}
          className='w-full text-sm border border-gray-200 rounded-xl p-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400'
        />
        <div className='flex gap-2 mt-2 justify-end'>
          <button
            onClick={onCancel}
            className='text-xs px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500'
          >
            Hủy
          </button>
          <button
            disabled={!text.trim()}
            onClick={() => text.trim() && onSave(text)}
            className='text-xs px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-medium transition-colors'
          >
            Lưu
          </button>
        </div>
      </div>
    </>
  );
}

function UploadScreen({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (f: File) => {
    if (f.type === "application/pdf") onFile(f);
    else alert("Chỉ hỗ trợ file PDF!");
  };

  return (
    <div className='min-h-screen bg-[#0f1117] flex items-center justify-center'>
      <div className='text-center'>
        <div className='mb-8'>
          <div
            className='w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-3xl'
            style={{ background: "linear-gradient(135deg, #3b82f6, #6366f1)" }}
          >
            📄
          </div>
          <h1 className='text-white text-2xl font-bold tracking-tight'>
            PDF Annotator
          </h1>
          <p className='text-white/40 text-sm mt-1'>
            Upload PDF để bắt đầu comment theo vùng
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handle(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={`w-80 h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
            dragging
              ? "border-blue-400 bg-blue-500/10"
              : "border-white/15 hover:border-white/30 hover:bg-white/5"
          }`}
        >
          <div className='text-4xl mb-3'>{dragging ? "⬇️" : "📂"}</div>
          <p className='text-white/60 text-sm'>
            {dragging ? "Thả file vào đây" : "Kéo thả hoặc click để chọn"}
          </p>
          <p className='text-white/25 text-xs mt-1'>Chỉ hỗ trợ .pdf</p>
        </div>

        <input
          ref={inputRef}
          type='file'
          accept='application/pdf'
          className='hidden'
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handle(f);
          }}
        />
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PDFAnnotator() {
  const pdfReady = usePdfJs();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [pageNum, setPageNum] = useState(1);
  const [loading, setLoading] = useState(false);

  const [isAnnotating, setIsAnnotating] = useState(false);
  const [drag, setDrag] = useState<DragState>({
    active: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });
  const [pendingRect, setPendingRect] = useState<Rect | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const renderTaskRef = useRef<any>(null);

  // ── Load PDF
  useEffect(() => {
    if (!pdfFile || !pdfReady) return;
    setLoading(true);
    const url = URL.createObjectURL(pdfFile);
    (window as any).pdfjsLib.getDocument(url).promise.then((doc: any) => {
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setPageNum(1);
      setComments([]);
      setLoading(false);
    });
    return () => URL.revokeObjectURL(url);
  }, [pdfFile, pdfReady]);

  // ── Render page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    // Cancel previous render if still running
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
    }

    pdfDoc.getPage(pageNum).then((page: any) => {
      const scale = 1.5;
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const task = page.render({
        canvasContext: canvas.getContext("2d")!,
        viewport,
      });
      renderTaskRef.current = task;
      task.promise.catch(() => {}); // suppress cancel errors
    });
  }, [pdfDoc, pageNum]);

  // ── Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAnnotating(false);
        setPendingRect(null);
        setDrag({
          active: false,
          startX: 0,
          startY: 0,
          currentX: 0,
          currentY: 0,
        });
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  // ── Mouse handlers
  const onMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isAnnotating || !overlayRef.current) return;
      // Only start drag when clicking directly on the overlay itself,
      // not on any child element (popover, textarea, buttons, comment pins)
      if (e.target !== overlayRef.current) return;
      e.preventDefault();
      setPendingRect(null);
      setActiveId(null);
      const { x, y } = pct(e, overlayRef.current);
      setDrag({ active: true, startX: x, startY: y, currentX: x, currentY: y });
    },
    [isAnnotating],
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
    const c: Comment = {
      id: uid(),
      rect: pendingRect,
      text,
      author: "Trần Thảo Ngân",
      createdAt: new Date().toISOString(),
      pageNumber: pageNum,
    };
    setComments((prev) => [...prev, c]);
    setPendingRect(null);
    setIsAnnotating(false);

    // TODO: POST /api/comments → { document_id, page_number, rect, content }
    console.log("[API] POST /api/comments", c);
  };

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    setActiveId(null);
  };

  const dragRect = drag.active
    ? norm(drag.startX, drag.startY, drag.currentX, drag.currentY)
    : null;

  const pageComments = comments.filter((c) => c.pageNumber === pageNum);

  // ── No file yet → upload screen
  if (!pdfFile) return <UploadScreen onFile={setPdfFile} />;

  return (
    <div className='min-h-screen bg-[#0f1117] flex flex-col'>
      {/* ── Toolbar ── */}
      <div className='sticky top-0 z-50 bg-[#1a1d26]/95 backdrop-blur-md border-b border-white/5 px-5 py-2.5 flex items-center gap-3'>
        <button
          onClick={() => {
            setPdfFile(null);
            setPdfDoc(null);
          }}
          className='text-white/40 hover:text-white/70 text-sm transition-colors flex items-center gap-1'
        >
          ← Đổi file
        </button>

        <div className='w-px h-5 bg-white/10' />

        <span className='text-white/60 text-sm truncate max-w-[200px]'>
          {pdfFile.name}
        </span>

        <div className='flex-1' />

        {/* Page nav */}
        {totalPages > 1 && (
          <div className='flex items-center gap-2'>
            <button
              disabled={pageNum <= 1}
              onClick={() => {
                setPageNum((p) => p - 1);
                setActiveId(null);
                setPendingRect(null);
              }}
              className='w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-base transition-colors'
            >
              ‹
            </button>
            <span className='text-white/50 text-xs tabular-nums w-16 text-center'>
              {pageNum} / {totalPages}
            </span>
            <button
              disabled={pageNum >= totalPages}
              onClick={() => {
                setPageNum((p) => p + 1);
                setActiveId(null);
                setPendingRect(null);
              }}
              className='w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-base transition-colors'
            >
              ›
            </button>
          </div>
        )}

        <div className='w-px h-5 bg-white/10' />

        <button
          onClick={() => {
            setIsAnnotating((v) => !v);
            setPendingRect(null);
            setActiveId(null);
          }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-sm font-semibold transition-all select-none ${
            isAnnotating
              ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/20"
              : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
          }`}
        >
          <span>{isAnnotating ? "✏️" : "💬"}</span>
          {isAnnotating ? "Đang chọn..." : "Add Comment"}
        </button>

        {isAnnotating && (
          <span className='text-blue-400 text-xs animate-pulse hidden md:block'>
            Kéo để chọn vùng · ESC hủy
          </span>
        )}

        <div className='w-px h-5 bg-white/10' />

        <span className='text-white/30 text-xs whitespace-nowrap'>
          {pageComments.length} comment{pageComments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Content ── */}
      <div className='flex-1 overflow-auto py-8 flex justify-center'>
        {loading ? (
          <div className='flex items-center gap-3 text-white/40 mt-32'>
            <svg
              className='w-5 h-5 animate-spin'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              />
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8v8z'
              />
            </svg>
            Đang tải PDF...
          </div>
        ) : (
          <div className='relative shadow-2xl' style={{ userSelect: "none" }}>
            {/* PDF canvas */}
            <canvas ref={canvasRef} className='block rounded-lg' />

            {/* Interaction overlay */}
            <div
              ref={overlayRef}
              className={`absolute inset-0 rounded-lg ${
                isAnnotating ? "cursor-crosshair" : "cursor-default"
              }`}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
            >
              {/* Live drag rect */}
              {dragRect && dragRect.width > 0 && dragRect.height > 0 && (
                <div
                  className='absolute border-2 border-blue-400 bg-blue-300/20 rounded pointer-events-none'
                  style={{
                    left: `${dragRect.x}%`,
                    top: `${dragRect.y}%`,
                    width: `${dragRect.width}%`,
                    height: `${dragRect.height}%`,
                  }}
                />
              )}

              {/* Existing comment pins */}
              {pageComments.map((c) => (
                <CommentPin
                  key={c.id}
                  comment={c}
                  isActive={activeId === c.id}
                  onClick={() => {
                    if (isAnnotating) return;
                    setActiveId((id) => (id === c.id ? null : c.id));
                  }}
                />
              ))}

              {/* Active comment detail */}
              {activeId &&
                (() => {
                  const c = pageComments.find((c) => c.id === activeId);
                  return c ? (
                    <CommentPopover
                      comment={c}
                      onClose={() => setActiveId(null)}
                      onDelete={deleteComment}
                    />
                  ) : null;
                })()}

              {/* New comment input */}
              {pendingRect && (
                <NewCommentBox
                  rect={pendingRect}
                  onSave={saveComment}
                  onCancel={() => {
                    setPendingRect(null);
                    setIsAnnotating(false);
                  }}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
