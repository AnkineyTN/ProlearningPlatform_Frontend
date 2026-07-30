import {
  ArrowLeft,
  FileCode,
  FileText,
  LoaderCircle,
  Layers,
  Printer,
  Share2,
  Sparkles,
  Upload,
  FileDown,
  ChevronDown,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { ShareDialog } from '@/components/collaboration/ShareDialog';
import FavoriteButton from '@/components/favorite/FavoriteButton';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useBackTo } from '@/hooks/useBackTo';
import { cn } from '@/lib/utils';
import { OnlineUsersAvatars } from '@/pages/NotePage/components/OnlineUsersAvatars';
import { useNoteFileUpload } from '@/pages/NotePage/hooks/useNoteFileUpload';
import type { ExportFormat } from '@/pages/NotePage/downloadNoteHtml';
import type { CollabRole } from '@/services/types/collaboration.types';

interface NoteHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSaveTitle?: () => void;
  noteId: number;
  setId: number;
  userRole?: CollabRole;
  onFileUploaded: (file: {
    id: number;
    fileName: string;
    fileUrl: string;
    extension: string;
    publicId: string;
    kind: 'doc' | 'image';
  }) => void;
  onExport: (format: ExportFormat) => void;
  onGenerateFlashcard?: () => void;
  isGeneratingFlashcard?: boolean;
  attachedFileCount?: number;
  showFilesPanel?: boolean;
  onToggleFilesPanel?: () => void;
  aiSummaryCount?: number;
  showAiPanel?: boolean;
  onToggleAiPanel?: () => void;
  onlineUsers?: { name: string; color: string }[];
  isFavorited?: boolean;
}

const togglePillBase =
  'flex items-center gap-2 px-3 h-8 text-sm rounded-md border transition-colors cursor-pointer';
const togglePillActive =
  'bg-[var(--pl-accent-soft)] border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)]';
const togglePillInactive =
  'border-border text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)]';

