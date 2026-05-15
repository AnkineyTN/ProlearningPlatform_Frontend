import { Search, ChevronDown, Grid2x2, List } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type TabId = 'all' | 'completed' | 'in_progress';
type Tab = { id: TabId; label: string; count: number };
export type ViewMode = 'grid' | 'table';

type Props = {
  tabs: Tab[];
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
};

export default function SetFilterBar({
  tabs,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className='flex items-center gap-2 mb-0'>
      {/* Tabs */}
      <div className='flex items-center gap-1 mr-2'>
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className='flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] transition-all'
              style={{
                background: active ? 'var(--pl-accent)' : 'var(--pl-bg-elev)',
                color: active ? 'var(--pl-accent-fg)' : 'var(--pl-text-muted)',
                border: active ? 'none' : '1px solid var(--pl-border)',
                fontWeight: active ? 500 : 400,
              }}
            >
              {tab.label}
              <span
                className='text-[10.5px] px-[6px] py-[1px] rounded-full'
                style={{
                  fontFamily: 'var(--font-mono-pl)',
                  background: active
                    ? 'rgba(255,255,255,0.2)'
                    : 'var(--pl-bg-hover)',
                  color: active
                    ? 'var(--pl-accent-fg)'
                    : 'var(--pl-text-faint)',
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className='flex-1' />

      {/* Search */}
      <div
        className='flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px] w-56'
        style={{
          background: 'var(--pl-bg-elev)',
          border: '1px solid var(--pl-border)',
          color: 'var(--pl-text-faint)',
        }}
      >
        <Search size={12} />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('setlist.searchPlaceholder', {
            defaultValue: 'Search sets…',
          })}
          className='bg-transparent outline-none flex-1 text-[12.5px]'
          style={{ color: 'var(--pl-text)' }}
        />
      </div>

      {/* Sort pill */}
      <button
        className='flex items-center gap-2 px-3 py-2 rounded-lg text-[12.5px]'
        style={{
          background: 'var(--pl-bg-elev)',
          border: '1px solid var(--pl-border)',
          color: 'var(--pl-text-muted)',
        }}
      >
        {t('list.filter.sortNewest')} <ChevronDown size={11} />
      </button>

      {/* View toggle */}
      <div
        className='flex rounded-lg overflow-hidden'
        style={{
          background: 'var(--pl-bg-elev)',
          border: '1px solid var(--pl-border)',
        }}
      >
        <button
          onClick={() => onViewModeChange('grid')}
          className='px-2 py-2 transition-all'
          style={{
            background:
              viewMode === 'grid' ? 'var(--pl-accent-soft)' : 'transparent',
            color:
              viewMode === 'grid'
                ? 'var(--pl-accent-strong)'
                : 'var(--pl-text-faint)',
          }}
        >
          <Grid2x2 className='size-4' />
        </button>
        <button
          onClick={() => onViewModeChange('table')}
          className='px-2 py-2 transition-all'
          style={{
            background:
              viewMode === 'table' ? 'var(--pl-accent-soft)' : 'transparent',
            color:
              viewMode === 'table'
                ? 'var(--pl-accent-strong)'
                : 'var(--pl-text-faint)',
          }}
        >
          <List className='size-4' />
        </button>
      </div>
    </div>
  );
}
