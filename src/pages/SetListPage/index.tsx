/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function buildPageWindows(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const pages = new Set([0, total - 1, current]);
  if (current > 0) pages.add(current - 1);
  if (current < total - 1) pages.add(current + 1);
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | '...')[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
}
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';

import SetCard from '@/components/cards/SetCard';
import { type Set } from '@/components/cards/SetCard';
import CreateNewModal from '@/components/modals/CreateNewModal';
import {
  useDeleteSet,
  useUpdateSet,
  useSetData,
  useCreateSet,
} from '@/hooks/useSets';
import {
  type CreateSetPayload,
  type UpdateSetPayload,
} from '@/services/types/set.types';
import { getTimeAgo } from '@/lib/utils';
import {
  type ListPrivacyFilter,
  type ListSortOption,
} from '@/components/lists/ResourceFiltersBar';

import SetListHeader from './components/SetListHeader';
import SetFilterBar, { type ViewMode } from './components/SetFilterBar';
import SetTableView from './components/SetTableView';
import SetEmptyState from './components/SetEmptyState';
import SetListSkeleton from './components/SetListSkeleton';

const PAGE_SIZE = 9;
const VIEW_MODE_STORAGE_KEY = 'setlist-view-mode';

function readStoredViewMode(): ViewMode {
  try {
    const raw = localStorage.getItem(VIEW_MODE_STORAGE_KEY);
    return raw === 'grid' || raw === 'table' ? raw : 'grid';
  } catch {
    return 'grid';
  }
}