export const NoteHeader = ({
  title,
  onTitleChange,
  onSaveTitle,
  noteId,
  setId,
  userRole = 'OWNER',
  onFileUploaded,
  onExport,
  onGenerateFlashcard,
  isGeneratingFlashcard = false,
  attachedFileCount = 0,
  showFilesPanel = true,
  onToggleFilesPanel,
  aiSummaryCount = 0,
  showAiPanel = true,
  onToggleAiPanel,
  onlineUsers = [],
  isFavorited = false,
}: NoteHeaderProps) => {
  const navigate = useNavigate();
  const backTo = useBackTo();
  const { t } = useTranslation();
  const { setId: setIdParam } = useParams<{ setId: string }>();
  const _setId = setId || (setIdParam ? Number(setIdParam) : 0);
  const currentUserId = useAuth().user?.id;
  const [shareOpen, setShareOpen] = useState(false);
  const hasWarnedTitleLimitRef = useRef(false);

  const { isUploading, handleFileUpload } = useNoteFileUpload({
    setId: _setId,
    noteId,
    onFileUploaded,
  });

  const TITLE_MAX_LENGTH = 100;

  const handleTitleChange = (value: string) => {
    if (value.length > TITLE_MAX_LENGTH) {
      if (!hasWarnedTitleLimitRef.current) {
        hasWarnedTitleLimitRef.current = true;
        toast.error(t('modal.titleTooLong'));
      }
      onTitleChange(value.slice(0, TITLE_MAX_LENGTH));
      return;
    }
    hasWarnedTitleLimitRef.current = false;
    onTitleChange(value);
  };

  return (
    <>
      <div className='sticky top-0 z-20 bg-[var(--pl-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--pl-bg)]/80 border-b border-border'>
        <div className='flex items-center gap-3 px-6 py-3'>
          <button
            type='button'
            onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            className='flex items-center gap-1.5 text-sm text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] transition-colors cursor-pointer'
          >
            <ArrowLeft className='w-4 h-4' />
            {t('note.header.back')}
          </button>

          <span className='text-border select-none'>·</span>

          <Input
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSaveTitle?.();
                e.currentTarget.blur();
              }
            }}
            placeholder={t('note.header.untitled')}
            className={cn(
              'flex-1 min-w-0 max-w-2xl bg-transparent shadow-none px-2 h-auto py-1 font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight focus-visible:ring-0',
              title.length >= TITLE_MAX_LENGTH
                ? 'border border-[var(--pl-danger)]'
                : 'border-none',
            )}
            readOnly={userRole === 'VIEWER'}
          />

          <div className='flex items-center gap-1.5 ml-auto'>
            <OnlineUsersAvatars users={onlineUsers} />

            <FavoriteButton
              type='NOTE'
              id={noteId}
              isFavorited={isFavorited}
              className='h-9 w-9 rounded-lg border border-[var(--pl-border)]'
            />

            <Button
              variant='ghost'
              size='sm'
              className='gap-2 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
              onClick={() => setShareOpen(true)}
            >
              <Share2 className='w-4 h-4' />
              {t('note.header.share')}
            </Button>

            {userRole !== 'VIEWER' && (
              <>
                {userRole === 'OWNER' && onGenerateFlashcard && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='gap-2 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
                    onClick={onGenerateFlashcard}
                    disabled={isGeneratingFlashcard}
                  >
                    {isGeneratingFlashcard ? (
                      <LoaderCircle className='w-4 h-4 animate-spin' />
                    ) : (
                      <Layers className='w-4 h-4' />
                    )}
                    {t('note.header.generateFlashcard')}
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='gap-2 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
                    >
                      <FileDown className='w-4 h-4' />
                      {t('note.header.export')}
                      <ChevronDown className='w-3 h-3 opacity-60' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-44'>
                    <DropdownMenuItem onClick={() => onExport('md')}>
                      <FileText className='w-4 h-4 mr-2 text-[var(--pl-accent)]' />
                      {t('note.header.exportMarkdown')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport('txt')}>
                      <FileText className='w-4 h-4 mr-2 text-[var(--pl-text-muted)]' />
                      {t('note.header.exportTxt')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport('html')}>
                      <FileCode className='w-4 h-4 mr-2 text-[var(--pl-warning-text)]' />
                      {t('note.header.exportHtml')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport('pdf')}>
                      <Printer className='w-4 h-4 mr-2 text-[var(--pl-danger-text)]' />
                      {t('note.header.exportPdf')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className='relative'>
                  <input
                    type='file'
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className='hidden'
                    id='file-upload'
                    accept='.pdf,.doc,.docx,.txt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.svg,.bmp,.avif'
                  />
                  <label htmlFor='file-upload'>
                    <Button
                      asChild
                      variant='ghost'
                      size='sm'
                      className='gap-2 cursor-pointer text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
                      disabled={isUploading}
                    >
                      <span>
                        {isUploading ? (
                          <LoaderCircle className='w-4 h-4 animate-spin' />
                        ) : (
                          <Upload className='w-4 h-4' />
                        )}
                        {t('note.header.upload')}
                      </span>
                    </Button>
                  </label>
                </div>

                <span className='mx-1 h-5 w-px bg-border' />

                {attachedFileCount > 0 && onToggleFilesPanel ? (
                  <button
                    type='button'
                    onClick={onToggleFilesPanel}
                    className={cn(
                      togglePillBase,
                      showFilesPanel ? togglePillActive : togglePillInactive,
                    )}
                  >
                    <FileText className='w-4 h-4' />
                    {t('note.header.files')}
                    <span className='font-[family-name:var(--font-mono-pl)] text-xs opacity-70'>
                      ({attachedFileCount})
                    </span>
                  </button>
                ) : null}

                {aiSummaryCount > 0 && onToggleAiPanel ? (
                  <button
                    type='button'
                    onClick={onToggleAiPanel}
                    className={cn(
                      togglePillBase,
                      showAiPanel ? togglePillActive : togglePillInactive,
                    )}
                  >
                    <Sparkles className='w-4 h-4' />
                    {t('note.header.ai')}
                    <span className='font-[family-name:var(--font-mono-pl)] text-xs opacity-70'>
                      ({aiSummaryCount})
                    </span>
                  </button>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        setId={_setId}
        resourceType='notes'
        resourceId={noteId}
        userRole={userRole}
        currentUserId={currentUserId}
      />
    </>
  );
};
