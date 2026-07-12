import { Plus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type Props = {
  links: string[];
  onChange: (links: string[]) => void;
  disabled?: boolean;
  maxLinks?: number;
};

const NoteReferenceLinksInput = ({
  links,
  onChange,
  disabled,
  maxLinks = 3,
}: Props) => {
  const { t } = useTranslation();

  const handleLinkChange = (index: number, value: string) => {
    const next = [...links];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => {
    if (links.length >= maxLinks) return;
    onChange([...links, '']);
  };

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className='space-y-2'>
        {links.map((link, index) => (
          <div key={index} className='flex items-center gap-2'>
            <Input
              type='url'
              value={link}
              onChange={(e) => handleLinkChange(index, e.target.value)}
              placeholder={t('modal.ai.webUrlsPlaceholder', {
                defaultValue: 'https://example.com/article',
              })}
              disabled={disabled}
              className='h-10 px-3.5 rounded-lg bg-[var(--pl-bg-sunken)]'
            />
            {links.length > 1 && (
              <button
                type='button'
                onClick={() => handleRemove(index)}
                disabled={disabled}
                className='w-8 h-8 flex items-center justify-center rounded-lg text-[var(--pl-text-faint)] hover:text-[var(--pl-danger)] hover:bg-[var(--pl-danger-soft)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0'
              >
                <X className='w-4 h-4' />
              </button>
            )}
          </div>
        ))}
      </div>

      {links.length < maxLinks && (
        <Button
          variant='ghost'
          onClick={handleAdd}
          disabled={disabled}
          className='mt-2 flex items-center gap-1.5 text-sm text-[var(--pl-accent)] hover:text-[var(--pl-accent-strong)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <Plus className='w-3.5 h-3.5' />
          {t('modal.ai.addLink', { defaultValue: 'Add link' })}
        </Button>
      )}
    </div>
  );
};

export default NoteReferenceLinksInput;
