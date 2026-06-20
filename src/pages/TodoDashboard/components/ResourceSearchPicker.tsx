import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useAuth } from '@/hooks/useAuth';
import type { ResourceRef } from '@/services/types/todo.types';
import type { ResourceType } from '../constants';
import { SEARCH_TYPE_MAP, extractSearchItems } from './todoResourceMeta';

const ResourceSearchPicker = ({
  type,
  onAdd,
}: {
  type: ResourceType;
  onAdd: (ref: ResourceRef) => void;
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  const { data: searchResult, isFetching } = useGlobalSearch(debouncedQuery, {
    searchType: SEARCH_TYPE_MAP[type],
    size: 50,
  });

  const allItems = extractSearchItems(searchResult?.data);
  const items = user
    ? allItems.filter((item) => Number(item.userId) === user.id)
    : allItems;

  const handleSelect = (item: Record<string, unknown>) => {
    const id = Number(item.id ?? item.resourceId);
    if (!id) return;
    const setId = item.setId != null ? Number(item.setId) : null;
    const title = String(
      item.title ?? item.name ?? item.code ?? `${type} #${id}`,
    );
    onAdd({ id, setId, title });
    setQuery('');
    setDebouncedQuery('');
  };

  return (
    <div className='relative'>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('todo.detailModal.searchResource', {
          type: t(`todo.resource.${type}`),
        })}
        className='w-full rounded-lg border border-[var(--pl-border)] bg-transparent text-xs px-2 py-1.5 text-[var(--pl-text)] outline-none focus:border-[var(--pl-accent)]'
        autoFocus
      />
      {debouncedQuery.length > 0 && (
        <div className='mt-1 rounded-lg border border-[var(--pl-border)] bg-[var(--pl-bg)] max-h-44 overflow-y-auto shadow-lg'>
          {isFetching ? (
            <div className='px-3 py-2 text-xs text-[var(--pl-text-faint)]'>
              ...
            </div>
          ) : items.length === 0 ? (
            <div className='px-3 py-2 text-xs text-[var(--pl-text-faint)]'>
              {t('todo.detailModal.noResults')}
            </div>
          ) : (
            items.map((item, i) => (
              <button
                key={i}
                type='button'
                onClick={() => handleSelect(item)}
                className='w-full text-left px-3 py-2 text-xs text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] border-b border-[var(--pl-border)] last:border-0 truncate'
              >
                {String(item.title ?? item.name ?? item.code ?? item.id ?? '—')}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ResourceSearchPicker;
