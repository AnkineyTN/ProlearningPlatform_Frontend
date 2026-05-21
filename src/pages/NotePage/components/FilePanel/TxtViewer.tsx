import { useEffect, useState } from 'react';

import {
  ViewerError,
  ViewerLoading,
  type FileViewerProps,
} from '@/pages/NotePage/components/viewerCommon';

export function TxtViewer({ fileUrl, renderPageOverlay }: FileViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    setError(null);
    (async () => {
      try {
        const res = await fetch(fileUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!cancelled) setContent(text);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : 'Failed to load text');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  if (error) return <ViewerError message={error} fileUrl={fileUrl} />;
  if (content === null) return <ViewerLoading label='Loading text…' />;

  return (
    <div className='relative bg-[var(--pl-bg)] border border-border rounded-md px-4 py-3 font-[family-name:var(--font-mono-pl)] text-sm leading-relaxed whitespace-pre-wrap break-words text-[var(--pl-text)]'>
      {content || <span className='italic opacity-60'>(empty file)</span>}
      {renderPageOverlay(1)}
    </div>
  );
}
