import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/theme/theme-provider';

const AdminTopBar = ({
  kicker,
  title,
  subtitle,
  right,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) => {
  const { theme, setTheme } = useTheme();
  return (
    <div className='flex items-end justify-between px-6 md:px-10 pt-7 pb-6 border-b border-border gap-6'>
      <div className='min-w-0'>
        {kicker && (
          <div className='text-[11px] tracking-[0.16em] uppercase text-muted-foreground mb-2.5'>
            {kicker}
          </div>
        )}
        <h1 className='font-[family-name:var(--font-display)] text-[42px] font-normal tracking-tight leading-[1.05] m-0'>
          {title}
        </h1>
        {subtitle && (
          <div className='mt-1.5 text-muted-foreground text-sm'>
            {subtitle}
          </div>
        )}
      </div>
      <div className='flex items-center gap-3.5 shrink-0'>
        {right}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className='w-9 h-9 grid place-items-center border border-border rounded-full text-muted-foreground hover:text-foreground transition-colors'
        >
          {theme === 'dark' ? (
            <Sun className='w-[15px] h-[15px]' />
          ) : (
            <Moon className='w-[15px] h-[15px]' />
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminTopBar;
