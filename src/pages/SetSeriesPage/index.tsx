import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CreateNewModal from '@/components/modals/CreateNewModal';

import FlashcardListPage from './components/FlashcardListPage';
import HeaderSetDetails from './components/HeaderSetDetails';
import NoteListPage from './components/NoteListPage';
import ExamListPage from './components/ExamListPage';
import SetSeriesTabs from './components/SetSeriesTabs';
import SetSeriesActionBar from './components/SetSeriesActionBar';
import SetTasksPanel from './components/SetTasksPanel';
import { useSetSeriesHandlers } from './hooks/useSetSeriesHandlers';

interface SetSeriesPageProps {
  setId: string;
}

const TABS = ['Notes', 'Flashcards', 'Exams', 'Tasks'];

const TAB_SLUGS: Record<string, string> = {
  Notes: 'notes',
  Flashcards: 'flashcards',
  Exams: 'exams',
  Records: 'records',
  Tasks: 'tasks',
};

function getInitialTab(pathname: string, setId: string): string {
  const path = pathname.toLowerCase();
  if (path.includes(`/sets/${setId}/flashcards`)) return 'Flashcards';
  if (path.includes(`/sets/${setId}/exams`)) return 'Exams';
  if (path.includes(`/sets/${setId}/records`)) return 'Records';
  if (path.includes(`/sets/${setId}/tasks`)) return 'Tasks';
  return 'Notes';
}

export default function SetSeriesPage({ setId }: SetSeriesPageProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() =>
    getInitialTab(location.pathname, setId),
  );

  const handlers = useSetSeriesHandlers({ setId, activeTab, setActiveTab });

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    navigate(`/sets/${setId}/${TAB_SLUGS[tab] ?? tab.toLowerCase()}`);
  };

  return (
    <div className='min-h-screen bg-[var(--pl-bg)] transition-[background] duration-300 pb-10'>
      <HeaderSetDetails setId={setId} />

      <SetSeriesTabs
        tabs={TABS}
        activeTab={activeTab}
        onTabClick={handleTabClick}
      />

      {activeTab !== 'Tasks' && (
        <SetSeriesActionBar
          activeTab={activeTab}
          isDisabled={handlers.isCreatingNote || handlers.isGenerating}
          isGenerating={handlers.isGenerating}
          isCreatingNote={handlers.isCreatingNote}
          onNewClick={handlers.handleCreateButtonClick}
          notesSearch={handlers.notesSearch}
          onNotesSearchChange={handlers.setNotesSearch}
          notesPrivacy={handlers.notesPrivacy}
          onNotesPrivacyChange={handlers.setNotesPrivacy}
          notesSort={handlers.notesSort}
          onNotesSortChange={handlers.setNotesSort}
          flashcardsSearch={handlers.flashcardsSearch}
          onFlashcardsSearchChange={handlers.setFlashcardsSearch}
          flashcardsPrivacy={handlers.flashcardsPrivacy}
          onFlashcardsPrivacyChange={handlers.setFlashcardsPrivacy}
          flashcardsMethod={handlers.flashcardsMethod}
          onFlashcardsMethodChange={handlers.setFlashcardsMethod}
          flashcardsSort={handlers.flashcardsSort}
          onFlashcardsSortChange={handlers.setFlashcardsSort}
          examsSearch={handlers.examsSearch}
          onExamsSearchChange={handlers.setExamsSearch}
          examsPrivacy={handlers.examsPrivacy}
          onExamsPrivacyChange={handlers.setExamsPrivacy}
          examsMethod={handlers.examsMethod}
          onExamsMethodChange={handlers.setExamsMethod}
          examsSort={handlers.examsSort}
          onExamsSortChange={handlers.setExamsSort}
        />
      )}

      {/* Content Grid */}
      {activeTab === 'Tasks' ? (
        <SetTasksPanel setId={Number(setId)} />
      ) : (
        <div className='px-10 pt-4'>
          {activeTab === 'Notes' && (
            <NoteListPage
              setId={Number(setId)}
              search={handlers.notesSearch}
              privacy={handlers.notesPrivacy}
              sort={handlers.notesSort}
              onUpdate={handlers.handleUpdate}
              onDelete={handlers.handleDeleteNote}
            />
          )}
          {activeTab === 'Flashcards' && (
            <FlashcardListPage
              setId={Number(setId)}
              search={handlers.flashcardsSearch}
              privacy={handlers.flashcardsPrivacy}
              createMethod={handlers.flashcardsMethod}
              sort={handlers.flashcardsSort}
              onUpdate={handlers.handleUpdateFlashcard}
              onDelete={handlers.handleDeleteFlashcard}
            />
          )}
          {activeTab === 'Exams' && (
            <ExamListPage
              setId={Number(setId)}
              search={handlers.examsSearch}
              privacy={handlers.examsPrivacy}
              createMethod={handlers.examsMethod}
              sort={handlers.examsSort}
              onUpdate={handlers.handleUpdateExam}
              onDelete={handlers.handleDeleteExam}
            />
          )}
        </div>
      )}

      {/* Create modal */}
      <CreateNewModal
        type={activeTab.slice(0, -1)}
        setId={Number(setId)}
        isOpen={handlers.isCreateModalOpen}
        onClose={() => handlers.setIsCreateModalOpen(false)}
        onSubmit={handlers.handleCreate}
        showAITab={activeTab === 'Flashcards' || activeTab === 'Exams'}
        onSubmitAI={handlers.handleAISubmit}
        isGenerating={handlers.isGenerating}
      />

      {/* Update modal */}
      {handlers.isUpdateModalOpen &&
        (handlers.selectedNote ||
          handlers.selectedFlashcard ||
          handlers.selectedExam) && (
          <CreateNewModal
            type={
              handlers.selectedExam
                ? 'Exam'
                : handlers.selectedFlashcard
                  ? 'Flashcard'
                  : activeTab.slice(0, -1)
            }
            isOpen={handlers.isUpdateModalOpen}
            onClose={handlers.handleCloseUpdateModal}
            onSubmit={handlers.handleUpdateSubmit}
            initialData={{
              title:
                handlers.selectedNote?.title ||
                handlers.selectedFlashcard?.title ||
                handlers.selectedExam?.title ||
                '',
              description:
                handlers.selectedNote?.description ||
                handlers.selectedFlashcard?.description ||
                handlers.selectedExam?.description ||
                '',
              privacy:
                (
                  handlers.selectedNote?.privacy ||
                  handlers.selectedFlashcard?.privacy ||
                  handlers.selectedExam?.privacy ||
                  'PUBLIC'
                )
                  .charAt(0)
                  .toUpperCase() +
                (
                  handlers.selectedNote?.privacy ||
                  handlers.selectedFlashcard?.privacy ||
                  handlers.selectedExam?.privacy ||
                  'public'
                )
                  .slice(1)
                  .toLowerCase(),
            }}
            isUpdateMode={true}
          />
        )}
    </div>
  );
}
