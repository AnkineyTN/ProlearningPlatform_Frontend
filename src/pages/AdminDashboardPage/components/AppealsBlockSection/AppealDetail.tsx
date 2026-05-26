import { useTranslation } from 'react-i18next';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type AppealDto } from '@/services/endpoints/appeals';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import Panel from './Panel';

type Props = {
  appeal: AppealDto;
  isReviewing: boolean;
  onAccept: () => void;
  onReject: () => void;
};

const AppealDetail = ({ appeal, isReviewing, onAccept, onReject }: Props) => {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col gap-[22px] max-w-[760px]'>
      <div className='flex items-center gap-4'>
        <Avatar name={appeal.email.split('@')[0]} size={56} />
        <div className='flex-1 min-w-0'>
          <div className='text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground mb-1'>
            Appeal · #{appeal.id}
          </div>
          <div className='font-[family-name:var(--font-display)] text-[30px] font-medium tracking-tight leading-[1.1]'>
            {appeal.email.split('@')[0]}
          </div>
          <div className='text-[13px] text-muted-foreground font-[family-name:var(--font-mono-pl)] mt-1'>
            {appeal.email}
            {appeal.userId && ` · #${appeal.userId}`}
          </div>
        </div>
        <StatusBadge status={appeal.status} />
      </div>

      <Panel>
        <div className='p-4 px-[22px] border-b border-border flex justify-between items-center'>
          <div className='flex items-center gap-2.5'>
            <FileText className='w-3.5 h-3.5 text-[var(--pl-accent)]' />
            <span className='font-[family-name:var(--font-display)] text-base font-medium'>
              Appeal reason
            </span>
          </div>
          <span className='text-[11px] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
            submitted {new Date(appeal.createdAt).toLocaleDateString()}
          </span>
        </div>
        <div className='p-5 px-[22px] text-[15px] leading-relaxed'>
          <span className='font-[family-name:var(--font-display)] text-[32px] text-[var(--pl-accent)] float-left leading-[0.9] mr-1 mt-1.5'>
            &ldquo;
          </span>
          {appeal.reason}
        </div>
      </Panel>

      {appeal.status !== 'PENDING' && (
        <Panel
          className={
            appeal.status === 'ACCEPTED'
              ? '!bg-green-500/5 !border-green-500/30'
              : '!bg-red-500/5 !border-red-500/30'
          }
        >
          <div className='p-3.5 px-[22px] flex items-center gap-2.5'>
            {appeal.status === 'ACCEPTED' ? (
              <CheckCircle className='w-3.5 h-3.5 text-green-500' />
            ) : (
              <XCircle className='w-3.5 h-3.5 text-red-500' />
            )}
            <div className='flex-1'>
              <div className='text-[13px] font-medium'>
                {appeal.status === 'ACCEPTED'
                  ? 'Approved · unblocked'
                  : 'Rejected'}
              </div>
              {appeal.adminNote && (
                <div className='text-[11px] text-muted-foreground font-[family-name:var(--font-mono-pl)] mt-0.5'>
                  {appeal.adminNote}
                </div>
              )}
            </div>
          </div>
        </Panel>
      )}

      {appeal.status === 'PENDING' && (
        <div className='sticky bottom-0 bg-[var(--pl-bg)] border-t border-border pt-4 pb-2 flex gap-2.5 items-center'>
          <div className='flex-1 text-xs text-muted-foreground'>
            Your decision will be sent to{' '}
            <span className='text-foreground font-[family-name:var(--font-mono-pl)]'>
              {appeal.email}
            </span>
          </div>
          <Button
            variant='outline'
            size='sm'
            className='gap-1.5 text-red-500 border-red-500/40 hover:bg-red-500/10'
            disabled={isReviewing}
            onClick={onReject}
          >
            <XCircle className='w-3.5 h-3.5' />
            {t('adminDashboard.appealReject')}
          </Button>
          <Button
            size='sm'
            className='gap-1.5 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:opacity-90'
            disabled={isReviewing}
            onClick={onAccept}
          >
            <CheckCircle className='w-3.5 h-3.5' />
            {t('adminDashboard.appealAccept')} & unblock
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppealDetail;
