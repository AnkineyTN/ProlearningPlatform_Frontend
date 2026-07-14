import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Blocks,
  Brain,
  ClipboardList,
  Edit,
  Loader2,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface ActionBarProps {
  setId: number;
  flashcardId: number | string;
  onStudy: () => void;
  onMatching: () => void;
  onPracticeWithExam: () => void;
  isPracticeWithExamLoading: boolean;
  onRequestDeleteFlashcard: () => void;
}

export default function ActionBar({
  setId,
  flashcardId,
  onStudy,
  onMatching,
  onPracticeWithExam,
  isPracticeWithExamLoading,
  onRequestDeleteFlashcard,
}: ActionBarProps) {
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

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

      <div className='ml-auto flex items-center gap-1'>
        <div className='relative' ref={menuRef}>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-muted-foreground hover:text-foreground'
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu((v) => !v);
            }}
          >
            <MoreVertical className='w-4 h-4' />
          </Button>
          {showMenu && (
            <div className='absolute right-0 w-30 bg-[var(--pl-bg)] border border-border rounded-xl shadow-xl z-20 overflow-hidden'>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  navigate(`/sets/${setId}/flashcards/${flashcardId}/update`);
                }}
                className='w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-foreground hover:bg-[var(--pl-bg-hover)] transition-colors cursor-pointer'
              >
                <Edit className='w-3.5 h-3.5 text-muted-foreground' />
                {t('modal.updateButton')}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                  onRequestDeleteFlashcard();
                }}
                className='w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors cursor-pointer'
              >
                <Trash2 className='w-3.5 h-3.5' />
                {t('modal.delete')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
