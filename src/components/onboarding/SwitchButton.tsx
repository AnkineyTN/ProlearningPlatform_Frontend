import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Props = {
  onPre: () => void;
  onNext: () => void;
  disableNext?: boolean;
  hideBack?: boolean;
};

const SwitchButton = ({ onPre, onNext, disableNext, hideBack }: Props) => {
  const { t } = useTranslation();
  return (
    <div className='flex items-center justify-between'>
      {hideBack ? (
        <span />
      ) : (
        <button
          onClick={onPre}
          className='px-5 py-2.5 rounded-full border border-[var(--pl-border-strong)] bg-transparent text-[13.5px] font-medium text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] transition-colors flex items-center gap-2 cursor-pointer'
        >
          <ChevronLeft className='w-4 h-4' />
          <span>{t('onboarding.back')}</span>
        </button>
      )}
      <button
        onClick={onNext}
        disabled={disableNext}
        className='px-6 py-2.5 rounded-full bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] text-[13.5px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
      >
        <span>{t('onboarding.continue')}</span>
        <ChevronRight className='w-4 h-4' />
      </button>
    </div>
  );
};

export default SwitchButton;
