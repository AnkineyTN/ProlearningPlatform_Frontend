/* eslint-disable react-refresh/only-export-components */
import { AlertTriangle, ExternalLink, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export interface FileViewerProps {
  fileUrl: string;
  renderPageOverlay: (pageNumber: number) => ReactNode;
}

const TXT_EXTS = new Set(['txt', 'log', 'md', 'markdown', 'csv', 'json']);

export function isTxtExtension(ext: string) {
  return TXT_EXTS.has(ext.toLowerCase());
}

export function isDocxExtension(ext: string) {
  return ext.toLowerCase() === 'docx';
}

export function isPptxExtension(ext: string) {
  return ext.toLowerCase() === 'pptx';
}

export function ViewerLoading({ label }: { label: string }) {
  return (
    <div className='flex items-center justify-center gap-2 py-12 text-[var(--pl-text-muted)]'>
      <LoaderCircle className='w-5 h-5 animate-spin' />
      <span className='text-xs'>{label}</span>
    </div>
  );
}

export function ViewerError({
  message,
  fileUrl,
}: {
  message: string;
  fileUrl: string;
}) {
  return (
    <div className='rounded-md border border-[var(--border-error)] bg-[var(--bg-error)] p-3 flex flex-col gap-2'>
      <div className='flex items-start gap-2 text-[var(--text-error)]'>
        <AlertTriangle className='w-4 h-4 shrink-0 mt-0.5' />
        <div className='text-xs leading-relaxed'>
          <p className='font-medium'>Could not load preview</p>
          <p className='text-[var(--pl-text-muted)] mt-0.5 break-words'>
            {message}
          </p>
        </div>
      </div>
      <a
        href={fileUrl}
        target='_blank'
        rel='noopener noreferrer'
        className='inline-flex items-center justify-center gap-1.5 text-xs font-medium text-[var(--pl-accent)] hover:underline'
      >
        <ExternalLink className='w-3.5 h-3.5' />
        Open file in new tab
      </a>
    </div>
  );
}

export function PortalInto({
  target,
  children,
}: {
  target: HTMLElement;
  children: ReactNode;
}) {
  return createPortal(children, target);
}

/**
 * Returns a CSS `zoom` value that scales rendered content so the first
 * page/slide's natural width fits the wrapper. Re-fits on resize.
 *
 * Measurement uses `getComputedStyle(first).width` rather than `offsetWidth`
 * because the latter is scaled by any ancestor `zoom`, which creates a
 * chicken-and-egg problem after the first fit. Computed width is the layout
 * width (in px, resolved from pt/inches), unaffected by ancestor zoom.
 *
 * Caps at 1 (no upscaling — keeps content crisp).
 */
export function useFitToContainerWidth(
  wrapRef: React.RefObject<HTMLDivElement | null>,
  pages: HTMLElement[],
) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const wrap = wrapRef.current;
    const first = pages[0];
    if (!wrap || !first) return;

    let lastWidth = 0;
    const recalc = () => {
      const natural = parseFloat(getComputedStyle(first).width);
      if (!natural || Number.isNaN(natural)) return;
      const available = wrap.clientWidth;
      if (!available) return;
      // Dedup width-only changes so our own zoom updates (which alter height
      // and therefore re-fire ResizeObserver) don't loop.
      if (available === lastWidth) return;
      lastWidth = available;
      const next = Math.min(1, available / natural);
      setZoom((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };

    const frame = requestAnimationFrame(recalc);
    const ro = new ResizeObserver(recalc);
    ro.observe(wrap);

    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [pages, wrapRef]);

  return zoom;
}
