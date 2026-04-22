import { Edit, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

type Props = {
  onUpdate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
};

const DropdownMenu = ({ onUpdate, onDelete }: Props) => {
  const { t } = useTranslation();
  return (
    <div className='absolute right-0 mt-1 w-30 bg-[var(--pl-bg)] border border-border rounded-lg shadow-lg z-10 overflow-hidden'>
      <Button
        variant='ghost'
        onClick={onUpdate}
        className='w-full transition-colors cursor-pointer flex justify-start pl-3 items-center gap-2'
      >
        <Edit className='w-4 h-4' />
        {t('modal.updateButton')}
      </Button>
      <Button
        variant='ghost'
        onClick={onDelete}
        className='w-full text-destructive hover:text-red-500 transition-colors cursor-pointer flex justify-start pl-3 items-center gap-2'
      >
        <Trash2 className='w-4 h-4' />
        {t('modal.delete')}
      </Button>
    </div>
  );
};

export default DropdownMenu;
