/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import SetCard from '@/components/cards/SetCard';
import { type Set } from '@/components/cards/SetCard';
import CreateNewModal from '@/components/modals/CreateNewModal';
import { Button } from '@/components/ui/button';
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
import { type ListPrivacyFilter } from '@/components/lists/ResourceFiltersBar';

import SetListHeader from './SetListHeader';
import SetFilterBar, { type ViewMode } from './SetFilterBar';
import SetTableView from './SetTableView';
import SetEmptyState from './SetEmptyState';

const PAGE_SIZE = 9;
const SORT_CONFIG = [{ property: 'id', direction: 'ASC' }];

const mapSetData = (items: any[]): Set[] =>
  items.map((item) => ({
    id: item.id ?? '',
    title: item.title,
    code: item.code,
    progress: item.progress,
    duration: item.duration,
    flashcards: item.flashcards,
    tests: item.tests,
    audio: item.audio,
    video: item.video,
    updated_at: getTimeAgo(item.updatedAt),
    created_at: new Date(item.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
    description: item.description,
    numNotes: item.numNotes ?? 0,
  }));

export default function SetListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'all' | 'completed' | 'in_progress'
  >('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [listSearch, setListSearch] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [privacyFilter] = useState<ListPrivacyFilter>('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<Set | null>(null);

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
  }, [debouncedQ, privacyFilter]);

  const { data: setData } = useSetData({
    page: currentPage,
    size: PAGE_SIZE,
    sort: SORT_CONFIG,
    q: debouncedQ || undefined,
    privacy: privacyFilter || undefined,
  });

  const sets = mapSetData(setData?.data.data || []);
  const totalPages = setData?.data.metadata?.totalPages || 1;
  const totalItems = setData?.data.metadata?.totalItems || 0;
  const filteredSets = activeTab === 'all' ? sets : [];

  const handleCreateSet = async (data: any) => {
    try {
      const payload: CreateSetPayload = {
        ...data,
        privacy: data.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      };
      await createSetMutation.mutateAsync(payload);
      setIsCreateModalOpen(false);
    } catch {
      toast.error('Failed to create set. Please try again.');
    }
  };

  const handleDeleteSet = async (id: number) => {
    try {
      await deleteSetMutation.mutateAsync(id);
      toast.success('Set deleted successfully');
    } catch {
      toast.error('Failed to delete set');
    }
  };

  const handleUpdateSubmit = async (data: any) => {
    if (!selectedSet) return;
    try {
      const payload: UpdateSetPayload = {
        ...data,
        privacy: data.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      };
      await updateSetMutation.mutateAsync({ id: selectedSet.id, payload });
      setIsUpdateModalOpen(false);
      setSelectedSet(null);
    } catch {
      toast.error('Failed to update set. Please try again.');
    }
  };

  const openUpdateModal = (set: Set) => {
    setSelectedSet(set);
    setIsUpdateModalOpen(true);
  };

  const TABS = [
    { id: 'all' as const, label: t('setlist.all'), count: totalItems },
    { id: 'completed' as const, label: t('setlist.completed'), count: 0 },
    { id: 'in_progress' as const, label: t('setlist.in_progress'), count: 0 },
  ];

  return (
    <div className='min-h-screen' style={{ background: 'var(--pl-bg)' }}>
      <div className='px-10 pt-8 pb-0'>
        <SetListHeader
          isPending={createSetMutation.isPending}
          onCreateClick={() => setIsCreateModalOpen(true)}
        />
        <SetFilterBar
          tabs={TABS}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={listSearch}
          onSearchChange={setListSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        <div
          className='mt-4'
          style={{ borderBottom: '1px solid var(--pl-border)' }}
        />
      </div>

      <div className='px-10 pt-7 pb-16'>
        {filteredSets.length > 0 ? (
          <>
            {viewMode === 'grid' ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-8'>
                {filteredSets.map((set) => (
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
                sets={filteredSets}
                onAccess={(id) => navigate(`/sets/${id}`)}
                onDelete={handleDeleteSet}
                onUpdate={openUpdateModal}
              />
            )}

            <div className='flex justify-center items-center gap-4'>
              <Button
                variant='ghost'
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className='p-2 rounded-lg disabled:opacity-30'
                style={{ color: 'var(--pl-text-muted)' }}
              >
                <ChevronLeft size={16} />
              </Button>
              <span
                className='text-[12.5px]'
                style={{
                  fontFamily: 'var(--font-mono-pl)',
                  color: 'var(--pl-text-muted)',
                }}
              >
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant='ghost'
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={currentPage >= totalPages - 1}
                className='p-2 rounded-lg disabled:opacity-30'
                style={{ color: 'var(--pl-text-muted)' }}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </>
        ) : (
          <SetEmptyState
            activeTab={activeTab}
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
            privacy: 'Public',
          }}
          isUpdateMode={true}
        />
      )}
    </div>
  );
}
