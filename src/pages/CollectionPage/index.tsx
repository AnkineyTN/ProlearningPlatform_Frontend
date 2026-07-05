import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, Users } from 'lucide-react';
import NoteCard from '@/components/cards/NoteCard';
import FlashCard from '@/components/cards/FlashCard';
import ExamCard from '@/components/cards/ExamCard';
import {
  CardGrid,
  CardGridSkeleton,
  EmptyState,
} from '@/components/lists/ListShared';
import { Button } from '@/components/ui/button';
import {
  useSharedNotes,
  useSharedFlashcards,
  useSharedExams,
} from '@/hooks/useCollaboration';
import { useFavorites } from '@/hooks/useFavorites';
import { cn, formatDate, getTimeAgo } from '@/lib/utils';
import type { FavoriteType } from '@/services/types/favorite.types';
import FavoritesPanel from './FavoritesPanel';

type View = 'shared' | 'favorites';
type Tab = 'Notes' | 'Flashcards' | 'Exams';

const TABS: Tab[] = ['Notes', 'Flashcards', 'Exams'];

const TAB_TO_TYPE: Record<Tab, FavoriteType> = {
  Notes: 'NOTE',
  Flashcards: 'FLASHCARD',
  Exams: 'EXAM',
};

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Owner',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

const VIEW_PILL_BASE = 'gap-2 rounded-full px-4 h-9 text-[13px] border';
const VIEW_PILL_CLASS = {
  active:
    'bg-[var(--pl-bg-elev)] text-[var(--pl-text)] border-[var(--pl-border-strong)] font-medium hover:bg-[var(--pl-bg-elev)]',
  inactive:
    'bg-transparent text-[var(--pl-text-muted)] border-transparent font-normal',
} as const;

const TAB_BASE = 'gap-2 rounded-full px-4 h-9 text-[12.5px] border';
const TAB_CLASS = {
  active:
    'bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] border-transparent font-medium hover:bg-[var(--pl-accent)] hover:text-[var(--pl-accent-fg)]',
  inactive:
    'bg-[var(--pl-bg-elev)] text-[var(--pl-text-muted)] border-[var(--pl-border)] font-normal',
} as const;

const BADGE_BASE =
  'text-[10.5px] px-[6px] py-[1px] rounded-full font-[family-name:var(--font-mono-pl)]';
const BADGE_CLASS = {
  active: 'bg-white/20 text-[var(--pl-accent-fg)]',
  inactive: 'bg-[var(--pl-bg-hover)] text-[var(--pl-text-faint)]',
} as const;

