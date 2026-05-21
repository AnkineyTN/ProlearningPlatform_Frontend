import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ResourceFiltersBar,
  type ListCreateMethodFilter,
  type ListPrivacyFilter,
  type ListSortOption,
} from '@/components/lists/ResourceFiltersBar';

interface SetSeriesActionBarProps {
  activeTab: string;
  isDisabled: boolean;
  isGenerating: boolean;
  isCreatingNote: boolean;
  onNewClick: () => void;

  // Notes filters
  notesSearch: string;
  onNotesSearchChange: (v: string) => void;
  notesPrivacy: ListPrivacyFilter;
  onNotesPrivacyChange: (v: ListPrivacyFilter) => void;
  notesSort: ListSortOption;
  onNotesSortChange: (v: ListSortOption) => void;

  // Flashcards filters
  flashcardsSearch: string;
  onFlashcardsSearchChange: (v: string) => void;
  flashcardsPrivacy: ListPrivacyFilter;
  onFlashcardsPrivacyChange: (v: ListPrivacyFilter) => void;
  flashcardsMethod: ListCreateMethodFilter;
  onFlashcardsMethodChange: (v: ListCreateMethodFilter) => void;
  flashcardsSort: ListSortOption;
  onFlashcardsSortChange: (v: ListSortOption) => void;

  // Exams filters
  examsSearch: string;
  onExamsSearchChange: (v: string) => void;
  examsPrivacy: ListPrivacyFilter;
  onExamsPrivacyChange: (v: ListPrivacyFilter) => void;
  examsMethod: ListCreateMethodFilter;
  onExamsMethodChange: (v: ListCreateMethodFilter) => void;
  examsSort: ListSortOption;
  onExamsSortChange: (v: ListSortOption) => void;
}

export default function SetSeriesActionBar({
  activeTab,
  isDisabled,
  isGenerating,
  isCreatingNote,
  onNewClick,
  notesSearch,
  onNotesSearchChange,
  notesPrivacy,
  onNotesPrivacyChange,
  notesSort,
  onNotesSortChange,
  flashcardsSearch,
  onFlashcardsSearchChange,
  flashcardsPrivacy,
  onFlashcardsPrivacyChange,
  flashcardsMethod,
  onFlashcardsMethodChange,
  flashcardsSort,
  onFlashcardsSortChange,
  examsSearch,
  onExamsSearchChange,
  examsPrivacy,
  onExamsPrivacyChange,
  examsMethod,
  onExamsMethodChange,
  examsSort,
  onExamsSortChange,
}: SetSeriesActionBarProps) {
  const { t } = useTranslation();

  return (
    <div className='px-10 pt-5 flex items-center gap-3 flex-wrap'>
      <Button
        size='sm'
        onClick={onNewClick}
        disabled={isDisabled}
        className={cn(
          'font-semibold gap-1',
          isDisabled && 'opacity-55 cursor-not-allowed',
        )}
      >
        <Plus className='size-4' />
        {isGenerating
          ? t('set.actions.generating')
          : isCreatingNote
            ? t('set.actions.creating')
            : t(
                `set.actions.new${activeTab.slice(0, -1)}` as
                  | 'set.actions.newNote'
                  | 'set.actions.newFlashcard'
                  | 'set.actions.newExam',
                { defaultValue: t('set.actions.newItem') },
              )}
      </Button>
      <div className='w-px h-5 bg-[var(--pl-border)] shrink-0 mx-0.5' />

      {activeTab === 'Notes' && (
        <ResourceFiltersBar
          className='py-0'
          searchValue={notesSearch}
          onSearchChange={onNotesSearchChange}
          privacy={notesPrivacy}
          onPrivacyChange={onNotesPrivacyChange}
          sort={notesSort}
          onSortChange={onNotesSortChange}
        />
      )}
      {activeTab === 'Flashcards' && (
        <ResourceFiltersBar
          className='py-0'
          searchValue={flashcardsSearch}
          onSearchChange={onFlashcardsSearchChange}
          privacy={flashcardsPrivacy}
          onPrivacyChange={onFlashcardsPrivacyChange}
          createMethod={flashcardsMethod}
          onCreateMethodChange={onFlashcardsMethodChange}
          sort={flashcardsSort}
          onSortChange={onFlashcardsSortChange}
        />
      )}
      {activeTab === 'Exams' && (
        <ResourceFiltersBar
          className='py-0'
          searchValue={examsSearch}
          onSearchChange={onExamsSearchChange}
          privacy={examsPrivacy}
          onPrivacyChange={onExamsPrivacyChange}
          createMethod={examsMethod}
          onCreateMethodChange={onExamsMethodChange}
          sort={examsSort}
          onSortChange={onExamsSortChange}
        />
      )}
    </div>
  );
}
