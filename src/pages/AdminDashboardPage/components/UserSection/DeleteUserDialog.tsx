import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DeleteUserDialogProps = {
  target: { id: number; label: string } | null;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const DeleteUserDialog = ({
  target,
  isPending,
  onClose,
  onConfirm,
}: DeleteUserDialogProps) => {
  const { t } = useTranslation();

  return (
    <AlertDialog open={target != null} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t('adminDashboard.deleteConfirmTitle')}
          </AlertDialogTitle>
          <AlertDialogDescription className='break-words'>
            {t('adminDashboard.deleteConfirmDescription', {
              name: target?.label ?? '',
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('adminDashboard.cancel')}</AlertDialogCancel>
          <Button
            type='button'
            variant='destructive'
            disabled={isPending || target == null}
            onClick={() => {
              if (target) onConfirm(target.id);
            }}
          >
            {t('adminDashboard.deleteConfirmAction')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
