import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

type AdminPageHeaderProps = {
  isFetching: boolean;
  onRefresh: () => void;
};

const AdminPageHeader = ({ isFetching, onRefresh }: AdminPageHeaderProps) => {
  const { t } = useTranslation();

  return (
    <div className='relative rounded-2xl border border-border bg-[var(--pl-bg)] overflow-hidden px-8 py-8'>
      <div
        className='absolute inset-0 pointer-events-none'
        style={{
          background:
            'radial-gradient(circle at 10% 50%, rgb(196 196 196 / 12%), transparent 55%)',
        }}
      />
      <div className='relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <Link
            to='/dashboard'
            className='inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3'
          >
            <ArrowLeft className='w-3.5 h-3.5' />
            {t('adminDashboard.backToDashboard')}
          </Link>
          <h1 className='font-[family-name:var(--font-display)] italic text-4xl font-normal tracking-tight leading-none mb-2'>
            {t('adminDashboard.title')}
          </h1>
          <p className='text-muted-foreground text-sm'>
            {t('adminDashboard.description')}
          </p>
        </div>
        <Button
          variant='outline'
          size='sm'
          onClick={onRefresh}
          disabled={isFetching}
          className='gap-2 shrink-0'
        >
          <RefreshCw
            className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`}
          />
          {t('adminDashboard.refresh')}
        </Button>
      </div>
    </div>
  );
};

export default AdminPageHeader;