const mapSetData = (items: any[]): Set[] =>
  items.map((item) => ({
    id: item.id ?? '',
    title: item.title,
    code: item.code,
    progress: item.progress,
    duration: item.duration,
    updated_at: getTimeAgo(item.updatedAt),
    created_at: new Date(item.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    description: item.description,
    numNotes: item.numNotes ?? 0,
    numFlashcards: item.numFlashcards ?? 0,
    numExams: item.numExams ?? 0,
    privacy: item.privacy,
  }));

export default function SetListPage() {
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(0);
  const [listSearch, setListSearch] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<ListPrivacyFilter>('');
  const [sortOption, setSortOption] = useState<ListSortOption>('id,DESC');
  const [viewMode, setViewModeState] = useState<ViewMode>(readStoredViewMode);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<Set | null>(null);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  };

  const createSetMutation = useCreateSet();
  const deleteSetMutation = useDeleteSet();
  const updateSetMutation = useUpdateSet();

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedQ(listSearch.trim()),
      350,
    );
    return () => window.clearTimeout(timer);
  }, [listSearch]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQ, privacyFilter, sortOption]);

  const [sortProp, sortDir] = sortOption.split(',');

  const { data: setData, isPending } = useSetData({
    page: currentPage,
    size: PAGE_SIZE,
    sort: [{ property: sortProp, direction: sortDir }],
    q: debouncedQ || undefined,
    privacy: privacyFilter || undefined,
  });

  const sets = mapSetData(setData?.data.data || []);
  const totalPages = setData?.data.metadata?.totalPages || 1;

  const handleCreateSet = async (data: any) => {
    try {
      const payload: CreateSetPayload = {
        ...data,
        privacy: data.privacy === 'Public' ? 'PUBLIC' : 'PRIVATE',
      };
      await createSetMutation.mutateAsync(payload);
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error(
        apiErrorMessage(error, 'Failed to create set. Please try again.'),
      );
    }
  };

  const handleDeleteSet = async (id: number) => {
    try {
      await deleteSetMutation.mutateAsync(id);
      toast.success('Set deleted successfully');
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Failed to delete set'));
    }
  };

  const handleUpdateSubmit = async (data: any) => {
    if (!selectedSet) return;
    try {
      const payload: UpdateSetPayload = {
        ...data,
        privacy: data.privacy === 'Public' ? 'PUBLIC' : 'PRIVATE',
      };
      await updateSetMutation.mutateAsync({ id: selectedSet.id, payload });
      setIsUpdateModalOpen(false);
      setSelectedSet(null);
    } catch (error) {
      toast.error(
        apiErrorMessage(error, 'Failed to update set. Please try again.'),
      );
    }
  };

  const openUpdateModal = (set: Set) => {
    setSelectedSet(set);
    setIsUpdateModalOpen(true);
  };

  return (
    <div className='min-h-screen' style={{ background: 'var(--pl-bg)' }}>
      <div className='px-10 pt-8 pb-0'>
        <SetListHeader
          isPending={createSetMutation.isPending}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
        <SetFilterBar
          search={listSearch}
          onSearchChange={setListSearch}
          privacy={privacyFilter}
          onPrivacyChange={setPrivacyFilter}
          sort={sortOption}
          onSortChange={setSortOption}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onClearFilters={() => {
            setListSearch('');
            setPrivacyFilter('');
            setSortOption('id,DESC');
          }}
        />
        <div
          className='mt-4'
          style={{ borderBottom: '1px solid var(--pl-border)' }}
        />
      </div>

      <div className='px-10 pt-7 pb-16'>
        {isPending ? (
          <SetListSkeleton count={PAGE_SIZE} viewMode={viewMode} />
        ) : sets.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-8'>
                {sets.map((set) => (
                  <SetCard
                    key={set.id}
                    set={set}
                    onAccess={(id) => navigate(`/sets/${id}`)}
                    onDelete={handleDeleteSet}
                    onUpdate={openUpdateModal}
                  />
                ))}
              </div>
            ) : (
              <SetTableView
                sets={sets}
                onAccess={(id) => navigate(`/sets/${id}`)}
                onDelete={handleDeleteSet}
                onUpdate={openUpdateModal}
              />
            )}

            {totalPages > 1 && (
              <div className='flex justify-center items-center gap-1 mb-8'>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  className={cn(
                    'w-8 h-8 rounded-lg grid place-items-center border border-[var(--pl-border)] transition-[background] duration-150',
                    currentPage === 0
                      ? 'bg-transparent text-[var(--pl-text-faint)] cursor-not-allowed opacity-40'
                      : 'bg-[var(--pl-bg-elev)] text-[var(--pl-text)] cursor-pointer hover:bg-[var(--pl-bg-hover)]',
                  )}
                >
                  <ChevronLeft size={14} />
                </button>

                {buildPageWindows(currentPage, totalPages).map((p, i) =>
                  p === '...' ? (
                    <span
                      key={`ellipsis-${i}`}
                      className='w-8 h-8 grid place-items-center text-[12px] text-[var(--pl-text-faint)]'
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        'w-8 h-8 rounded-lg grid place-items-center text-[12.5px] tabular-nums border transition-[background,color] duration-150 cursor-pointer',
                        p === currentPage
                          ? 'bg-[var(--pl-accent-soft)] border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)] font-medium'
                          : 'bg-[var(--pl-bg-elev)] border-[var(--pl-border)] text-[var(--pl-text-muted)] hover:bg-[var(--pl-bg-hover)]',
                      )}
                    >
                      {p + 1}
                    </button>
                  ),
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1}
                  className={cn(
                    'w-8 h-8 rounded-lg grid place-items-center border border-[var(--pl-border)] transition-[background] duration-150',
                    currentPage >= totalPages - 1
                      ? 'bg-transparent text-[var(--pl-text-faint)] cursor-not-allowed opacity-40'
                      : 'bg-[var(--pl-bg-elev)] text-[var(--pl-text)] cursor-pointer hover:bg-[var(--pl-bg-hover)]',
                  )}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        ) : (
          <SetEmptyState
            isFiltered={Boolean(debouncedQ || privacyFilter)}
            onCreateClick={() => setIsCreateModalOpen(true)}
          />
        )}
      </div>

      <CreateNewModal
        type='Set'
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSet}
      />

      {selectedSet && (
        <CreateNewModal
          type='Set'
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedSet(null);
          }}
          onSubmit={handleUpdateSubmit}
          initialData={{
            title: selectedSet.title,
            description:
              selectedSet.description === 'No description available...'
                ? ''
                : selectedSet.description,
            privacy: selectedSet.privacy === 'PRIVATE' ? 'Private' : 'Public',
          }}
          isUpdateMode={true}
        />
      )}
    </div>
  );
}
