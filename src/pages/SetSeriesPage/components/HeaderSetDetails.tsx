import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import {
  BookOpen,
  Brain,
  ChevronRight,
  History,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';

import CreateNewModal from '@/components/modals/CreateNewModal';
import DeleteConfirmDialog from '@/components/modals/DeleteConfirmDialog';
import KnowledgeAnalysisDialog from '@/components/analysis/KnowledgeAnalysisDialog';
import AnalysisHistoryDialog from '@/components/analysis/AnalysisHistoryDialog';
import { useDeleteSet, useSet, useUpdateSet } from '@/hooks/useSets';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type Props = { setId: string };

function modalPrivacyFromApi(privacy: string | undefined): string {
  return privacy?.toUpperCase() === 'PRIVATE' ? 'Private' : 'Public';
}

const HeaderSetDetails = ({ setId }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const id = Number(setId);
  const { data: setDetail, isLoading, isError } = useSet(id);
  const updateSetMutation = useUpdateSet();
  const deleteSetMutation = useDeleteSet();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [showAnalysisHistory, setShowAnalysisHistory] = useState(false);

  const handleUpdateSubmit = async (data: {
    title: string;
    description: string;
    privacy: string;
  }) => {
    await updateSetMutation.mutateAsync({
      id,
      payload: {
        title: data.title.trim(),
        description: data.description.trim(),
        privacy: setDetail?.privacy === 'PRIVATE' ? 'PRIVATE' : 'PUBLIC',
      },
    });
    toast.success(
      t('toast.setUpdated', { defaultValue: 'Set updated successfully' }),
    );
    setIsUpdateModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteSetMutation.mutateAsync(id);
      toast.success(
        t('toast.setDeleted', { defaultValue: 'Set deleted successfully' }),
      );
      setShowDeleteDialog(false);
      navigate('/sets');
    } catch (error) {
      toast.error(
        apiErrorMessage(
          error,
          t('toast.setDeleteFailed', { defaultValue: 'Failed to delete set' }),
        ),
      );
    }
  };

  const titleDisplay = setDetail?.title ?? '';
  const descriptionDisplay = setDetail?.description ?? '';

  return (
    <>
      {/* Breadcrumb */}
      <div className='px-10 pt-[18px] flex items-center gap-[6px] text-[12px] text-[var(--pl-text-faint)]'>
        <button
          onClick={() => navigate('/sets')}
          className='bg-transparent border-0 cursor-pointer text-[12px] text-[var(--pl-text-faint)] hover:text-[var(--pl-text-muted)]'
        >
          {t('set.breadcrumb')}
        </button>
        <ChevronRight size={11} />
        <span className='text-[var(--pl-text-muted)]'>
          {titleDisplay || '…'}
        </span>
      </div>

      {/* Hero */}
      <div className='px-10 pt-5 pb-7 border-b border-b-[var(--pl-border)]'>
        <div className='flex items-start gap-6'>
          {/* Icon */}
          <div
            className='w-20 h-20 rounded-[18px] shrink-0 border border-[var(--pl-border)] grid place-items-center text-[var(--pl-accent)] relative overflow-hidden'
            style={{
              background:
                'linear-gradient(135deg, var(--pl-accent-soft), oklch(var(--pl-accent-l) var(--pl-accent-c) var(--pl-accent-h) / 0.06))',
            }}
          >
            <BookOpen size={32} />
            <div
              className='absolute inset-0'
              style={{
                background:
                  'repeating-linear-gradient(135deg, transparent 0 14px, oklch(var(--pl-accent-l) var(--pl-accent-c) var(--pl-accent-h) / 0.05) 14px 15px)',
              }}
            />
          </div>

          {/* Info */}
          <div className='flex-1 min-w-0'>
            {isLoading ? (
              <div className='flex items-center gap-2 text-[var(--pl-text-muted)] pt-5'>
                <Loader2 size={18} className='animate-spin' />
                <span className='text-[14px]'>
                  {t('common.loading', { defaultValue: 'Loading…' })}
                </span>
              </div>
            ) : isError ? (
              <p className='text-[14px] text-[var(--pl-danger,oklch(0.65_0.2_25))] pt-5'>
                {t('set.header.loadError', {
                  defaultValue: 'Could not load set details.',
                })}
              </p>
            ) : (
              <>
                <h1
                  style={{ fontFamily: 'var(--font-display)' }}
                  className='text-[36px] font-bold tracking-[-0.025em] text-[var(--pl-text)] m-0 mb-[6px] leading-[1.1] overflow-hidden text-ellipsis whitespace-nowrap'
                >
                  {titleDisplay || '—'}
                </h1>
                {descriptionDisplay && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className='text-[14px] text-[var(--pl-text-muted)] m-0 mb-4 max-w-200 line-clamp-2 cursor-default break-words'>
                        {descriptionDisplay}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent className='max-w-[400px] whitespace-normal break-words'>
                      {descriptionDisplay}
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className='flex flex-col gap-2 items-end shrink-0'>
            <div className='flex items-center gap-2'>
              {/* Knowledge Analysis CTA */}
              {!isLoading && !isError && setDetail && (
                <>
                  <Button
                    onClick={() => setShowAnalysisDialog(true)}
                    className='rounded-full font-semibold text-[13px] flex items-center gap-2 border-0 cursor-pointer transition-[opacity] duration-150 hover:opacity-[0.88]'
                  >
                    <Brain size={14} strokeWidth={2.5} />
                    {t('set.header.analyzeKnowledge', {
                      defaultValue: 'Analyze my knowledge',
                    })}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setShowAnalysisHistory(true)}
                        className='w-[34px] h-[34px] rounded-lg border border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] cursor-pointer transition-[background] duration-150 hover:bg-[var(--pl-bg-hover)]'
                      >
                        <History size={14} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {t('analysis.history.action', {
                        defaultValue: 'View past analyses',
                      })}
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
              <div className='w-px h-5 bg-[var(--pl-border)]' />
              <Button
                variant={'ghost'}
                size={'icon'}
                onClick={() => setIsUpdateModalOpen(true)}
                disabled={isLoading || isError || !setDetail}
                className='w-[34px] h-[34px] rounded-lg border border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] cursor-pointer transition-[background] duration-150 hover:bg-[var(--pl-bg-hover)] disabled:opacity-40 disabled:cursor-not-allowed'
              >
                <Pencil size={14} />
              </Button>
              <div className='relative'>
                <Button
                  variant={'ghost'}
                  size={'icon'}
                  onClick={() => setShowActionsMenu((v) => !v)}
                  className='w-[34px] h-[34px] grid place-items-center rounded-lg border border-[var(--pl-border)] bg-transparent text-[var(--pl-text-muted)] cursor-pointer'
                >
                  <MoreHorizontal size={14} />
                </Button>
                {showActionsMenu && (
                  <div className='absolute top-[calc(100%+6px)] right-0 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[10px] p-1 z-50 min-w-[140px] shadow-[0_8px_24px_oklch(0_0_0/0.12)]'>
                    <Button
                      variant={'ghost'}
                      className='w-full flex items-center gap-2 px-3 py-2 rounded-[7px] text-[13px] text-[oklch(0.65_0.2_25)] bg-transparent border-0 cursor-pointer text-left hover:bg-[oklch(0.65_0.2_25/0.1)]'
                      onClick={() => {
                        setShowActionsMenu(false);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 size={14} />
                      {t('set.header.deleteSet')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isUpdateModalOpen && setDetail && (
        <CreateNewModal
          key={`set-${setDetail.id}`}
          type='Set'
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          onSubmit={handleUpdateSubmit}
          initialData={{
            title: setDetail.title,
            description: setDetail.description ?? '',
            privacy: modalPrivacyFromApi(setDetail.privacy),
          }}
          isUpdateMode
        />
      )}

      <DeleteConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title={t('modal.deleteConfirmationTitle')}
        itemName={`"${titleDisplay || t('set.thisSet', { defaultValue: 'this set' })}"`}
      />

      {showAnalysisDialog && (
        <KnowledgeAnalysisDialog
          open={showAnalysisDialog}
          onOpenChange={setShowAnalysisDialog}
          target={{ kind: 'set', setId: id }}
        />
      )}

      {showAnalysisHistory && (
        <AnalysisHistoryDialog
          open={showAnalysisHistory}
          onOpenChange={setShowAnalysisHistory}
          target={{ kind: 'set', setId: id }}
        />
      )}
    </>
  );
};

export default HeaderSetDetails;
