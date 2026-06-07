import { Save, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ProfileSaveBarProps {
  loading: boolean;
  isDirty: boolean;
  onCancel: () => void;
  onSave: () => void;
}

export default function ProfileSaveBar({
  loading,
  isDirty,
  onCancel,
  onSave,
}: ProfileSaveBarProps) {
  const { t } = useTranslation();

  return (
    <div className='flex justify-end gap-2.5 py-5 sticky bottom-20'>
      <Button
        type='button'
        variant='outline'
        disabled={loading}
        onClick={onCancel}
        className='rounded-full text-[13px] text-[var(--pl-text-muted)]'
      >
        <X className='w-3.5 h-3.5' />
        {t('profile.actions.cancel')}
      </Button>
      <Button
        type='button'
        disabled={loading || !isDirty}
        onClick={onSave}
        className='rounded-full text-[13px] font-medium'
      >
        <Save className='w-3.5 h-3.5' />
        {loading ? t('profile.actions.saving') : t('profile.actions.save')}
      </Button>
    </div>
  );
}
