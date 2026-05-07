import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import CreateAITab, { type AISubmitData } from './CreateAITab';
import CreateManualTab, {
  type ManualErrors,
} from './create-modal/CreateManualTab';
import CreateModalFooter from './create-modal/CreateModalFooter';
import CreateModeTabs, { type CreateMode } from './create-modal/CreateModeTabs';

type Props = {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    privacy: string;
  }) => void | Promise<void>;
  initialData?: { title: string; description: string; privacy: string };
  isUpdateMode?: boolean;
  // AI props (only for Flashcard / Exam create mode)
  setId?: number;
  showAITab?: boolean;
  onSubmitAI?: (data: AISubmitData) => void | Promise<void>;
  isGenerating?: boolean;
};

const CreateNewModal = ({
  type,
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isUpdateMode,
  setId,
  showAITab = false,
  onSubmitAI,
  isGenerating,
}: Props) => {
  const { t } = useTranslation();
  const typeLower = type.toLowerCase();

  const [mode, setMode] = useState<CreateMode>('manual');
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || '',
  );
  const [privacy, setPrivacy] = useState(initialData?.privacy || 'Public');
  const [errors, setErrors] = useState<ManualErrors>({});

  const [aiData, setAiData] = useState<AISubmitData | null>(null);
  const [aiValid, setAiValid] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode('manual');
      setTitle(initialData?.title || '');
      setDescription(initialData?.description || '');
      setPrivacy(initialData?.privacy || 'Public');
      setErrors({});
    }
  }, [
    isOpen,
    initialData?.title,
    initialData?.description,
    initialData?.privacy,
  ]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (errors.titleEmpty || errors.titleTooLong) {
      setErrors((prev) => ({
        ...prev,
        titleEmpty: false,
        titleTooLong: false,
      }));
    }
  };

  const handlePrivacyChange = (value: string) => {
    setPrivacy(value);
    if (errors.privacy) setErrors((prev) => ({ ...prev, privacy: false }));
  };

  const handleSubmitManual = async () => {
    const newErrors: ManualErrors = {};
    if (!title.trim()) newErrors.titleEmpty = true;
    if (title.length >= 100) newErrors.titleTooLong = true;
    if (!privacy) newErrors.privacy = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await Promise.resolve(onSubmit({ title, description, privacy }));
      window.dispatchEvent(new Event('prolearning:refresh'));
      setTitle('');
      setDescription('');
      setPrivacy('Public');
      setErrors({});
      onClose();
    } catch (err) {
      console.error('CreateNewModal submit error', err);
      toast.error('Failed to create new item. Please try again.');
    }
  };

  const handleSubmitAI = async () => {
    if (!aiData || !onSubmitAI) return;
    try {
      await Promise.resolve(onSubmitAI(aiData));
    } catch (err) {
      console.error('CreateNewModal AI submit error', err);
      toast.error('Failed to generate. Please try again.');
    }
  };

  const handleCancel = () => {
    if (isGenerating) return;
    setTitle('');
    setDescription('');
    setPrivacy('Public');
    setErrors({});
    onClose();
  };

  const handleAIDataChange = useCallback((data: AISubmitData) => {
    setAiData(data);
  }, []);

  const handleAIValidityChange = useCallback((valid: boolean) => {
    setAiValid(valid);
  }, []);

  const subtitle = t(`modal.subtitle.${typeLower}`, { defaultValue: '' });
  const isAI = mode === 'ai';
  const canShowAITab =
    showAITab &&
    !isUpdateMode &&
    (type === 'Flashcard' || type === 'Exam') &&
    setId !== undefined &&
    onSubmitAI !== undefined;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isGenerating) handleCancel();
      }}
    >
      <DialogContent
        className={cn(
          'gap-0 px-8 py-7',
          isAI
            ? 'w-full max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto'
            : 'w-full max-w-2xl sm:max-w-2xl',
        )}
        showCloseButton={!isGenerating}
        onEscapeKeyDown={(e) => {
          if (isGenerating) e.preventDefault();
        }}
        onPointerDownOutside={(e) => {
          if (isGenerating) e.preventDefault();
        }}
      >
        <DialogHeader className='gap-1.5 mb-5'>
          <DialogTitle className='text-2xl font-bold'>
            {isUpdateMode
              ? t('modal.update', { type: typeLower })
              : t('modal.new', { type: typeLower })}
          </DialogTitle>
          {subtitle && !isUpdateMode && (
            <p
              className='text-sm text-muted-foreground italic'
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              {subtitle}
            </p>
          )}
        </DialogHeader>

        {canShowAITab && (
          <CreateModeTabs
            value={mode}
            onChange={setMode}
            disabled={isGenerating}
          />
        )}

        {!isAI && (
          <CreateManualTab
            type={type}
            title={title}
            onTitleChange={handleTitleChange}
            description={description}
            onDescriptionChange={setDescription}
            privacy={privacy}
            onPrivacyChange={handlePrivacyChange}
            errors={errors}
          />
        )}

        {isAI && setId !== undefined && (
          <CreateAITab
            type={type as 'Flashcard' | 'Exam'}
            setId={setId}
            isLoading={isGenerating}
            onValidityChange={handleAIValidityChange}
            onDataChange={handleAIDataChange}
          />
        )}

        <CreateModalFooter
          mode={mode}
          type={type}
          isUpdateMode={isUpdateMode}
          isGenerating={isGenerating}
          aiSubmitDisabled={!aiValid}
          onCancel={handleCancel}
          onSubmit={isAI ? handleSubmitAI : handleSubmitManual}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewModal;
