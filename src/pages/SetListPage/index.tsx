/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  FolderX,
  ChevronDown,
  List,
  Grid2x2,
} from 'lucide-react';
import SetCard from '@/components/cards/SetCard';
import CreateNewModal from '@/components/modals/CreateNewModal';
import { Button } from '@/components/ui/button';
import {
  useDeleteSet,
  useUpdateSet,
  useSetData,
  useCreateSet,
} from '@/hooks/useSets';
import { type Set } from '@/components/cards/SetCard';
import {
  type CreateSetPayload,
  type UpdateSetPayload,
} from '@/services/types/set.types';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { getTimeAgo } from '@/lib/utils';
import { type ListPrivacyFilter } from '@/components/lists/ResourceFiltersBar';

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
  const [activeTab, setActiveTab] = useState<
    'all' | 'completed' | 'in_progress'
  >('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [listSearch, setListSearch] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [privacyFilter] = useState<ListPrivacyFilter>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<Set | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const navigate = useNavigate();
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

  const TABS = [
    { id: 'all' as const, label: t('setlist.all'), count: totalItems },
    { id: 'completed' as const, label: t('setlist.completed'), count: 0 },
    { id: 'in_progress' as const, label: t('setlist.in_progress'), count: 0 },
  ];

  return (
    <div className='min-h-screen' style={{ background: 'var(--pl-bg)' }}>
      {/* Page header */}
      <div className='px-10 pt-8 pb-0'>
        <div className='flex items-end justify-between mb-6'>
          <div>
            <p
              className='text-[11px] uppercase tracking-[0.16em] mb-2'
              style={{ color: 'var(--pl-text-faint)' }}
            >
              {t('setlist.your_workspace')}
            </p>
            <h1
              className='text-[42px] font-[400] leading-none'
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                color: 'var(--pl-text)',
              }}
            >
              {t('sidebar.setList')}
            </h1>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            disabled={createSetMutation.isPending}
            className='flex items-center gap-2 px-5 py-[10px] rounded-full text-[13px] font-[500] transition-opacity disabled:opacity-50'
            style={{
              background: 'var(--pl-accent)',
              color: 'var(--pl-accent-fg)',
            }}
          >
            <Plus size={13} strokeWidth={2} />
            {createSetMutation.isPending
              ? t('setlist.creating')
              : t('setlist.new_set')}
          </button>
        </div>

        {/* Filter bar */}
        <div className='flex items-center gap-2 mb-0'>
          {/* Tabs */}
          <div className='flex items-center gap-1 mr-2'>
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className='flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] transition-all'
                  style={{
                    background: active
                      ? 'var(--pl-accent)'
                      : 'var(--pl-bg-elev)',
                    color: active
                      ? 'var(--pl-accent-fg)'
                      : 'var(--pl-text-muted)',
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
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
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
              onClick={() => setViewMode('grid')}
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
              onClick={() => setViewMode('list')}
              className='px-2 py-2 transition-all'
              style={{
                background:
                  viewMode === 'list' ? 'var(--pl-accent-soft)' : 'transparent',
                color:
                  viewMode === 'list'
                    ? 'var(--pl-accent-strong)'
                    : 'var(--pl-text-faint)',
              }}
            >
              <List className='size-4' />
            </button>
          </div>
        </div>

        {/* Tabs bottom border */}
        <div
          className='mt-4'
          style={{ borderBottom: '1px solid var(--pl-border)' }}
        />
      </div>

      {/* Content */}
      <div className='px-10 pt-7 pb-16'>
        {filteredSets.length > 0 ? (
          <>
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[14px] mb-8'
                  : 'flex flex-col gap-3 mb-8'
              }
            >
              {filteredSets.map((set) => (
                <SetCard
                  key={set.id}
                  set={set}
                  onAccess={(id) => navigate(`/sets/${id}`)}
                  onDelete={handleDeleteSet}
                  onUpdate={(s) => {
                    setSelectedSet(s);
                    setIsUpdateModalOpen(true);
                  }}
                />
              ))}
            </div>

            {/* Pagination */}
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
          <div className='flex flex-col items-center justify-center py-20'>
            <FolderX
              size={56}
              style={{ color: 'var(--pl-border-strong)' }}
              className='mb-5'
            />
            <h3
              className='text-[18px] font-[500] mb-2'
              style={{ color: 'var(--pl-text)' }}
            >
              No sets yet
            </h3>
            <p
              className='text-[13px] mb-6'
              style={{ color: 'var(--pl-text-muted)' }}
            >
              {activeTab === 'all'
                ? 'Create your first study set to get started'
                : `No ${activeTab === 'completed' ? 'completed' : 'in progress'} sets yet`}
            </p>
            {activeTab === 'all' && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className='px-5 py-[10px] rounded-full text-[13px] font-[500]'
                style={{
                  background: 'var(--pl-accent)',
                  color: 'var(--pl-accent-fg)',
                }}
              >
                Create your first set
              </button>
            )}
          </div>
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
