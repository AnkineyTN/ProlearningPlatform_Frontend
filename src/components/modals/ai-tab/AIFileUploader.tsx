import { Download, Upload, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

import { cn } from '@/lib/utils';

import { formatFileSize } from './utils';

type Props = {
  files: File[];
  onChange: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
};

const AIFileUploader = ({ files, onChange, disabled, maxFiles = 3 }: Props) => {
  const { t } = useTranslation();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    if (filesArray.length > maxFiles) {
      toast.error(
        t('modal.ai.maxFiles', { defaultValue: 'Maximum 3 files allowed' }),
      );
      onChange(filesArray.slice(0, maxFiles));
    } else {
      onChange(filesArray);
    }
  };

  const handleRemove = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className='w-full border-2 border-dashed border-border rounded-xl p-7 text-center hover:border-foreground/50 transition-colors bg-[var(--pl-bg-sunken)]'>
        <Upload className='w-10 h-10 mx-auto mb-3 text-muted-foreground' />
        <p className='text-sm text-muted-foreground mb-3'>
          {t('modal.ai.fileHint', {
            defaultValue: 'PDF, DOCX, PPTX, TXT (Maximum 3 files)',
          })}
        </p>
        <label className='inline-block'>
          <input
            type='file'
            multiple
            onChange={handleUpload}
            className='hidden'
            accept='.pdf,.docx,.txt,.doc,.pptx'
            disabled={disabled}
          />
          <span
            className={cn(
              'px-4 py-2 bg-foreground text-background rounded-lg inline-block text-sm font-medium',
              disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer hover:opacity-90 transition-opacity',
            )}
          >
            {t('modal.ai.chooseFiles')}
          </span>
        </label>
      </div>

      {files.length > 0 && (
        <div className='mt-3 space-y-2'>
          {files.map((file, index) => (
            <div
              key={index}
              className='w-full flex items-center justify-between gap-2 p-2.5 bg-[var(--pl-bg-sunken)] rounded-lg border border-border'
            >
              <div className='flex items-center gap-2 min-w-0 flex-1'>
                <Download className='w-4 h-4 shrink-0 text-muted-foreground' />
                <span className='text-sm truncate'>{file.name}</span>
                <span className='text-xs text-muted-foreground shrink-0'>
                  {formatFileSize(file.size)}
                </span>
              </div>
              <button
                type='button'
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className='text-muted-foreground hover:text-foreground cursor-pointer shrink-0 disabled:cursor-not-allowed'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIFileUploader;
