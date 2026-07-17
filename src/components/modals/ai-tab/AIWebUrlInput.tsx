import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import NoteReferenceLinksInput from './NoteReferenceLinksInput';

const MAX_LINKS = 3;

type Props = {
  urls: string[];
  onChange: (urls: string[]) => void;
  disabled?: boolean;
};

const AIWebUrlInput = ({ urls, onChange, disabled }: Props) => {
  const { t } = useTranslation();

  return (
    <div>
      <p className='text-xs text-muted-foreground italic mb-2'>
        <Globe className='inline w-3 h-3 mr-1' />
        {t('modal.ai.webUrlsHintMax', {
          defaultValue: 'Maximum {{count}} links',
          count: MAX_LINKS,
        })}
      </p>
      <NoteReferenceLinksInput
        links={urls}
        onChange={onChange}
        disabled={disabled}
        maxLinks={MAX_LINKS}
      />
    </div>
  );
};

export default AIWebUrlInput;
