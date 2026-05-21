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

interface SubmitExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  answeredCount: number;
  totalQuestions: number;
  isSubmitting: boolean;
  onConfirm: () => void;
}

export default function SubmitExamDialog({
  open,
  onOpenChange,
  answeredCount,
  totalQuestions,
  isSubmitting,
  onConfirm,
}: SubmitExamDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('exam.taking.submitTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('exam.taking.submitConfirm', {
              answered: answeredCount,
              total: totalQuestions,
            })}
            {answeredCount < totalQuestions && (
              <span
                className='block mt-2'
                style={{ color: 'var(--pl-warning)' }}
              >
                {t('exam.taking.unansweredWarning')}
              </span>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('exam.taking.continueExam')}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isSubmitting}
            onClick={() => {
              onOpenChange(false);
              onConfirm();
            }}
          >
            {t('exam.taking.submitExam')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
