import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import NoteCard from '@/components/cards/NoteCard';
import FlashCard from '@/components/cards/FlashCard';
import ExamCard from '@/components/cards/ExamCard';
import {
  CardGrid,
  CardGridSkeleton,
  EmptyState,
} from '@/components/lists/ListShared';
import {
  useSharedNotes,
  useSharedFlashcards,
  useSharedExams,
} from '@/hooks/useCollaboration';
import { formatDate, getTimeAgo } from '@/lib/utils';

type Tab = 'Notes' | 'Flashcards' | 'Exams';

const TABS: Tab[] = ['Notes', 'Flashcards', 'Exams'];

const ROLE_LABEL: Record<string, string> = {
  OWNER: 'Owner',
  EDITOR: 'Editor',
  VIEWER: 'Viewer',
};

export default function SharedResourcesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Notes');
  const navigate = useNavigate();

  const { data: sharedNotes = [], isLoading: loadingNotes } = useSharedNotes();
  const { data: sharedFlashcards = [], isLoading: loadingFlashcards } =
    useSharedFlashcards();
  const { data: sharedExams = [], isLoading: loadingExams } = useSharedExams();

  const counts: Record<Tab, number> = {
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
              Collaboration
            </p>
            <h1
              className='text-[42px] font-[400] leading-none flex items-center gap-3'
              style={{
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                color: 'var(--pl-text)',
              }}
            >
              <Users
                size={36}
                className='shrink-0'
                style={{ color: 'var(--pl-accent)' }}
              />
              Shared with me
            </h1>
          </div>
        </div>

        {/* Tab bar */}
        <div className='flex items-center gap-1'>
          {TABS.map((tab) => {
            const active = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className='flex items-center gap-2 px-4 py-2 rounded-full text-[12.5px] transition-all'
                style={{
                  background: active ? 'var(--pl-accent)' : 'var(--pl-bg-elev)',
                  color: active
                    ? 'var(--pl-accent-fg)'
                    : 'var(--pl-text-muted)',
                  border: active ? 'none' : '1px solid var(--pl-border)',
                  fontWeight: active ? 500 : 400,
                }}
              >
                {tab}
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
                  {counts[tab]}
                </span>
              </button>
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
        {activeTab === 'Notes' && (
          <>
            {loadingNotes ? (
              <CardGridSkeleton />
            ) : sharedNotes.length === 0 ? (
              <EmptyState label='No notes shared with you yet' />
            ) : (
              <CardGrid>
                {sharedNotes.map((note) => (
                  <div key={note.id} className='relative'>
                    <NoteCard
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
              <EmptyState label='No flashcard sets shared with you yet' />
            ) : (
              <CardGrid>
                {sharedFlashcards.map((fc) => (
                  <div key={fc.id} className='relative'>
                    <FlashCard
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
              <EmptyState label='No exams shared with you yet' />
            ) : (
              <CardGrid>
                {sharedExams.map((exam) => (
                  <div key={exam.id} className='relative'>
                    <ExamCard
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
