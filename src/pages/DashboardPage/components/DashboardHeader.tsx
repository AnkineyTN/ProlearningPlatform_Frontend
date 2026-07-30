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
  const { t, i18n } = useTranslation();

  return (
    <div className='px-4 sm:px-6 lg:px-10 pt-5 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center'>
      <div>
        <div className='text-[11px] tracking-[0.14em] uppercase text-[var(--pl-text-faint)] mb-1'>
          {new Date().toLocaleDateString(
            i18n.language === 'vi' ? 'vi-VN' : 'en-GB',
            {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            },
          )}
        </div>
        <h1
          className='text-3xl sm:text-4xl lg:text-5xl tracking-[-0.02em] text-[var(--pl-text)] m-0'
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {t('header.welcome')}
        </h1>
      </div>
      <div className='flex items-center gap-3'>
        <div className='flex items-center gap-2 px-[14px] py-2 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-full flex-1 min-w-0 lg:flex-none lg:w-[260px]'>
          <Search size={14} className='text-[var(--pl-text-faint)] shrink-0' />
          <input
            placeholder={t('header.search')}
            value={searchKeyword}
            onChange={(e) => onSearchChange(e.target.value)}
            className='bg-transparent border-0 outline-none text-[13px] text-[var(--pl-text)] w-full min-w-0'
          />
        </div>
        <div className='flex items-center gap-3 shrink-0'>
          <NotificationBell />
          <ModeToggle />
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
