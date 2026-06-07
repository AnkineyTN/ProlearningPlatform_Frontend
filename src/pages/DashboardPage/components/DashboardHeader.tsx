import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ModeToggle from '@/components/theme/mode-toggle';
import NotificationBell from '@/components/notifications/NotificationBell';
import LanguageToggle from '@/components/language/language-toggle';

type Props = {
  searchKeyword: string;
  onSearchChange: (v: string) => void;
};

export function DashboardHeader({ searchKeyword, onSearchChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className='px-10 pt-5 flex justify-between items-center'>
      <div>
        <div className='text-[11px] tracking-[0.14em] uppercase text-[var(--pl-text-faint)] mb-1'>
          {new Date().toLocaleDateString('en-GB', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </div>
        <h1
          className='text-5xl tracking-[-0.02em] text-[var(--pl-text)] m-0'
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('header.welcome')}
        </h1>
      </div>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2 px-[14px] py-2 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-full w-[260px]'>
          <Search size={14} className='text-[var(--pl-text-faint)] shrink-0' />
          <input
            placeholder={t('header.search')}
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            className='bg-transparent border-0 outline-none text-[13px] text-[var(--pl-text)] w-full'
          />
        </div>
        <NotificationBell />
        <ModeToggle />
        <LanguageToggle />
      </div>
    </div>
  );
}
