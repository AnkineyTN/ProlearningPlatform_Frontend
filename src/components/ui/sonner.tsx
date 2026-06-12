import { Toaster as Sonner } from 'sonner';

import { useTheme } from '@/components/theme/theme-provider';

export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme as 'light' | 'dark' | 'system'}
      richColors
      style={
        {
          '--normal-bg': 'var(--pl-bg-elev)',
          '--normal-border': 'var(--pl-border)',
          '--normal-text': 'var(--pl-text)',
          '--success-bg': 'var(--pl-bg-elev)',
          '--success-border': 'var(--pl-accent-border)',
          '--success-text': 'var(--pl-accent-strong)',
          '--info-bg': 'var(--pl-bg-elev)',
          '--info-border': 'var(--pl-border)',
          '--info-text': 'var(--pl-text)',
        } as React.CSSProperties
      }
    />
  );
}
