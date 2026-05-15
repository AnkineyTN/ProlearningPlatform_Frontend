import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName?: string;
};

const DeleteConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
}: Props) => {
  const { t } = useTranslation();
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className='max-w-sm rounded-2xl border-border bg-[var(--pl-bg)] transition-[background] duration-300'>
        <AlertDialogHeader>
          <div className='flex flex-col items-center text-center gap-4 mb-1'>
            <div className='w-12 h-12 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center'>
              <Trash2 className='w-5 h-5 text-destructive' />
            </div>
            <div>
              <AlertDialogTitle className='font-[family-name:var(--font-display)] text-xl font-medium tracking-wider'>
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription className='text-sm text-muted-foreground mt-1.5'>
                {t('modal.deleteConfirmation')} {itemName ? `${itemName}` : ''}?
                <span className='block mt-1 text-muted-foreground/70'>
                  {t('modal.deleteConfirmationWarning')}
                </span>
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className='flex gap-2 mt-1'>
          <AlertDialogCancel className='flex-1 cursor-pointer rounded-xl'>
            {t('modal.cancel')}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className='flex-1 cursor-pointer rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground'
          >
            {t('modal.delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmDialog;
