import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useSetData, useUpdateSet } from '@/hooks/useSets';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useStreak, useActivitySummary } from '@/hooks/useActivityLog';
import { type Set } from '@/components/cards/SetCard';
import CreateNewModal from '@/components/modals/CreateNewModal';
import ActivityHeatmap from '@/components/cards/ActivityHeatmap';
import { getTimeAgo } from '@/lib/utils';
import { type UpdateSetPayload } from '@/services/types/set.types';
import { DashboardHeader } from './DashboardHeader';
import { SearchResultsOverlay } from './SearchResultsOverlay';
import { StatsRow } from './StatsRow';
import { ChecklistPanel } from './ChecklistPanel';
import { RecentSetsPanel } from './RecentSetsPanel';
import { MiniCalendar } from './MiniCalendar';

const Dashboard = () => {
  const updateSetMutation = useUpdateSet();
  const [selectedSet, setSelectedSet] = useState<Set | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data: streak } = useStreak();
  const { data: summary } = useActivitySummary(7);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchKeyword.trim()),
      400,
    );
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  const {
    data: searchPayload,
    isFetching: searchLoading,
    isError: searchError,
  } = useGlobalSearch(debouncedSearch, { size: 15 });

  const { data: setData } = useSetData({
    page: 0,
    size: 5,
    sort: [{ property: 'id', direction: 'DESC' }],
  });
  const sets: Set[] = ((setData?.data?.data as unknown[]) || []).map(
    (item: unknown) => {
      const i = item as Record<string, unknown>;
      return {
        id: i.id as number,
        title: i.title as string,
        code: i.code as string,
        progress: i.progress as number,
        duration: i.duration as string,
        flashcards: i.flashcards as number,
        tests: i.tests as number,
        audio: i.audio as number,
        video: i.video as string,
        lastUpdated: i.lastUpdated as string,
        date: i.date as string,
        description: (i.description as string) ?? '',
        numNotes: (i.numNotes as number) ?? 0,
        updated_at: getTimeAgo(i.updatedAt as string),
        created_at: new Date(i.createdAt as string).toLocaleDateString(
          'en-GB',
          { day: '2-digit', month: 'short', year: 'numeric' },
        ),
      };
    },
  );

  const handleUpdateSubmit = async (data: Record<string, unknown>) => {
    if (!selectedSet) return;
    try {
      const payload: UpdateSetPayload = {
        ...(data as UpdateSetPayload),
        privacy: data.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      };
      await updateSetMutation.mutateAsync({ id: selectedSet.id, payload });
      setIsUpdateModalOpen(false);
      setSelectedSet(null);
    } catch {
      toast.error('Failed to update set');
    }
  };

  return (
    <div className='min-h-screen bg-[var(--pl-bg)] transition-[background] duration-300'>
      <DashboardHeader
        searchKeyword={searchKeyword}
        onSearchChange={setSearchKeyword}
      />

      <div className='px-10 pt-6 pb-[60px]'>
        {debouncedSearch.length > 0 && (
          <SearchResultsOverlay
            searchPayload={searchPayload}
            loading={searchLoading}
            error={searchError}
          />
        )}

        <StatsRow
          streak={streak}
          summary={summary}
          setsCount={sets.length}
        />

        <div className='grid grid-cols-[1.55fr_1fr] gap-8'>
          <div className='flex flex-col gap-8'>
            <ChecklistPanel />
            <RecentSetsPanel sets={sets} />
          </div>

          <div className='flex flex-col gap-8'>
            <MiniCalendar />
            <ActivityHeatmap months={6} />
          </div>
        </div>
      </div>

      {selectedSet && (
        <CreateNewModal
          isUpdateMode
          type='Set'
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedSet(null);
          }}
          onSubmit={handleUpdateSubmit}
          initialData={{
            title: selectedSet.title,
            description: selectedSet.description,
            privacy: 'Public',
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