export default function CollectionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Persist the active view + tab in the URL so returning from a resource
  // (browser back) restores the exact tab the user came from.
  const view: View =
    searchParams.get('view') === 'shared' ? 'shared' : 'favorites';
  const tabParam = searchParams.get('tab');
  const activeTab: Tab = TABS.includes(tabParam as Tab)
    ? (tabParam as Tab)
    : 'Notes';

  const updateParams = (next: { view?: View; tab?: Tab }) => {
    setSearchParams(
      { view: next.view ?? view, tab: next.tab ?? activeTab },
      { replace: true },
    );
  };

  const { data: sharedNotes = [], isLoading: loadingNotes } = useSharedNotes();
  const { data: sharedFlashcards = [], isLoading: loadingFlashcards } =
    useSharedFlashcards();
  const { data: sharedExams = [], isLoading: loadingExams } = useSharedExams();

  const isFavorites = view === 'favorites';

  const { data: favNotes = [] } = useFavorites('NOTE', undefined, isFavorites);
  const { data: favFlashcards = [] } = useFavorites(
    'FLASHCARD',
    undefined,
    isFavorites,
  );
  const { data: favExams = [] } = useFavorites('EXAM', undefined, isFavorites);

  const counts: Record<Tab, number> = isFavorites
    ? {
        Notes: favNotes.length,
        Flashcards: favFlashcards.length,
        Exams: favExams.length,
      }
    : {
        Notes: sharedNotes.length,
        Flashcards: sharedFlashcards.length,
        Exams: sharedExams.length,
      };

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
              {isFavorites
                ? t('collection.favoritesKicker')
                : t('collection.collaborationKicker')}
            </p>
            <h1
              className='text-[42px] font-[400] leading-none flex items-center gap-3'
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                color: 'var(--pl-text)',
              }}
            >
              {isFavorites ? (
                <Heart
                  size={34}
                  className='shrink-0'
                  style={{ color: 'var(--pl-danger)' }}
                />
              ) : (
                <Users
                  size={36}
                  className='shrink-0'
                  style={{ color: 'var(--pl-accent)' }}
                />
              )}
              {isFavorites
                ? t('collection.favoritesTitle')
                : t('collection.sharedTitle')}
            </h1>
          </div>
        </div>

        {/* View toggle: Favorites / Shared */}
        <div className='flex items-center gap-2 mb-5'>
          <Button
            variant='ghost'
            onClick={() => updateParams({ view: 'favorites' })}
            className={cn(
              VIEW_PILL_BASE,
              view === 'favorites'
                ? VIEW_PILL_CLASS.active
                : VIEW_PILL_CLASS.inactive,
            )}
          >
            <Heart size={14} />
            {t('collection.viewFavorites')}
          </Button>
          <Button
            variant='ghost'
            onClick={() => updateParams({ view: 'shared' })}
            className={cn(
              VIEW_PILL_BASE,
              view === 'shared'
                ? VIEW_PILL_CLASS.active
                : VIEW_PILL_CLASS.inactive,
            )}
          >
            <Users size={14} />
            {t('collection.viewShared')}
          </Button>
        </div>

        {/* Type tab bar */}
        <div className='flex items-center gap-1'>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <Button
                key={tab}
                variant='ghost'
                onClick={() => updateParams({ tab })}
                className={cn(
                  TAB_BASE,
                  active ? TAB_CLASS.active : TAB_CLASS.inactive,
                )}
              >
                {t(`collection.tab.${TAB_TO_TYPE[tab].toLowerCase()}`)}
                <span
                  className={cn(
                    BADGE_BASE,
                    active ? BADGE_CLASS.active : BADGE_CLASS.inactive,
                  )}
                >
                  {counts[tab]}
                </span>
              </Button>
            );
          })}
        </div>

        <div
          className='mt-4'
          style={{ borderBottom: '1px solid var(--pl-border)' }}
        />
      </div>

      {/* Content */}
      <div className='px-10 pt-7 pb-16'>
        {isFavorites ? (
          <FavoritesPanel
            key={activeTab}
            type={TAB_TO_TYPE[activeTab]}
            emptyLabel={t('collection.emptyFavorites')}
          />
        ) : (
          <>
            {activeTab === 'Notes' && (
              <>
                {loadingNotes ? (
                  <CardGridSkeleton />
                ) : sharedNotes.length === 0 ? (
                  <EmptyState label={t('collection.emptyNotes')} />
                ) : (
                  <CardGrid>
                    {sharedNotes.map((note) => (
                      <div key={note.id} className='relative'>
                        <NoteCard
                          setId={note.setId}
                          note={{
                            id: note.id,
                            title: note.title,
                            description: note.description || 'No description',
                            privacy: note.privacy,
                            timeAgo: getTimeAgo(note.updated_at),
                            created_at: formatDate(note.created_at),
                          }}
                          onAccess={() =>
                            navigate(`/sets/${note.setId}/notes/${note.id}`)
                          }
                        />
                        <RoleBadge role={note.userRole} />
                      </div>
                    ))}
                  </CardGrid>
                )}
              </>
            )}

            {activeTab === 'Flashcards' && (
              <>
                {loadingFlashcards ? (
                  <CardGridSkeleton />
                ) : sharedFlashcards.length === 0 ? (
                  <EmptyState label={t('collection.emptyFlashcards')} />
                ) : (
                  <CardGrid>
                    {sharedFlashcards.map((fc) => (
                      <div key={fc.id} className='relative'>
                        <FlashCard
                          setId={fc.setId}
                          flashcard={{
                            id: fc.id,
                            title: fc.title,
                            description: fc.description || 'No description',
                            time: getTimeAgo(fc.lastStudy),
                            created_at: formatDate(fc.createdAt),
                            privacy: fc.privacy,
                          }}
                          onAccess={() =>
                            navigate(`/sets/${fc.setId}/flashcards/${fc.id}`)
                          }
                          onUpdate={() => {}}
                          onDelete={() => {}}
                        />
                        <RoleBadge role={fc.userRole} />
                      </div>
                    ))}
                  </CardGrid>
                )}
              </>
            )}

            {activeTab === 'Exams' && (
              <>
                {loadingExams ? (
                  <CardGridSkeleton />
                ) : sharedExams.length === 0 ? (
                  <EmptyState label={t('collection.emptyExams')} />
                ) : (
                  <CardGrid>
                    {sharedExams.map((exam) => (
                      <div key={exam.id} className='relative'>
                        <ExamCard
                          setId={exam.setId}
                          exam={{
                            id: exam.id,
                            title: exam.title,
                            description: exam.description,
                            numQuestions: exam.numQuestions,
                            duration: exam.duration,
                            createdAt: exam.createdAt,
                            privacy: exam.privacy,
                          }}
                          onAccess={() =>
                            navigate(`/sets/${exam.setId}/exams/${exam.id}`)
                          }
                          onUpdate={() => {}}
                          onDelete={() => {}}
                        />
                        <RoleBadge role={exam.userRole} />
                      </div>
                    ))}
                  </CardGrid>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  return (
    <span
      className='absolute top-3 left-3 text-[9px] font-bold tracking-[0.12em] uppercase px-[7px] py-[3px] rounded-full pointer-events-none'
      style={{
        background: 'var(--pl-bg-elev)',
        color: 'var(--pl-text-faint)',
        border: '1px solid var(--pl-border)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {ROLE_LABEL[role] ?? role}
    </span>
  );
}
