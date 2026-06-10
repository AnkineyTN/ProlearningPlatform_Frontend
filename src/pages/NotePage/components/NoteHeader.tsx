import {
  ArrowLeft,
  FileCode,
  FileText,
  LoaderCircle,
  Share2,
  Sparkles,
  Upload,
  FileDown,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { ShareDialog } from '@/components/collaboration/ShareDialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { OnlineUsersAvatars } from '@/pages/NotePage/components/OnlineUsersAvatars';
import { useNoteFileUpload } from '@/pages/NotePage/hooks/useNoteFileUpload';
import type { ExportFormat } from '@/pages/NotePage/downloadNoteHtml';
import type { CollabRole } from '@/services/types/collaboration.types';

interface NoteHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
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
  attachedFileCount?: number;
  showFilesPanel?: boolean;
  onToggleFilesPanel?: () => void;
  aiSummaryCount?: number;
  showAiPanel?: boolean;
  onToggleAiPanel?: () => void;
  onlineUsers?: { name: string; color: string }[];
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
  noteId,
  setId,
  userRole = 'OWNER',
  onFileUploaded,
  onExport,
  attachedFileCount = 0,
  showFilesPanel = true,
  onToggleFilesPanel,
  aiSummaryCount = 0,
  showAiPanel = true,
  onToggleAiPanel,
  onlineUsers = [],
}: NoteHeaderProps) => {
  const navigate = useNavigate();
  const { setId: setIdParam } = useParams<{ setId: string }>();
  const _setId = setId || (setIdParam ? Number(setIdParam) : 0);
  const currentUserId = useAuth().user?.id;
  const [shareOpen, setShareOpen] = useState(false);

  const { isUploading, handleFileUpload } = useNoteFileUpload({
    setId: _setId,
    noteId,
    onFileUploaded,
  });

  return (
    <>
      <div className='sticky top-0 z-20 bg-[var(--pl-bg)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--pl-bg)]/80 border-b border-border'>
        <div className='flex items-center gap-3 px-6 py-3'>
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='flex items-center gap-1.5 text-sm text-[var(--pl-text-muted)] hover:text-[var(--pl-text)] transition-colors cursor-pointer'
          >
            <ArrowLeft className='w-4 h-4' />
            Back
          </button>

          <span className='text-border select-none'>·</span>

          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder='Untitled Note'
            className='flex-1 min-w-0 max-w-2xl border-none bg-transparent shadow-none px-2 h-auto py-1 font-[family-name:var(--font-display)] text-2xl font-medium tracking-tight focus-visible:ring-0'
            readOnly={userRole === 'VIEWER'}
          />

          <div className='flex items-center gap-1.5 ml-auto'>
            <OnlineUsersAvatars users={onlineUsers} />

            <Button
              variant='ghost'
              size='sm'
              className='gap-2 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
              onClick={() => setShareOpen(true)}
            >
              <Share2 className='w-4 h-4' />
              Share
            </Button>

            {userRole !== 'VIEWER' && (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='gap-2 text-[var(--pl-text-muted)] hover:text-[var(--pl-text)]'
                    >
                      <FileDown className='w-4 h-4' />
                      Export
                      <ChevronDown className='w-3 h-3 opacity-60' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='w-44'>
                    <DropdownMenuItem onClick={() => onExport('md')}>
                      <FileText className='w-4 h-4 mr-2 text-[var(--pl-accent)]' />
                      Markdown (.md)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport('txt')}>
                      <FileText className='w-4 h-4 mr-2 text-[var(--pl-text-muted)]' />
                      Plain text (.txt)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onExport('html')}>
                      <FileCode className='w-4 h-4 mr-2 text-[var(--pl-warning-text)]' />
                      HTML (.html)
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
                        Upload
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
                    Files
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
                    AI
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
