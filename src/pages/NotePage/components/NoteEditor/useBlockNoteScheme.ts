import { useEffect, useState } from 'react';
import { useTheme } from '@/components/theme/theme-provider';

export function useBlockNoteScheme(): 'light' | 'dark' {
  const { theme: appTheme } = useTheme();
  const [scheme, setScheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')
      ? 'dark'
      : 'light',
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () =>
      setScheme(root.classList.contains('dark') ? 'dark' : 'light');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [appTheme]);

  return scheme;
}
