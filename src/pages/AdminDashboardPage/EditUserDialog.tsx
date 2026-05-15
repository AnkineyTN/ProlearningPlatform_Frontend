import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type EditUserDialogProps = {
  open: boolean;
  firstName: string;
  lastName: string;
  accountType: string;
  isSaving: boolean;
  onFirstNameChange: (v: string) => void;
  onLastNameChange: (v: string) => void;
  onAccountTypeChange: (v: string) => void;
  onClose: () => void;
  onSave: () => void;
};

const EditUserDialog = ({
  open,
  firstName,
  lastName,
  accountType,
  isSaving,
  onFirstNameChange,
  onLastNameChange,
  onAccountTypeChange,
  onClose,
  onSave,
}: EditUserDialogProps) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent showCloseButton>
        <DialogHeader>
          <DialogTitle>{t('adminDashboard.editDialogTitle')}</DialogTitle>
        </DialogHeader>
        <div className='space-y-4 py-2'>
          <div className='space-y-2'>
            <Label htmlFor='admin-edit-first'>
              {t('adminDashboard.fieldFirstName')}
            </Label>
            <Input
              id='admin-edit-first'
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              autoComplete='off'
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='admin-edit-last'>
              {t('adminDashboard.fieldLastName')}
            </Label>
            <Input
              id='admin-edit-last'
              value={lastName}
              onChange={(e) => onLastNameChange(e.target.value)}
              autoComplete='off'
            />
          </div>
          <div className='space-y-2'>
            <Label>{t('adminDashboard.fieldAccountType')}</Label>
            <Select
              value={accountType === '' ? '__unset__' : accountType}
              onValueChange={(v) =>
                onAccountTypeChange(v === '__unset__' ? '' : v)
              }
            >
              <SelectTrigger className='w-full'>
                <SelectValue
                  placeholder={t('adminDashboard.accountTypeUnset')}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='__unset__'>
                  {t('adminDashboard.accountTypeUnset')}
                </SelectItem>
                <SelectItem value='FREE'>FREE</SelectItem>
                <SelectItem value='PRO'>PRO</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type='button' variant='outline' onClick={onClose}>
            {t('adminDashboard.cancel')}
          </Button>
          <Button
            type='button'
            onClick={onSave}
            disabled={
              isSaving || firstName.trim() === '' || lastName.trim() === ''
            }
          >
            {t('adminDashboard.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
