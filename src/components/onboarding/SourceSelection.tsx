import {
  Youtube,
  Music,
  Sparkles,
  Facebook,
  Globe,
  Instagram,
  Users,
  CircleDot,
  MoreHorizontal,
} from "lucide-react";
import SwitchButton from "./SwitchButton";
import { useTranslation } from "react-i18next";

type Props = {
  selectedSource: string;
  onSourceSelect: (source: string) => void;
  onNext: () => void;
  onBack: () => void;
};

const SourceSelection = ({
  selectedSource,
  onSourceSelect,
  onNext,
  onBack,
}: Props) => {
  const { t } = useTranslation();
  const sources = [
    { id: "YouTube", label: "YouTube", icon: Youtube, color: "bg-red-500" },
    { id: "TikTok", label: "TikTok", icon: Music, color: "bg-black" },
    { id: "ChatGPT", label: "ChatGPT", icon: Sparkles, color: "bg-teal-500" },
    { id: "Facebook", label: "Facebook", icon: Facebook, color: "bg-blue-500" },
    { id: "Google", label: "Google", icon: Globe, color: "bg-gray-400" },
    {
      id: "Instagram",
      label: "Instagram",
      icon: Instagram,
      color: "bg-pink-500",
    },
    { id: "Classmate", label: "Classmate", icon: Users, color: "bg-gray-500" },
    { id: "Reddit", label: "Reddit", icon: CircleDot, color: "bg-orange-500" },
    { id: "Other", label: "Other", icon: MoreHorizontal, color: "" },
  ];

  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='w-full max-w-3xl'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-foreground mb-3'>
            {t("onboarding.sourceSelection.header")}
          </h1>
          <p className='text-muted-foreground'>
            {t("onboarding.sourceSelection.description")}
          </p>
        </div>

        <div className='grid grid-cols-3 gap-4 mb-8'>
          {sources.map((source) => {
            const Icon = source.icon;
            const isSelected = selectedSource === source.id;

            return (
              <button
                key={source.id}
                onClick={() => onSourceSelect(source.id)}
                className={`p-6 rounded-2xl border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 bg-card-selected"
                    : "border-ring bg-card-secondary hover:border-gray-300"
                }`}
              >
                <div className='flex flex-col items-center gap-3'>
                  <div
                    className={`w-12 h-12 rounded-xl ${source.color} flex items-center justify-center`}
                  >
                    <Icon className='w-6 h-6 text-white' />
                  </div>
                  <span className='font-medium text-foreground'>
                    {source.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <SwitchButton
          onPre={onBack}
          onNext={onNext}
          disablePre={!selectedSource}
        />
      </div>
    </div>
  );
}

export default SourceSelection;