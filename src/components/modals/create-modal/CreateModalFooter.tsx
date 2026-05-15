import { ArrowLeft, Info, Loader2, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';

import type { CreateMode } from './CreateModeTabs';

type Props = {
  mode: CreateMode;
  type: string;
  isUpdateMode?: boolean;
  isGenerating?: boolean;
  aiSubmitDisabled?: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

const CreateModalFooter = ({
  mode,
  type,
  isUpdateMode,
  isGenerating,
  aiSubmitDisabled,
  onCancel,
  onSubmit,
}: Props) => {
  const { t } = useTranslation();
  const isAI = mode === 'ai';

  const submitLabel = isAI
    ? isGenerating
      ? t('modal.ai.generating', { defaultValue: 'Generating...' })
      : t('modal.ai.generateButton', {
          type,
          defaultValue: 'Generate {{type}}',
        })
    : isUpdateMode
      ? t('modal.updateButton')
      : t('modal.create');

  const submitDisabled = isAI ? aiSubmitDisabled || isGenerating : false;

  return (
    <DialogFooter className='mt-7 sm:justify-between sm:items-center gap-3 border-t border-border pt-4'>
      <p
        className='text-xs text-muted-foreground italic flex items-center gap-1.5 sm:order-first'
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        <Info className='w-3.5 h-3.5 shrink-0' />
        {t('modal.editLaterHint', {
          defaultValue: 'You can edit everything after creating.',
        })}
      </p>
      <div className='flex gap-2 sm:order-last'>
        <Button onClick={onCancel} variant='ghost' disabled={isGenerating}>
          <ArrowLeft className='w-4 h-4' />
          {t('modal.cancel')}
        </Button>
        <Button onClick={onSubmit} variant='default' disabled={submitDisabled}>
          {isAI && isGenerating && <Loader2 className='w-4 h-4 animate-spin' />}
          {isAI && !isGenerating && <Sparkles className='w-4 h-4' />}
          {submitLabel}
        </Button>
      </div>
    </DialogFooter>
  );
};

export default CreateModalFooter;
