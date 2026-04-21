import { useEffect, useState } from 'react';
import NoteCard, { type Note } from '@/components/cards/NoteCard';
import {
  ResourceFiltersBar,
  type ListPrivacyFilter,
} from '@/components/lists/ResourceFiltersBar';
import {
  CardGrid,
  CardGridSkeleton,
  EmptyState,
  Pagination,
} from '@/components/lists/ListShared';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotesBySet } from '@/hooks/useNotes';
import { getTimeAgo } from '@/lib/utils';

type Props = {
  setId?: number;
  onUpdate: (note: Note) => void;
  onDelete: (noteId: number) => void;
};

const NoteListPage = ({ setId: propSetId, onUpdate, onDelete }: Props) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [listSearch, setListSearch] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [privacyFilter, setPrivacyFilter] = useState<ListPrivacyFilter>('');
  const navigate = useNavigate();
  const { setId: paramSetId } = useParams<{ setId: string }>();
  const pageSize = 6;
  const setId = propSetId || Number(paramSetId);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(listSearch.trim()), 350);
    return () => window.clearTimeout(t);
  }, [listSearch]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQ, privacyFilter]);

  const {
    data: notesData,
    isLoading,
    error,
  } = useNotesBySet(setId, {
    page: currentPage,
    size: pageSize,
    q: debouncedQ || undefined,
    privacy: privacyFilter || undefined,
  });

  const notes = notesData?.items || [];
  const totalPages = notesData?.totalPage || 1;

  const handleAccess = (id: number) => navigate(`/sets/${setId}/notes/${id}`);

  if (!setId)
    return (
      <div className='py-10 text-center text-[oklch(0.65_0.2_25)] text-[13px]'>
        Invalid set ID
      </div>
    );

  const filters = (
    <ResourceFiltersBar
      searchValue={listSearch}
      onSearchChange={setListSearch}
      privacy={privacyFilter}
      onPrivacyChange={setPrivacyFilter}
    />
  );

  if (isLoading)
    return (
      <div>
        {filters}
        <CardGridSkeleton />
      </div>
    );

  if (error)
    return (
      <div>
        {filters}
        <div className='py-10 text-center text-[oklch(0.65_0.2_25)] text-[13px]'>
          Error loading notes. Please try again.
        </div>
      </div>
    );

  if (notes.length === 0)
    return (
      <div>
        {filters}
        <EmptyState label='No notes found — create your first note!' />
      </div>
    );

  return (
    <div>
      {filters}
      <CardGrid>
        {notes.map((note) => {
          const noteForUI: Note = {
            id: note.id,
            title: note.title,
            description: note.description || 'No description available…',
            privacy: note.privacy,
            timeAgo: getTimeAgo(note.updated_at),
            created_at: new Date(note.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }),
          };
          return (
            <NoteCard
              key={note.id}
              note={noteForUI}
              onAccess={() => handleAccess(note.id)}
              onUpdate={() => onUpdate(noteForUI)}
              onDelete={() => onDelete(note.id)}
            />
          );
        })}
      </CardGrid>
      <Pagination
        current={currentPage}
        total={totalPages}
        onPrev={() => setCurrentPage((p) => Math.max(0, p - 1))}
        onNext={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
      />
    </div>
  );
};

export default NoteListPage;
