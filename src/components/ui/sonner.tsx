import { Toaster as Sonner } from 'sonner';

import { useTheme } from '@/components/theme/theme-provider';

export function Toaster() {
  const { theme } = useTheme();
  return (
    <Sonner
      theme={theme as 'light' | 'dark' | 'system'}
      style={
        {
          '--normal-bg': 'var(--pl-bg-elev)',
          '--normal-border': 'var(--pl-border)',
          '--normal-text': 'var(--pl-text)',
          '--success-bg': 'var(--pl-accent-soft)',
          '--success-border': 'var(--pl-accent-border)',
          '--success-text': 'var(--pl-accent-strong)',
          '--error-bg': 'var(--pl-danger-soft)',
          '--error-border': 'var(--pl-danger-border)',
          '--error-text': 'var(--pl-danger-text)',
          '--warning-bg': 'var(--pl-warning-soft)',
          '--warning-border': 'var(--pl-warning-border)',
          '--warning-text': 'var(--pl-warning-text)',
          '--info-bg': 'var(--pl-bg-elev)',
          '--info-border': 'var(--pl-border)',
          '--info-text': 'var(--pl-text)',
        } as React.CSSProperties
      }
    />
  );
}
