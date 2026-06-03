/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FilterBar from './components/FilterBar';
import RailSidebar from './components/RailSidebar';
import SectionBlock from './components/SectionBlock';
import { PAGE_SIZE, SECTIONS } from './sectionConfig';
import { DEFAULT_SECTION } from './types';

import type { FilterType, SectionState, SectionType, SortType } from './types';

const SocialExplorePage = () => {
  const { t } = useTranslation();

  const [sections, setSections] = useState<Record<SectionType, SectionState>>({
    NOTE: { ...DEFAULT_SECTION },
    FLASHCARD: { ...DEFAULT_SECTION },
    EXAM: { ...DEFAULT_SECTION },
  });
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('trending');
  const [query, setQuery] = useState('');

  const abortRefs = useRef<Partial<Record<SectionType, AbortController>>>({});

  const fetchSection = useCallback(
    async (type: SectionType, page: number, q: string, append = false) => {
      abortRefs.current[type]?.abort();
      const controller = new AbortController();
      abortRefs.current[type] = controller;

      setSections((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: true, error: null },
      }));

      try {
        const section = SECTIONS.find((s) => s.type === type)!;
        const res = await section.fetchFn({ q, page, size: PAGE_SIZE });
        const { data, metadata } = res.data;
        setSections((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            items: append ? [...prev[type].items, ...data] : data,
            meta: metadata,
            loading: false,
            page,
          },
        }));
      } catch (err: any) {
        if (err?.name === 'CanceledError' || err?.name === 'AbortError') return;
        setSections((prev) => ({
          ...prev,
          [type]: { ...prev[type], loading: false, error: 'Failed to fetch.' },
        }));
      }
    },
    [],
  );

  useEffect(() => {
    (['NOTE', 'FLASHCARD', 'EXAM'] as SectionType[]).forEach((type) =>
      fetchSection(type, 0, ''),
    );
    const controllers = abortRefs.current;
    return () => {
      Object.values(controllers).forEach((c) => c?.abort());
    };
  }, [fetchSection]);

  const handleSearch = useCallback(() => {
    const types: SectionType[] =
      activeFilter === 'all'
        ? ['NOTE', 'FLASHCARD', 'EXAM']
        : [activeFilter as SectionType];
    types.forEach((type) => fetchSection(type, 0, query, false));
  }, [activeFilter, query, fetchSection]);

  const handleFilterChange = (f: FilterType) => {
    setActiveFilter(f);
    if (f !== 'all') {
      const type = f as SectionType;
      if (sections[type].items.length === 0 && !sections[type].loading)
        fetchSection(type, 0, query);
    }
  };

  const counts = {
    NOTE: sections.NOTE.meta?.totalItems ?? null,
    FLASHCARD: sections.FLASHCARD.meta?.totalItems ?? null,
    EXAM: sections.EXAM.meta?.totalItems ?? null,
  };

  const visibleSections = SECTIONS.filter(
    (s) => activeFilter === 'all' || s.type === activeFilter,
  );

  return (
    <div className='min-h-screen bg-[var(--pl-bg)]'>
      {/* Header */}
      <div className='px-6 md:px-10 pt-8 pb-6 border-b border-[var(--pl-border)]'>
        <div className='max-w-[1400px] mx-auto'>
          <div
            style={{ fontFamily: 'var(--font-mono-pl)' }}
            className='text-[10.5px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)] mb-1'
          >
            {t('social.communityBanner')}
          </div>
          <h1
            style={{ fontFamily: 'var(--font-display)' }}
            className='text-[28px] font-medium tracking-[-0.02em] text-[var(--pl-text)] mb-1'
          >
            {t('social.explore')}
          </h1>
          <p className='text-[13.5px] text-[var(--pl-text-muted)]'>
            {t('social.exploreDesc')}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className='px-6 md:px-10 py-8 max-w-[1400px] mx-auto'>
        <div className='grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 items-start'>
          {/* Main feed */}
          <div className='min-w-0'>
            <FilterBar
              filter={activeFilter}
              setFilter={handleFilterChange}
              sort={sort}
              setSort={setSort}
              query={query}
              setQuery={setQuery}
              onSearch={handleSearch}
              counts={counts}
            />
            <div className='flex flex-col gap-10'>
              {visibleSections.map(({ type, labelKey, icon }) => (
                <SectionBlock
                  key={type}
                  type={type}
                  label={t(labelKey, type)}
                  icon={icon}
                  state={sections[type]}
                  sort={sort}
                  onLoadMore={() =>
                    fetchSection(type, sections[type].page + 1, query, true)
                  }
                />
              ))}
            </div>
          </div>

          {/* Right rail */}
          <RailSidebar />
        </div>
      </div>
    </div>
  );
};

export default SocialExplorePage;
