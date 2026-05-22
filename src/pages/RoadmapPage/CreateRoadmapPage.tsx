import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCreateRoadmap, usePreviewRoadmap } from '@/hooks/useRoadmap';
import type {
  CreateRoadmapPayload,
  PreviewRoadmap,
  RoadmapLanguage,
  RoadmapLevel,
} from '@/services/types/roadmap.types';

import { StepIndicator, type Step } from './create/StepIndicator';
import { GoalForm } from './create/GoalForm';
import { PreviewEditor } from './create/PreviewEditor';

const CreateRoadmapPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user?.accountType !== 'PRO') {
      navigate('/roadmaps', { replace: true });
    }
  }, [isLoading, user, navigate]);
  const previewMutation = usePreviewRoadmap();
  const createMutation = useCreateRoadmap();

  const [step, setStep] = useState<Step>('goal');
  const [goal, setGoal] = useState('');
  const [level, setLevel] = useState<RoadmapLevel>('BEGINNER');
  const [language, setLanguage] = useState<RoadmapLanguage>(
    i18n.language?.startsWith('en') ? 'English' : 'Vietnamese',
  );

  const [draft, setDraft] = useState<PreviewRoadmap | null>(null);

  const handlePreview = async () => {
    if (!goal.trim()) {
      toast.error(t('roadmap.create.missingGoal'));
      return;
    }
    try {
      const result = await previewMutation.mutateAsync({
        goal: goal.trim(),
        level,
        language,
      });
      setDraft(result);
      setStep('preview');
    } catch {
      toast.error(t('roadmap.create.previewError'));
    }
  };

  const handleCreate = async () => {
    if (!draft) return;
    try {
      const payload: CreateRoadmapPayload = draft;
      const created = await createMutation.mutateAsync(payload);
      setStep('done');
      toast.success(t('roadmap.create.createSuccess'));
      setTimeout(() => navigate(`/roadmaps/${created.id}`), 800);
    } catch {
      toast.error(t('roadmap.create.createError'));
    }
  };

  return (
    <div className='min-h-screen bg-[var(--pl-bg)]'>
      <div className='px-10 pt-8 pb-0'>
        <Button
          variant='ghost'
          onClick={() => navigate('/roadmaps')}
          className='gap-2 text-[12.5px] mb-4 text-[var(--pl-text-muted)] h-auto p-0 hover:bg-transparent hover:text-[var(--pl-text)]'
        >
          <ArrowLeft size={13} /> {t('roadmap.backToList')}
        </Button>

        <StepIndicator step={step} />

        {step === 'goal' && (
          <GoalForm
            goal={goal}
            setGoal={setGoal}
            level={level}
            setLevel={setLevel}
            language={language}
            setLanguage={setLanguage}
            onSubmit={handlePreview}
            loading={previewMutation.isPending}
          />
        )}

        {step === 'preview' && draft && (
          <PreviewEditor
            draft={draft}
            onChange={setDraft}
            onBack={() => setStep('goal')}
            onConfirm={handleCreate}
            creating={createMutation.isPending}
            onRegenerate={handlePreview}
            regenerating={previewMutation.isPending}
          />
        )}

        {step === 'done' && (
          <div className='py-24 text-center'>
            <CheckCircle2
              size={48}
              className='mx-auto mb-4 text-[oklch(0.7_0.18_150)]'
            />
            <h3 className='text-[20px] font-medium mb-1 text-[var(--pl-text)]'>
              {t('roadmap.create.doneTitle')}
            </h3>
            <p className='text-[13px] text-[var(--pl-text-muted)]'>
              {t('roadmap.create.doneSubtitle')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateRoadmapPage;
