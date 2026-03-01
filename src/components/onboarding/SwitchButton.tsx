import { ChevronRight, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  onPre: () => void;
  onNext: () => void;
  disablePre?: boolean;
};

const SwitchButton = ({
  onPre,
  onNext,
  disablePre,
}: Props) => {
  const { t } = useTranslation();
  return (
    <div className='flex items-center justify-between'>
      <button
        onClick={onPre}
        className='px-4 py-2 rounded-xl border border-ring bg-card text-foreground hover:bg-card-secondary transition-colors flex items-center gap-2 cursor-pointer'
      >
        <ChevronLeft className='w-4 h-4' />
        <span>{t("onboarding.back")}</span>
      </button>
      <button
        onClick={onNext}
        disabled={disablePre}
        className='px-4 py-2 rounded-xl bg-foreground text-background hover:bg-card-hovered transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
      >
        <span>{t("onboarding.continue")}</span>
        <ChevronRight className='w-4 h-4' />
      </button>
    </div>
  );
}

export default SwitchButton;