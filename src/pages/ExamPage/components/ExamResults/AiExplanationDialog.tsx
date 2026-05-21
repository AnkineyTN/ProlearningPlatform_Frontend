import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface AiExplanationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading: boolean;
  explanation: string;
}

export default function AiExplanationDialog({
  open,
  onOpenChange,
  loading,
  explanation,
}: AiExplanationDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Sparkles className='w-5 h-5 text-purple-500' />
            {t('exam.results.aiExplanation')}
          </DialogTitle>
        </DialogHeader>
        <div className='mt-2'>
          {loading ? (
            <div className='flex flex-col items-center gap-3 py-8 text-muted-foreground'>
              <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin' />
              <p className='text-sm'>
                {t('exam.results.generatingExplanation')}
              </p>
            </div>
          ) : (
            <p className='text-sm whitespace-pre-wrap leading-relaxed'>
              {explanation}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
