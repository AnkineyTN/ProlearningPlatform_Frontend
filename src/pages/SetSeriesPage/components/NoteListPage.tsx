import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import NoteCard, { type Note } from '@/components/cards/NoteCard';
import type { ListPrivacyFilter } from '@/components/lists/ResourceFiltersBar';
import {
  CardGrid,
  CardGridSkeleton,
  EmptyState,
  Pagination,
} from '@/components/lists/ListShared';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotesBySet } from '@/hooks/useNotes';
import { formatDate, getTimeAgo } from '@/lib/utils';

type Props = {
  setId?: number;
  search: string;
  privacy: ListPrivacyFilter;
  onUpdate: (note: Note) => void;
  onDelete: (noteId: number) => void;
};

const NoteListPage = ({
  setId: propSetId,
  search,
  privacy,
  onUpdate,
  onDelete,
}: Props) => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(0);
  const [debouncedQ, setDebouncedQ] = useState('');
  const navigate = useNavigate();
  const { setId: paramSetId } = useParams<{ setId: string }>();
  const pageSize = 12;
  const setId = propSetId || Number(paramSetId);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQ(search.trim()), 350);
    return () => window.clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedQ, privacy]);

  const {
    data: notesData,
    isLoading,
    error,
  } = useNotesBySet(setId, {
    page: currentPage,
    size: pageSize,
    q: debouncedQ || undefined,
    privacy: privacy || undefined,
  });

  const notes = notesData?.items || [];
  const totalPages = notesData?.totalPage || 1;

  const handleAccess = (id: number) => navigate(`/sets/${setId}/notes/${id}`);

  if (!setId)
    return (
      <div className='py-10 text-center text-red-500 text-[13px]'>
        {t('list.invalidSetId')}
      </div>
    );

  if (isLoading) return <CardGridSkeleton />;

  if (error)
    return (
      <div className='py-10 text-center text-red-500 text-[13px]'>
        {t('list.notes.error')}
      </div>
    );

  if (notes.length === 0) return <EmptyState label={t('list.notes.empty')} />;

  return (
    <div>
      <CardGrid>
        {notes.map((note) => {
          const noteForUI: Note = {
            id: note.id,
            title: note.title,
            description: note.description || t('list.noDescription'),
            privacy: note.privacy,
            timeAgo: getTimeAgo(note.updated_at),
            created_at: formatDate(note.created_at),
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
