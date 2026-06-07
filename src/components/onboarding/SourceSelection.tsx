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
} from 'lucide-react';
import SwitchButton from './SwitchButton';
import { useTranslation } from 'react-i18next';

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
    { id: 'YouTube', icon: Youtube, color: 'bg-[var(--pl-danger)]' },
    { id: 'TikTok', icon: Music, color: 'bg-black' },
    { id: 'ChatGPT', icon: Sparkles, color: 'bg-[var(--pl-accent)]' },
    { id: 'Facebook', icon: Facebook, color: 'bg-[var(--pl-accent)]' },
    { id: 'Google', icon: Globe, color: 'bg-[var(--pl-text-muted)]' },
    { id: 'Instagram', icon: Instagram, color: 'bg-[var(--pl-accent)]' },
    { id: 'Classmate', icon: Users, color: 'bg-[var(--pl-text-muted)]' },
    { id: 'Reddit', icon: CircleDot, color: 'bg-[var(--pl-warning)]' },
    { id: 'Other', icon: MoreHorizontal, color: '' },
  ] as const;

  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='w-full max-w-3xl'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-foreground mb-3'>
            {t('onboarding.sourceSelection.header')}
          </h1>
          <p className='text-muted-foreground'>
            {t('onboarding.sourceSelection.description')}
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
                    ? 'border-[var(--pl-accent)] bg-[var(--pl-accent-soft)]'
                    : 'border-[var(--pl-border)] bg-[var(--pl-bg-hover)] hover:border-[var(--pl-border-strong)]'
                }`}
              >
                <div className='flex flex-col items-center gap-3'>
                  <div
                    className={`w-12 h-12 rounded-xl ${source.color} flex items-center justify-center`}
                  >
                    <Icon className='w-6 h-6 text-white' />
                  </div>
                  <span className='font-medium text-foreground'>
                    {t(`onboarding.sourceSelection.channels.${source.id}`)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <SwitchButton
          onPre={onBack}
          onNext={onNext}
          disableNext={!selectedSource}
        />
      </div>
    </div>
  );
};

export default SourceSelection;
