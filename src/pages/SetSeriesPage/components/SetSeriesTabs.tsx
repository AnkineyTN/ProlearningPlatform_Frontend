import { cn } from '@/lib/utils';

interface SetSeriesTabsProps {
  tabs: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

export default function SetSeriesTabs({
  tabs,
  activeTab,
  onTabClick,
}: SetSeriesTabsProps) {
  return (
    <div className='px-4 lg:px-6 border-b border-b-[var(--pl-border)] flex gap-0.5 sticky top-0 bg-[var(--pl-bg)] z-10'>
      {tabs.map((tab) => {
        const active = activeTab === tab;
        return (
          <button
            key={tab}
            onClick={() => onTabClick(tab)}
            className={cn(
              'px-[18px] py-[12px] flex items-center gap-2 border-t-0 border-l-0 border-r-0 border-b-2 bg-transparent cursor-pointer whitespace-nowrap transition-[color] duration-150 text-[13.5px] -mb-px hover:bg-[var(--pl-bg-hover)]',
              active
                ? 'border-b-[var(--pl-accent)] text-[var(--pl-text)] font-semibold'
                : 'border-b-transparent text-[var(--pl-text-muted)] font-normal',
            )}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
