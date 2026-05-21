import { useEffect, useRef, useState } from 'react';

import {
  PortalInto,
  ViewerError,
  ViewerLoading,
  type FileViewerProps,
} from '@/pages/NotePage/components/viewerCommon';

export function DocxViewer({ fileUrl, renderPageOverlay }: FileViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<HTMLElement[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setPages([]);

    (async () => {
      try {
        const [{ renderAsync }, fileRes] = await Promise.all([
          import('docx-preview'),
          fetch(fileUrl),
        ]);
        if (!fileRes.ok) throw new Error(`HTTP ${fileRes.status}`);
        const blob = await fileRes.blob();
        if (cancelled || !ref.current) return;
        ref.current.innerHTML = '';
        await renderAsync(blob, ref.current, undefined, {
          className: 'docx-preview',
          inWrapper: true,
          // Drop the fixed page width/height that docx-preview reads from the
          // file so sections reflow with the container instead of staying at
          // their original ~A4/Letter size regardless of panel width.
          ignoreWidth: true,
          ignoreHeight: true,
        });
        if (cancelled || !ref.current) return;

        // Force the wrapper + sections to fill their container. With
        // ignoreWidth=true docx-preview drops `width` from sections but the
        // injected stylesheet can still pin `.docx-wrapper` and section
        // padding to inches — clamp here so they shrink with the panel.
        const wrapper = ref.current.querySelector<HTMLElement>('.docx-wrapper');
        if (wrapper) {
          wrapper.style.width = '100%';
          wrapper.style.maxWidth = '100%';
          wrapper.style.minWidth = '0';
          wrapper.style.padding = '12px';
          wrapper.style.boxSizing = 'border-box';
        }

        const sections = Array.from(
          ref.current.querySelectorAll<HTMLElement>('section.docx'),
        );
        sections.forEach((s) => {
          s.style.position = 'relative';
          s.style.width = '100%';
          s.style.maxWidth = '100%';
          s.style.minWidth = '0';
          s.style.boxSizing = 'border-box';
        });
        setPages(sections);
      } catch (e) {
        if (!cancelled)
          setError(
            e instanceof Error ? e.message : 'Failed to render document',
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
    <div className='relative w-full'>
      {loading && <ViewerLoading label='Rendering document…' />}
      {error && <ViewerError message={error} fileUrl={fileUrl} />}
      <div ref={ref} className='docx-viewer w-full' />
      {pages.map((el, i) => (
        <PortalInto key={i} target={el}>
          {renderPageOverlay(i + 1)}
        </PortalInto>
      ))}
    </div>
  );
}
