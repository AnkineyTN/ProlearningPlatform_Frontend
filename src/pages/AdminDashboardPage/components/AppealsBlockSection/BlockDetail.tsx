import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AdminUserDirectoryRow } from '@/services/types/adminUsers.types';
import Avatar from './Avatar';
import Field from './Field';
import Panel from './Panel';

type Props = {
  row: AdminUserDirectoryRow;
  isUnblocking: boolean;
  onUnblock: () => void;
};

const BlockDetail = ({ row, isUnblocking, onUnblock }: Props) => {
  const { t } = useTranslation();
  const u = row.user;
  const name = `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;

  return (
    <div className='flex flex-col gap-[22px] max-w-[760px]'>
      <div className='flex items-center gap-4'>
        <Avatar name={name} size={56} />
        <div className='flex-1 min-w-0'>
          <div className='text-[10.5px] tracking-[0.16em] uppercase text-muted-foreground mb-1'>
            Blocked account · #{u.id}
          </div>
          <div className='font-[family-name:var(--font-display)] text-[30px] font-medium tracking-tight leading-[1.1]'>
            {name}
          </div>
          <div className='text-[13px] text-muted-foreground font-[family-name:var(--font-mono-pl)] mt-1'>
            {u.email}
          </div>
        </div>
        <span className='inline-flex items-center px-[9px] py-[3px] rounded-full text-[11px] font-[family-name:var(--font-mono-pl)] tracking-[0.04em] bg-red-500/14 text-red-500 border border-red-500/40'>
          {t('adminDashboard.blocked').toLowerCase()}
        </span>
      </div>

      <Panel>
        <div className='p-4 px-[22px] grid grid-cols-2 gap-[18px]'>
          <Field
            label={t('adminDashboard.blockReason')}
            value={u.blockReason ?? '—'}
          />
          <Field
            label={t('adminDashboard.colAccountType')}
            value={u.accountType ?? 'FREE'}
          />
          <Field
            label={t('adminDashboard.colEducation')}
            value={u.education ?? '—'}
          />
          <Field
            label={t('adminDashboard.colHearAppFrom')}
            value={u.hearAppFrom ?? '—'}
          />
        </div>
      </Panel>

      <div className='sticky bottom-0 bg-[var(--pl-bg)] border-t border-border pt-4 pb-2 flex gap-2.5 items-center'>
        <div className='flex-1 text-xs text-muted-foreground'>
          {t('adminDashboard.appealsEmpty')}
        </div>
        <Button
          size='sm'
          className='gap-1.5 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] hover:opacity-90'
          disabled={isUnblocking}
          onClick={onUnblock}
        >
          <ShieldCheck className='w-3.5 h-3.5' />
          {t('adminDashboard.unblockUser')}
        </Button>
      </div>
    </div>
  );
};

export default BlockDetail;
