import {
  AlignJustify,
  ArrowLeft,
  Earth,
  EarthLock,
  Heading,
  Lock,
  LockKeyhole,
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Props = {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSubmit: (data: {
    title: string;
    description: string;
    privacy: string;
  }) => void | Promise<void>;
  initialData?: { title: string; description: string; privacy: string };
  isUpdateMode?: boolean;
};

const CreateNewModal = ({
  type,
  isOpen,
  onClose,
  onBack,
  onSubmit,
  initialData,
  isUpdateMode,
}: Props) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || '',
  );
  const [privacy, setPrivacy] = useState(initialData?.privacy || 'Public');
  const [errors, setErrors] = useState<{
    titleEmpty?: boolean;
    titleTooLong?: boolean;
    privacy?: boolean;
  }>({});
  const { t } = useTranslation();
  const typeLower = type.toLowerCase();

  const handleSubmit = async () => {
    const newErrors: {
      titleEmpty?: boolean;
      titleTooLong?: boolean;
      privacy?: boolean;
    } = {};

    if (!title.trim()) {
      newErrors.titleEmpty = true;
    }

    if (title.length >= 100) {
      newErrors.titleTooLong = true;
    }

    if (!privacy) {
      newErrors.privacy = true;
    }

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

  const handleCancel = () => {
    if (onBack) {
      onBack();
    } else {
      setTitle('');
      setDescription('');
      setPrivacy('Public');
      setErrors({});
      onClose();
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (errors.titleEmpty || errors.titleTooLong) {
      setErrors((prev) => ({
        ...prev,
        titleEmpty: false,
        titleTooLong: false,
      }));
    }
  };

  const handlePrivacyChange = (val: string) => {
    setPrivacy(val);
    if (errors.privacy) {
      setErrors((prev) => ({ ...prev, privacy: false }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className='w-full max-w-xl sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {isUpdateMode
              ? t('modal.update', { type: typeLower })
              : t('modal.new', { type: typeLower })}
          </DialogTitle>
        </DialogHeader>

        {/* Form */}
        <div className='space-y-4'>
          {/* Set Title */}
          <div>
            <Label className='flex items-center gap-2 font-medium mb-3'>
              <Heading className='w-4 h-4' />
              {t('modal.title')}
              <span className='text-red-500'>*</span>
            </Label>
            <Input
              type='text'
              value={title}
              onChange={handleTitleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-[var(--pl-bg)] focus:outline-none focus:ring-2 ${
                errors.titleEmpty || errors.titleTooLong
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-border focus:ring-foreground'
              }`}
              placeholder={t('modal.title')}
            />
            {errors.titleEmpty && (
              <p className='text-red-500 text-sm mt-1'>
                {t('modal.titleEmpty')}
              </p>
            )}
            {errors.titleTooLong && (
              <p className='text-red-500 text-sm mt-1'>
                {t('modal.titleTooLong')}
              </p>
            )}
          </div>

          {/* Privacy */}
          <div>
            <Label className='flex items-center gap-2 font-medium mb-3'>
              <Lock className='w-4 h-4' />
              {t('modal.privacy')}
              <span className='text-red-500'>*</span>
            </Label>
            <Select value={privacy} onValueChange={handlePrivacyChange}>
              <SelectTrigger
                className={`w-full px-3 py-2 border rounded-lg bg-[var(--pl-bg)] focus:outline-none focus:ring-2 ${
                  errors.privacy
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-border focus:ring-foreground'
                }`}
              >
                <SelectValue placeholder='Select privacy' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='Public'>
                  <Earth className='w-4 h-4' /> {t('modal.public')}
                </SelectItem>
                <SelectItem value='Private'>
                  <LockKeyhole className='w-4 h-4' /> {t('modal.private')}
                </SelectItem>
                <SelectItem value='Unlisted'>
                  <EarthLock className='w-4 h-4' />
                  {t('modal.unlisted')}
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.privacy && (
              <p className='text-red-500 text-sm mt-1'>
                {t('modal.privacyRequired')}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label className='flex items-center gap-2 font-medium mb-3'>
              <AlignJustify className='w-4 h-4' />
              <span>{t('modal.description')}</span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground resize-none'
              rows={4}
              placeholder={t('modal.enterDescription')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleCancel}
            variant={"ghost"}
          >
            {onBack && <ArrowLeft className='w-4 h-4' />}
            {onBack ? t('modal.back') : t('modal.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant={"default"}
          >
            {isUpdateMode ? t('modal.updateButton') : t('modal.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewModal;
