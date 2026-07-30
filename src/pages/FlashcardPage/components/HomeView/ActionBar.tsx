import {
  Blocks,
  Brain,
  ClipboardList,
  Loader2,
  Settings,
  Shuffle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import FlashcardSettingsDialog from '../FlashcardSettingsDialog';
import { useFlashcardStudySettings } from '@/hooks/useFlashcardStudySettings';

interface ActionBarProps {
  onStudy: () => void;
  onMatching: () => void;
  onPracticeWithExam: () => void;
  isPracticeWithExamLoading: boolean;
  onShuffle: () => void;
}

export default function ActionBar({
  onStudy,
  onMatching,
  onPracticeWithExam,
  isPracticeWithExamLoading,
  onShuffle,
}: ActionBarProps) {
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settings = useFlashcardStudySettings();

  return (
    <div className='flex items-center gap-2 mb-2'>
      <Button onClick={onStudy} className='gap-2 text-sm' size='sm'>
        <Brain className='w-4 h-4' />
        {t('flashcard.study.actionBar.study')}
      </Button>
      <Button onClick={onMatching} className='gap-2 text-sm' size='sm'>
        <Blocks className='w-4 h-4' />
        {t('flashcard.study.actionBar.matching')}
      </Button>
      <Button
        onClick={onPracticeWithExam}
        disabled={isPracticeWithExamLoading}
        className='gap-2 text-sm'
        size='sm'
      >
        {isPracticeWithExamLoading ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <ClipboardList className='w-4 h-4' />
        )}
        {t('flashcard.study.actionBar.practiceWithExam')}
      </Button>
      <div className='ml-auto flex items-center gap-2'>
        <Button variant='outline' size='icon' onClick={onShuffle}>
          <Shuffle size={14} />
        </Button>
        <Button
          variant='outline'
          size='icon'
          onClick={() => setIsSettingsOpen(true)}
        >
          <Settings size={14} />
        </Button>
      </div>
      <FlashcardSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        isFrontCardTerm={settings.isFrontCardTerm}
        isProgressTrackingEnabled={settings.isProgressTrackingEnabled}
        autoFlipDelay={settings.autoFlipDelay}
        matchingCardCount={settings.matchingCardCount}
        setIsFrontCardTerm={settings.setIsFrontCardTerm}
        setIsProgressTrackingEnabled={settings.setIsProgressTrackingEnabled}
        setAutoFlipDelay={settings.setAutoFlipDelay}
        setMatchingCardCount={settings.setMatchingCardCount}
      />
    </div>
  );
}
