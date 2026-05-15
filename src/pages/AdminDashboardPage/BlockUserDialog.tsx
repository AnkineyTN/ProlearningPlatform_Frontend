import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type BlockUserDialogProps = {
  open: boolean;
  userName: string;
  reason: string;
  isSaving: boolean;
  onReasonChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

const BlockUserDialog = ({
  open,
  userName,
  reason,
  isSaving,
  onReasonChange,
  onClose,
  onConfirm,
}: BlockUserDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>{t('adminDashboard.blockDialogTitle')}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <p className='text-sm text-muted-foreground'>
            {t('adminDashboard.blockDialogDesc', { name: userName })}
          </p>
          <div className='space-y-2'>
            <Label htmlFor='block-reason'>
              {t('adminDashboard.blockReason')}
            </Label>
            <Textarea
              id='block-reason'
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder={t('adminDashboard.blockReasonPlaceholder')}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            {t('adminDashboard.cancel')}
          </Button>
          <Button
            type='button'
            variant='destructive'
            onClick={onConfirm}
            disabled={isSaving || reason.trim() === ''}
          >
            {t('adminDashboard.blockConfirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BlockUserDialog;
