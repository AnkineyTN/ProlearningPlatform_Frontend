import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  isPending: boolean;
  onCreateClick: () => void;
};

export default function SetListHeader({ isPending, onCreateClick }: Props) {
  const { t } = useTranslation();
  return (
    <div className='flex items-end justify-between mb-6'>
      <div>
        <p
          className='text-[11px] uppercase tracking-[0.16em] mb-2'
          style={{ color: 'var(--pl-text-faint)' }}
        >
          {t('setlist.your_workspace')}
        </p>
        <h1
          className='text-[42px] font-[400] leading-none'
          style={{
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.03em',
            color: 'var(--pl-text)',
          }}
        >
          {t('sidebar.setList')}
        </h1>
      </div>
      <button
        onClick={onCreateClick}
        disabled={isPending}
        className='flex items-center gap-2 px-5 py-[10px] rounded-full text-[13px] font-[500] transition-opacity disabled:opacity-50'
        style={{ background: 'var(--pl-accent)', color: 'var(--pl-accent-fg)' }}
      >
        <Plus size={13} strokeWidth={2} />
        {isPending ? t('setlist.creating') : t('setlist.new_set')}
      </button>
    </div>
  );
}
