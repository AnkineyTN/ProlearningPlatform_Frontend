import { Pencil, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  type: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectManual: () => void;
  onSelectAI: () => void;
};

const CreateMethodModal = ({
  type,
  isOpen,
  onClose,
  onSelectManual,
  onSelectAI,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className='w-full max-w-4xl sm:max-w-4xl px-10 py-8'>
        <DialogHeader>
          <DialogTitle className='text-2xl font-bold'>
            {t('modal.method.header', { type })}
          </DialogTitle>
        </DialogHeader>

        {/* Options */}
        <div className='grid grid-cols-2 gap-8 mb-2'>
          {/* Manual Creation */}
          <button
            onClick={onSelectManual}
            className='p-6 border-2 border-dashed border-ring rounded-lg hover:border-foreground hover:bg-[var(--pl-bg-hover)] transition-all cursor-pointer group'
          >
            <div className='flex flex-col items-center text-center space-y-4'>
              <div className='w-12 h-12 rounded-full bg-[var(--pl-bg-sunken)] group-hover:bg-foreground/10 flex items-center justify-center transition-colors'>
                <Pencil className='w-6 h-6' />
              </div>
              <div>
                <h3 className='font-semibold text-lg mb-2'>
                  {t('modal.method.manualCreation')}
                </h3>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>✓ {t('modal.method.customContent')}</li>
                  <li>✓ {t('modal.method.addImages')}</li>
                  <li>✓ {t('modal.method.importFromText')}</li>
                </ul>
              </div>
            </div>
          </button>

          {/* AI Generation */}
          <button
            onClick={onSelectAI}
            className='p-6 border-2 border-dashed border-ring rounded-lg hover:border-foreground hover:bg-[var(--pl-bg-hover)] transition-all cursor-pointer group'
          >
            <div className='flex flex-col items-center text-center space-y-4'>
              <div className='w-12 h-12 rounded-full bg-[var(--pl-bg-sunken)] group-hover:bg-foreground/10 flex items-center justify-center transition-colors'>
                <Sparkles className='w-6 h-6' />
              </div>
              <div>
                <h3 className='font-semibold text-lg mb-2'>
                  {t('modal.method.aiGeneration')}
                </h3>
                <ul className='text-sm text-muted-foreground space-y-1'>
                  <li>✓ {t('modal.method.quickGeneration')}</li>
                  <li>✓ {t('modal.method.smartContentExtraction')}</li>
                  <li>✓ {t('modal.method.multipleSources')}</li>
                </ul>
              </div>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMethodModal;
