import {
  ChevronRight,
  ChevronLeft,
  Book,
  Layers,
  Infinity,
} from 'lucide-react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import { useCreateSet } from '@/hooks/useSets';
import type { CreateSetPayload } from '@/services/types/set.types';

function studySetToCreatePayload(studySet: {
  name: string;
  description: string;
  privacy: string;
}): CreateSetPayload {
  const p = studySet.privacy.toLowerCase();
  const privacy: CreateSetPayload['privacy'] =
    p === 'public' ? 'PUBLIC' : 'PRIVATE';
  return {
    title: studySet.name.trim(),
    description: studySet.description.trim(),
    privacy,
  };
}

type Props = {
  studySet: { name: string; description: string; privacy: string };
  onStudySetChange: (field: string, value: string) => void;
  onComplete: () => void | Promise<void>;
  onSkip: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
};

const CreateStudySet = ({
  studySet,
  onStudySetChange,
  onComplete,
  onSkip,
  onBack,
  isSubmitting = false,
}: Props) => {
  const { t } = useTranslation();
  const createSetMutation = useCreateSet();

  const handleCreateSet = async () => {
    try {
      await createSetMutation.mutateAsync(studySetToCreatePayload(studySet));
      await onComplete();
    } catch {
      toast.error(t('onboarding.createStudySet.createFailed'));
    }
  };

  const busy = isSubmitting || createSetMutation.isPending;

  return (
    <div className='min-h-screen flex items-center justify-center p-6'>
      <div className='w-full max-w-5xl'>
        <div className='text-center mb-12'>
          <h1 className='text-4xl font-bold text-foreground mb-3'>
            {t('onboarding.createStudySet.title')}
          </h1>
          <p className='text-muted-foreground'>
            {t('onboarding.createStudySet.description')}
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-8'>
          <div className='space-y-4'>
            <div>
              <Label
                className={'block text-sm font-semibold text-foreground mb-2'}
              >
                {t('onboarding.createStudySet.nameLabel')}{' '}
                <span className='text-[var(--pl-danger)]'>*</span>
              </Label>
              <Input
                type='text'
                placeholder={t('onboarding.createStudySet.namePlaceholder')}
                value={studySet.name}
                onChange={(e) => onStudySetChange('name', e.target.value)}
                className='w-full px-4 py-3 bg-card'
                maxLength={100}
              />
              <div className='text-right text-xs text-[var(--pl-text-faint)] mt-1'>
                {t('onboarding.createStudySet.charCount', {
                  current: studySet.name.length,
                  max: 100,
                })}
              </div>
            </div>

            <div>
              <Label className='block text-sm font-semibold text-foreground mb-2'>
                {t('onboarding.createStudySet.descriptionLabel')}{' '}
                <span className='text-[var(--pl-text-faint)] font-normal'>
                  {t('onboarding.createStudySet.optionalTag')}
                </span>
              </Label>
              <Textarea
                placeholder={t(
                  'onboarding.createStudySet.descriptionPlaceholder',
                )}
                value={studySet.description}
                onChange={(e) =>
                  onStudySetChange('description', e.target.value)
                }
                className='w-full px-4 py-3 bg-card'
                rows={4}
                maxLength={300}
              />
              <div className='text-right text-xs text-[var(--pl-text-faint)] mt-1'>
                {t('onboarding.createStudySet.charCount', {
                  current: studySet.description.length,
                  max: 300,
                })}
              </div>
            </div>

            <div>
              <Label className='block text-sm font-semibold text-foreground mb-2'>
                {t('onboarding.createStudySet.privacyLabel')}
              </Label>
              <Select
                value={studySet.privacy}
                onValueChange={(value) => onStudySetChange('privacy', value)}
              >
                <SelectTrigger className='w-full px-4 py-3 bg-[var(--pl-bg)] appearance-none cursor-pointer'>
                  <SelectValue
                    placeholder={t(
                      'onboarding.createStudySet.privacyPlaceholder',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='public'>
                    🌐 {t('onboarding.createStudySet.privacyPublic')}
                  </SelectItem>
                  <SelectItem value='private'>
                    🔒 {t('onboarding.createStudySet.privacyPrivate')}
                  </SelectItem>
                  <SelectItem value='unlisted'>
                    👁️ {t('onboarding.createStudySet.privacyUnlisted')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type='button'
              onClick={() => void handleCreateSet()}
              disabled={!studySet.name.trim() || busy}
              className='w-full py-4 bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] rounded-xl font-semibold hover:opacity-90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <span>
                {busy
                  ? t('onboarding.submitting')
                  : `+ ${t('onboarding.createStudySet.createSet')}`}
              </span>
            </button>
          </div>

          <div className='bg-[var(--pl-bg-elev)] rounded-2xl border-2 border-ring p-6'>
            <h3 className='text-xl font-bold text-foreground mb-6'>
              {t('onboarding.createStudySet.whatIsStudySet')}
            </h3>

            <div className='space-y-4 mb-6'>
              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-[var(--pl-accent-soft)] rounded-xl flex items-center justify-center flex-shrink-0'>
                  <Layers className='w-5 h-5 text-[var(--pl-accent)]' />
                </div>
                <div>
                  <p className='text-foreground'>
                    {t('onboarding.createStudySet.organizeMaterials')}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-[var(--pl-accent-soft)] rounded-xl flex items-center justify-center flex-shrink-0'>
                  <Book className='w-5 h-5 text-[var(--pl-accent)]' />
                </div>
                <div>
                  <p className='text-foreground'>
                    {t('onboarding.createStudySet.keepMaterialsInOnePlace')}
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-3'>
                <div className='w-10 h-10 bg-[var(--pl-warning-soft)] rounded-xl flex items-center justify-center flex-shrink-0'>
                  <Infinity className='w-5 h-5 text-[var(--pl-warning)]' />
                </div>
                <div>
                  <p className='text-foreground'>
                    {t('onboarding.createStudySet.makeManyStudySets')}
                  </p>
                </div>
              </div>
            </div>

            <div className='bg-[var(--pl-warning-soft)] rounded-xl p-4 border border-[var(--pl-warning-border)]'>
              <div className='flex items-start gap-2 mb-3'>
                <span className='text-lg'>💡</span>
                <h4 className='font-semibold text-foreground'>
                  {t('onboarding.createStudySet.quickTips')}
                </h4>
              </div>
              <ul className='space-y-2 text-sm text-foreground'>
                <li>💡 {t('onboarding.createStudySet.quickTip1')}</li>
                <li>💡 {t('onboarding.createStudySet.quickTip2')}</li>
                <li>💡 {t('onboarding.createStudySet.quickTip3')}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className='flex items-center justify-between mt-8'>
          <button
            type='button'
            onClick={onBack}
            disabled={busy}
            className='px-4 py-2 rounded-xl border border-ring bg-[var(--pl-bg)] text-foreground hover:bg-[var(--pl-bg-hover)] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <ChevronLeft className='w-4 h-4' />
            <span>{t('onboarding.back')}</span>
          </button>
          <button
            type='button'
            onClick={onSkip}
            disabled={busy}
            className='px-4 py-2 rounded-xl bg-foreground text-background hover:opacity-90 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <span>{t('onboarding.skipForNow')}</span>
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStudySet;
