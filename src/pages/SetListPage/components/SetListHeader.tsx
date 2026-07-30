import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  isPending: boolean;
  onCreateClick: () => void;
};

export default function SetListHeader({ isPending, onCreateClick }: Props) {
  const { t } = useTranslation();
  return (
    <div className='flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6'>
      <div>
        <p
          className='text-[11px] uppercase tracking-[0.16em] mb-2'
          style={{ color: 'var(--pl-text-faint)' }}
        >
          {t('setlist.your_workspace')}
        </p>
        <h1
          className='text-[32px] sm:text-[42px] font-[400] leading-none'
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.03em',
            color: 'var(--pl-text)',
          }}
        >
          {t('sidebar.setList')}
        </h1>
      </div>
      <Button
        onClick={onCreateClick}
        disabled={isPending}
        className='rounded-full disabled:opacity-50 self-start sm:self-auto'
      >
        <Plus size={13} strokeWidth={2} />
        {isPending ? t('setlist.creating') : t('setlist.new_set')}
      </Button>
    </div>
  );
}
