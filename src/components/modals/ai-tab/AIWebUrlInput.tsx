import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Textarea } from '@/components/ui/textarea';

type Props = {
  value: string;
  onChange: (value: string) => void;
  urls: string[];
  disabled?: boolean;
};

const AIWebUrlInput = ({ value, onChange, urls, disabled }: Props) => {
  const { t } = useTranslation();

  return (
    <div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t('modal.ai.webUrlsPlaceholder', {
          defaultValue: 'https://example.com/article',
        })}
        disabled={disabled}
        rows={5}
        className='resize-y min-h-[120px] font-mono text-sm bg-[var(--pl-bg-sunken)]'
      />
      <p
        className='text-xs text-muted-foreground italic mt-1.5'
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        <Globe className='inline w-3 h-3 mr-1' />
        {t('modal.ai.webUrlsHint', {
          defaultValue: 'Enter one URL per line (https://…)',
        })}
      </p>
      {urls.length > 0 && (
        <p className='text-xs text-muted-foreground mt-1'>
          {urls.length} URL{urls.length !== 1 ? 's' : ''}{' '}
          {t('modal.ai.selected')}
        </p>
      )}
    </div>
  );
};

export default AIWebUrlInput;
