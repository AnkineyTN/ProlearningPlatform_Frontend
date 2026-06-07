import { X, ArrowLeft, Upload } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ImportedCard {
  term: string;
  definition: string;
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (cards: ImportedCard[]) => void;
};

const FORMATS = {
  simple: {
    label: 'Pipe separated  (Term | Definition)',
    example:
      'Variable | A container for storing data values\nFunction | A block of code that performs a specific task\nArray | A data structure that stores multiple values',
    separator: '|',
    description: 'Each line: Term | Definition',
  },
  tab: {
    label: 'Tab separated  (Term [TAB] Definition)',
    example:
      'Variable\tA container for storing data values\nFunction\tA block of code that performs a specific task',
    separator: '\t',
    description: 'Each line: Term [TAB] Definition',
  },
  comma: {
    label: 'Comma separated  (Term, Definition)',
    example:
      'Variable,A container for storing data values\nFunction,A block of code that performs a specific task',
    separator: ',',
    description: 'Each line: Term, Definition',
  },
};

const ImportModal = ({ isOpen, onClose, onInsert }: Props) => {
  const [format, setFormat] = useState<keyof typeof FORMATS>('simple');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState<ImportedCard[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const handleParse = () => {
    if (!content.trim()) {
      toast.error('Please enter content to import');
      return;
    }
    const lines = content.split('\n').filter((l) => l.trim());
    const separator = FORMATS[format].separator;
    const parsed: ImportedCard[] = [];
    lines.forEach((line) => {
      const parts = line.split(separator);
      if (parts.length >= 2) {
        parsed.push({
          term: parts[0].trim(),
          definition: parts.slice(1).join(separator).trim(),
        });
      }
    });
    if (parsed.length === 0) {
      toast.error('No valid cards found. Please check the format.');
      return;
    }
    setPreview(parsed);
    setShowPreview(true);
  };

  const handleInsert = () => {
    if (preview.length === 0) {
      toast.error('Please parse content first');
      return;
    }
    onInsert(preview);
    handleClose();
  };

  const handleClose = () => {
    setContent('');
    setPreview([]);
    setShowPreview(false);
    onClose();
  };

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
      <div className='bg-[var(--pl-bg)] border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col'>
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-5 border-b border-border'>
          <div className='flex items-center gap-3'>
            {showPreview && (
              <button
                onClick={() => setShowPreview(false)}
                className='w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer'
              >
                <ArrowLeft className='w-4 h-4' />
              </button>
            )}
            <div>
              <p className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-0.5'>
                {showPreview
                  ? `${preview.length} cards found`
                  : 'Import flashcards'}
              </p>
              <h2 className='font-[family-name:var(--font-display)] text-xl font-medium tracking-tight'>
                {showPreview ? 'Preview Import' : 'Insert Data'}
              </h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer'
          >
            <X className='w-4 h-4' />
          </button>
        </div>

        {/* Body */}
        <div className='flex-1 overflow-y-auto px-6 py-5'>
          {!showPreview ? (
            <div className='space-y-5'>
              {/* Format selector */}
              <div>
                <label className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block'>
                  Format
                </label>
                <Select
                  value={format}
                  onValueChange={(v) => setFormat(v as keyof typeof FORMATS)}
                >
                  <SelectTrigger className='w-full bg-[var(--pl-bg)] border-border'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='simple'>
                      {FORMATS.simple.label}
                    </SelectItem>
                    <SelectItem value='tab'>{FORMATS.tab.label}</SelectItem>
                    <SelectItem value='comma'>{FORMATS.comma.label}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Example */}
              <div className='bg-secondary/50 rounded-xl p-4 border border-border/50'>
                <p className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2'>
                  Example · {FORMATS[format].description}
                </p>
                <pre className='font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed'>
                  {FORMATS[format].example}
                </pre>
              </div>

              {/* Content input */}
              <div>
                <label className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block'>
                  Your content
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='Paste your flashcard content here…'
                  className='w-full h-52 px-4 py-3 bg-[var(--pl-bg)] border border-border rounded-xl resize-none text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary transition-colors font-[family-name:var(--font-mono-pl)]'
                />
              </div>
            </div>
          ) : (
            <div className='space-y-2'>
              {preview.map((card, i) => (
                <div
                  key={i}
                  className='bg-[var(--pl-bg)] border border-border rounded-xl px-4 py-3 flex items-start gap-3'
                >
                  <span className='font-[family-name:var(--font-mono-pl)] text-xs text-muted-foreground/60 mt-0.5 w-5 text-right flex-shrink-0'>
                    {i + 1}
                  </span>
                  <div className='flex-1 min-w-0 grid grid-cols-2 gap-4'>
                    <div>
                      <p className='text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-1'>
                        Term
                      </p>
                      <p className='text-sm font-medium'>{card.term}</p>
                    </div>
                    <div className='border-l border-border pl-4'>
                      <p className='text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-1'>
                        Definition
                      </p>
                      <p className='text-sm text-muted-foreground'>
                        {card.definition}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='flex items-center justify-end gap-2 px-6 py-4 border-t border-border'>
          <Button
            variant='ghost'
            onClick={handleClose}
            className='text-muted-foreground'
          >
            Cancel
          </Button>
          {!showPreview ? (
            <Button onClick={handleParse} className='gap-2'>
              <Upload className='w-3.5 h-3.5' />
              Preview
            </Button>
          ) : (
            <Button onClick={handleInsert} className='gap-2'>
              Insert {preview.length} cards
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
