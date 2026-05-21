import { useEffect, useRef, useState } from 'react';

import {
  PortalInto,
  useFitToContainerWidth,
  ViewerError,
  ViewerLoading,
  type FileViewerProps,
} from '@/pages/NotePage/components/viewerCommon';

export function PptxViewer({ fileUrl, renderPageOverlay }: FileViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [slides, setSlides] = useState<HTMLElement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const zoom = useFitToContainerWidth(wrapRef, slides);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSlides([]);

    (async () => {
      try {
        const [pptxModule, fileRes] = await Promise.all([
          import('pptx-preview'),
          fetch(fileUrl),
        ]);
        if (!fileRes.ok) throw new Error(`HTTP ${fileRes.status}`);
        const buf = await fileRes.arrayBuffer();
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = '';

        const mod = pptxModule as unknown as {
          init?: (
            el: HTMLElement,
            opts?: unknown,
          ) => {
            preview: (data: ArrayBuffer) => Promise<void>;
          };
          default?: {
            init?: (
              el: HTMLElement,
              opts?: unknown,
            ) => {
              preview: (data: ArrayBuffer) => Promise<void>;
            };
          };
        };
        const init = mod.init ?? mod.default?.init;
        if (!init) throw new Error('pptx-preview: init() not found in module');

        const previewer = init(ref.current, { width: 720, height: 540 });
        await previewer.preview(buf);
        if (cancelled || !ref.current) return;

        // pptx-preview wraps each slide in a child div under the container.
        const slideEls = Array.from(
          ref.current.querySelectorAll<HTMLElement>(
            '.pptx-preview-wrapper > div, .slide, [data-slide-num]',
          ),
        );
        const unique = slideEls.length
          ? slideEls
          : (Array.from(ref.current.children) as HTMLElement[]).flatMap(
              (child) =>
                child.children.length
                  ? (Array.from(child.children) as HTMLElement[])
                  : [child],
            );
        unique.forEach((s) => {
          s.style.position = 'relative';
        });
        setSlides(unique);
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : 'Failed to render presentation',
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  return (
    <div ref={wrapRef} className='relative w-full overflow-hidden'>
      {loading && <ViewerLoading label='Rendering slides…' />}
      {error && <ViewerError message={error} fileUrl={fileUrl} />}
      <div
        ref={ref}
        className='pptx-viewer flex flex-col items-center gap-4 py-3'
        style={{ zoom }}
      />
      {slides.map((el, i) => (
        <PortalInto key={i} target={el}>
          {renderPageOverlay(i + 1)}
        </PortalInto>
      ))}
    </div>
  );
}
