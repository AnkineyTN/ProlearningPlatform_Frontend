import { Bell, Edit, Link2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';

type Props = {
  onUpdate: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onNotificationSettings?: (e: React.MouseEvent) => void;
  onCopyLink?: (e: React.MouseEvent) => void;
};

const DropdownMenu = ({
  onUpdate,
  onDelete,
  onNotificationSettings,
  onCopyLink,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div className='absolute right-0 mt-1 w-48 bg-[var(--pl-bg)] border border-border rounded-lg shadow-lg z-10 overflow-hidden'>
      {onNotificationSettings && (
        <Button
          variant='ghost'
          onClick={onNotificationSettings}
          className='w-full transition-colors cursor-pointer flex justify-start pl-3 items-center gap-2'
        >
          <Bell className='w-4 h-4' />
          {t('setCard.notificationSettings', {
            defaultValue: 'Notification settings',
          })}
        </Button>
      )}
      <Button
        variant='ghost'
        onClick={onUpdate}
        className='w-full transition-colors cursor-pointer flex justify-start pl-3 items-center gap-2'
      >
        <Edit className='w-4 h-4' />
        {t('modal.updateButton')}
      </Button>
      {onCopyLink && (
        <Button
          variant='ghost'
          onClick={onCopyLink}
          className='w-full transition-colors cursor-pointer flex justify-start pl-3 items-center gap-2'
        >
          <Link2 className='w-4 h-4' />
          {t('common.copyLink')}
        </Button>
      )}
      <Button
        variant='ghost'
        onClick={onDelete}
        className='w-full text-destructive hover:text-[var(--pl-danger)] transition-colors cursor-pointer flex justify-start pl-3 items-center gap-2'
      >
        <Trash2 className='w-4 h-4' />
        {t('modal.delete')}
      </Button>
    </div>
  );
};

export default DropdownMenu;
