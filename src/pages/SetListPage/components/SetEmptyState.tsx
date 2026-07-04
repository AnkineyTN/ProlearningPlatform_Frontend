import { FolderX } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type Props = {
  isFiltered?: boolean;
  onCreateClick: () => void;
};

export default function SetEmptyState({ isFiltered, onCreateClick }: Props) {
  const { t } = useTranslation();

  return (
    <div className='flex flex-col items-center justify-center py-20'>
      <FolderX
        size={56}
        style={{ color: 'var(--pl-border-strong)' }}
        className='mb-5'
      />
      <h3
        className='text-[18px] font-[500] mb-2'
        style={{ color: 'var(--pl-text)' }}
      >
        {isFiltered
          ? t('setlist.noResultsTitle', { defaultValue: 'No sets found' })
          : t('setlist.emptyTitle', { defaultValue: 'No sets yet' })}
      </h3>
      <p
        className={cn('text-[13px]', !isFiltered && 'mb-6')}
        style={{ color: 'var(--pl-text-muted)' }}
      >
        {isFiltered
          ? t('setlist.noResultsDescription', {
              defaultValue: 'Try adjusting your search or filters',
            })
          : t('setlist.emptyDescription', {
              defaultValue: 'Create your first study set to get started',
            })}
      </p>
      {!isFiltered && (
        <Button onClick={onCreateClick}>
          {t('setlist.createButton', {
            defaultValue: 'Create your first set',
          })}
        </Button>
      )}
    </div>
  );
}
