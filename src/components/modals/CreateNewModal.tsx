import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

import type { NoteAIGenerateData } from './ai-tab/types';
import CreateAITab, { type AISubmitData } from './CreateAITab';
import CreateNoteAITab from './CreateNoteAITab';
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
  onSubmitNoteAI?: (data: NoteAIGenerateData) => void | Promise<void>;
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
  onSubmitNoteAI,
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
  const [noteAiData, setNoteAiData] = useState<NoteAIGenerateData | null>(null);
  const [aiValid, setAiValid] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

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
    setErrors((prev) => ({
      ...prev,
      titleEmpty: false,
      titleTooLong: value.length >= 100,
    }));
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    setErrors((prev) => ({
      ...prev,
      descriptionTooShort: false,
      descriptionTooLong: value.length >= 500,
    }));
  };

  const handleSubmitManual = async () => {
    const newErrors: ManualErrors = {};
    if (!title.trim()) newErrors.titleEmpty = true;
    if (title.length > 100) newErrors.titleTooLong = true;
    const descriptionLength = description.trim().length;
    if (descriptionLength > 0 && descriptionLength < 3) {
      newErrors.descriptionTooShort = true;
    }
    if (description.length > 500) newErrors.descriptionTooLong = true;
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
    }
  };

  const handleSubmitAI = async () => {
    try {
      if (type === 'Note') {
        if (!noteAiData || !onSubmitNoteAI) return;
        await Promise.resolve(onSubmitNoteAI(noteAiData));
      } else {
        if (!aiData || !onSubmitAI) return;
        await Promise.resolve(onSubmitAI(aiData));
      }
    } catch (err) {
      console.error('CreateNewModal AI submit error', err);
      toast.error(apiErrorMessage(err, t('modal.generateError')));
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

  const handleNoteAIDataChange = useCallback((data: NoteAIGenerateData) => {
    setNoteAiData(data);
  }, []);

  const handleAIValidityChange = useCallback((valid: boolean) => {
    setAiValid(valid);
  }, []);

  const subtitle = t(`modal.subtitle.${typeLower}`, { defaultValue: '' });
  const isAI = mode === 'ai';
  const isNote = type === 'Note';
  const canShowAITab =
    showAITab &&
    !isUpdateMode &&
    setId !== undefined &&
    (isNote
      ? onSubmitNoteAI !== undefined
      : (type === 'Flashcard' || type === 'Exam') && onSubmitAI !== undefined);

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
          isAI && !isNote
            ? 'w-full max-w-4xl sm:max-w-4xl max-h-[90vh] overflow-y-auto'
            : 'w-full max-w-2xl sm:max-w-2xl max-h-[90vh] overflow-y-auto',
        )}
        showCloseButton={!isGenerating}
        onOpenAutoFocus={(e) => {
          if (!isAI) {
            e.preventDefault();
            titleInputRef.current?.focus();
          }
        }}
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
            titleInputRef={titleInputRef}
            description={description}
            onDescriptionChange={handleDescriptionChange}
            errors={errors}
          />
        )}

        {isAI && setId !== undefined && isNote && (
          <CreateNoteAITab
            isLoading={isGenerating}
            onValidityChange={handleAIValidityChange}
            onDataChange={handleNoteAIDataChange}
          />
        )}

        {isAI && setId !== undefined && !isNote && (
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
