import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/theme/theme-provider';

const ModeToggle = () => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return (
    <Button
      onClick={handleToggle}
      className='flex h-9 w-9 items-center justify-center hover:bg-[var(--pl-bg-hover)] place-items-center rounded-lg border border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] cursor-pointer'
    >
      {isDark ? (
        <Moon className='h-4 w-4 text-[var(--pl-accent-strong)]' />
      ) : (
        <Sun className='h-4 w-4 text-[var(--pl-accent-strong)]' />
      )}
    </Button>
  );
};

export default ModeToggle;
