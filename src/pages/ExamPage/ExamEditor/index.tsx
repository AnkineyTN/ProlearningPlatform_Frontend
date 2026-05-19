import { ArrowLeft, Plus, Save, Clock, Hash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import QuestionItem from './QuestionItem';
import type { ExamQuestion } from '../types';
import {
  useCreateExam,
  useUpdateExam,
  useCreateQuestions,
  useUpdateQuestion,
  useDeleteQuestion,
  useExamDetail,
} from '@/hooks/useExams';
import {
  apiQuizDetailToExam,
  uiQuestionToCreateRequest,
  parseAIGeneratedContent,
} from '../utils/examMapper';
import type { PrivacyType } from '@/services/types/exam.types';

export type QuestionErrors = {
  questionText?: boolean;
  noCorrectAnswer?: boolean;
  emptyAnswers?: Set<string>;
};

const emptyQuestion = (): ExamQuestion => ({
  id: crypto.randomUUID(),
  type: 'MULTIPLE_CHOICE',
  questionText: '',
  answers: [
    { id: crypto.randomUUID(), text: '', isCorrect: false },
    { id: crypto.randomUUID(), text: '', isCorrect: false },
    { id: crypto.randomUUID(), text: '', isCorrect: false },
    { id: crypto.randomUUID(), text: '', isCorrect: false },
  ],
  score: 10,
  _action: 'CREATE',
});

export default function ExamEditor() {
  const { t } = useTranslation();
  const { setId, examId } = useParams<{ setId: string; examId?: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const isUpdateMode = !!examId;

  const {
    title: locationTitle,
    description: locationDescription,
    privacy: locationPrivacy,
    aiContent: locationAIContent,
  } = (location.state as Record<string, unknown>) || {};

  const [title, setTitle] = useState((locationTitle as string) || '');
  const [description, setDescription] = useState(
    (locationDescription as string) || '',
  );
  const [timeLimit, setTimeLimit] = useState(60);
  const [questions, setQuestions] = useState<ExamQuestion[]>([emptyQuestion()]);
  const [draggedQuestionId, setDraggedQuestionId] = useState<
    string | number | null
  >(null);
  const [titleError, setTitleError] = useState(false);
  const [questionErrors, setQuestionErrors] = useState<
    Map<string | number, QuestionErrors>
  >(new Map());

  const { data: examDetailData, isLoading: isLoadingDetail } = useExamDetail(
    Number(setId),
    examId ?? 0,
  );

  const createExamMutation = useCreateExam();
  const updateExamMutation = useUpdateExam();
  const createQuestionsMutation = useCreateQuestions();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  useEffect(() => {
    if (!isUpdateMode) {
      setTitle((locationTitle as string) || '');
      setDescription((locationDescription as string) || '');
      if (locationAIContent && typeof locationAIContent === 'string') {
        const parsed = parseAIGeneratedContent(locationAIContent);
        if (parsed.length > 0) setQuestions(parsed);
      }
    }
  }, [isUpdateMode, locationTitle, locationDescription, locationAIContent]);

  const loadedExamIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (!isUpdateMode || !examDetailData?.data) return;
    const dataId = (examDetailData.data as { id?: string | number }).id;
    if (loadedExamIdRef.current === dataId) return;
    loadedExamIdRef.current = dataId ?? null;

    const exam = apiQuizDetailToExam(examDetailData.data);
    setTitle(exam.title);
    setDescription(exam.description);
    setTimeLimit(exam.timeLimit);
    setQuestions(
      exam.questions.length > 0
        ? exam.questions.map((q) => ({
            ...q,
            _action: typeof q.id === 'number' ? ('UPDATE' as const) : null,
          }))
        : [emptyQuestion()],
    );
  }, [isUpdateMode, examDetailData]);

  useEffect(() => {
    if (!isUpdateMode) loadedExamIdRef.current = null;
  }, [isUpdateMode, examId]);

  const clearQuestionError = (
    qId: string | number,
    field: keyof QuestionErrors,
    answerId?: string,
  ) => {
    setQuestionErrors((prev) => {
      const errs = prev.get(qId);
      if (!errs) return prev;
      const next = new Map(prev);
      if (field === 'emptyAnswers' && answerId) {
        const newSet = new Set(errs.emptyAnswers);
        newSet.delete(answerId);
        if (newSet.size === 0) {
          const { emptyAnswers: _, ...rest } = errs;
          void _;
          next.set(qId, rest);
        } else {
          next.set(qId, { ...errs, emptyAnswers: newSet });
        }
      } else {
        const { [field]: _, ...rest } = errs;
        void _;
        next.set(qId, rest);
      }
      const updated = next.get(qId);
      if (updated && Object.keys(updated).length === 0) next.delete(qId);
      return next;
    });
  };

  const handleUpdateQuestion = (
    id: string | number,
    updates: Partial<ExamQuestion>,
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const updated = { ...q, ...updates };
        if (typeof q.id === 'number' && !q._action) updated._action = 'UPDATE';
        return updated;
      }),
    );
    if (updates.questionText !== undefined && updates.questionText.trim())
      clearQuestionError(id, 'questionText');
    if (
      updates.answers !== undefined &&
      updates.answers.some((a) => a.isCorrect)
    )
      clearQuestionError(id, 'noCorrectAnswer');
  };

  const handleDeleteQuestion = (id: string | number) => {
    if (questions.length === 1) {
      toast.error(t('exam.editor.minOneQuestion'));
      return;
    }
    setQuestions((prev) => {
      if (typeof id === 'number')
        return prev.map((q) =>
          q.id === id ? { ...q, _action: 'DELETE' as const } : q,
        );
      return prev.filter((q) => q.id !== id);
    });
    setQuestionErrors((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDragStart = (id: string | number) => setDraggedQuestionId(id);
  const handleDragEnd = () => setDraggedQuestionId(null);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetId: string | number) => {
    e.preventDefault();
    if (!draggedQuestionId || draggedQuestionId === targetId) return;
    const draggedIndex = questions.findIndex((q) => q.id === draggedQuestionId);
    const targetIndex = questions.findIndex((q) => q.id === targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const next = [...questions];
    const [removed] = next.splice(draggedIndex, 1);
    next.splice(targetIndex, 0, removed);
    setQuestions(next);
  };

  const calculateTotalScore = () =>
    questions
      .filter((q) => q._action !== 'DELETE')
      .reduce((sum, q) => sum + q.score, 0);

  const validate = (): boolean => {
    let valid = true;
    const errors = new Map<string | number, QuestionErrors>();

    if (!title.trim()) {
      setTitleError(true);
      valid = false;
    } else setTitleError(false);

    const active = questions.filter((q) => q._action !== 'DELETE');
    if (active.length === 0) {
      toast.error(t('exam.editor.minOneQuestion'));
      return false;
    }

    for (const q of active) {
      const qErrs: QuestionErrors = {};
      if (!q.questionText.trim()) {
        qErrs.questionText = true;
        valid = false;
      }
      if (q.type !== 'ESSAY') {
        if (!q.answers.some((a) => a.isCorrect)) {
          qErrs.noCorrectAnswer = true;
          valid = false;
        }
        if (q.type === 'MULTIPLE_CHOICE') {
          const empty = new Set<string>();
          for (const a of q.answers) {
            if (!a.text.trim()) empty.add(a.id);
          }
          if (empty.size > 0) {
            qErrs.emptyAnswers = empty;
            valid = false;
          }
        }
      }
      if (Object.keys(qErrs).length > 0) errors.set(q.id, qErrs);
    }

    setQuestionErrors(errors);
    if (!valid) toast.error(t('exam.editor.fixBeforeSave'));
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const active = questions.filter((q) => q._action !== 'DELETE');
    const privacy: PrivacyType =
      (locationPrivacy as string)?.toUpperCase() === 'PRIVATE'
        ? 'PRIVATE'
        : 'PUBLIC';
    const setIdNum = Number(setId);

    try {
      if (isUpdateMode && examId) {
        await updateExamMutation.mutateAsync({
          setId: setIdNum,
          examId,
          data: { title, description, privacy, duration: timeLimit * 60 },
        });

        for (const q of questions.filter(
          (q) => q._action === 'DELETE' && typeof q.id === 'number',
        )) {
          await deleteQuestionMutation.mutateAsync({
            setId: setIdNum,
            examId,
            questionId: q.id,
          });
        }

        const toCreate = active.filter(
          (q) => q._action === 'CREATE' || typeof q.id !== 'number',
        );
        const toUpdate = active.filter(
          (q) => typeof q.id === 'number' && q._action === 'UPDATE',
        );

        if (toCreate.length > 0)
          await createQuestionsMutation.mutateAsync({
            setId: setIdNum,
            examId,
            data: toCreate.map(uiQuestionToCreateRequest),
          });

        for (const q of toUpdate)
          await updateQuestionMutation.mutateAsync({
            setId: setIdNum,
            examId,
            questionId: q.id,
            data: uiQuestionToCreateRequest(q),
          });

        toast.success(t('exam.editor.successUpdated'));
        navigate(`/sets/${setId}/exams/${examId}`);
      } else {
        const { data } = await createExamMutation.mutateAsync({
          setId: setIdNum,
          data: { title, description, privacy, duration: timeLimit * 60 },
        });
        const newExamId = data?.data?.id;
        if (!newExamId) {
          toast.error(t('exam.editor.failedCreate'));
          return;
        }

        await createQuestionsMutation.mutateAsync({
          setId: setIdNum,
          examId: newExamId,
          data: active.map(uiQuestionToCreateRequest),
        });

        toast.success('Exam created successfully');
        navigate(`/sets/${setId}/exams/${newExamId}`);
      }
    } catch {
      toast.error(t('exam.editor.failedSave'));
    }
  };

  const visibleQuestions = questions.filter((q) => q._action !== 'DELETE');
  const isSaving =
    createExamMutation.isPending ||
    updateExamMutation.isPending ||
    createQuestionsMutation.isPending ||
    updateQuestionMutation.isPending ||
    deleteQuestionMutation.isPending;

  if (isUpdateMode && isLoadingDetail) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-[var(--pl-bg)]'>
        <div className='text-center'>
          <div className='w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3' />
          <p className='text-sm text-muted-foreground'>
            {t('exam.editor.loading')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[var(--pl-bg)]'>
      {/* Sticky header */}
      <div className='sticky top-0 z-10 bg-[var(--pl-bg)] border-b border-border'>
        <div className='max-w-4xl mx-auto px-6 py-4 flex items-center gap-4'>
          <button
            onClick={() => navigate(`/sets/${setId}/exams`)}
            className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
          >
            <ArrowLeft className='w-4 h-4' />
            {t('exam.back')}
          </button>
          <div className='flex-1 min-w-0'>
            <h1 className='font-[family-name:var(--font-display)] text-xl font-medium tracking-tight truncate'>
              {isUpdateMode
                ? t('exam.editor.editExam')
                : t('exam.editor.createExam')}
            </h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className='gap-2 flex-shrink-0'
          >
            <Save className='w-4 h-4' />
            {isSaving
              ? 'Saving…'
              : isUpdateMode
                ? t('exam.editor.updateExam')
                : t('exam.editor.createExam')}
          </Button>
        </div>
      </div>

      <div className='max-w-4xl mx-auto px-6 py-8 space-y-6'>
        {/* Exam metadata */}
        <div className='bg-[var(--pl-bg-elev)] border border-border rounded-xl p-6 space-y-5'>
          <p className='text-xs uppercase tracking-widest text-muted-foreground/60'>
            {t('exam.editor.examInfo')}
          </p>

          <div>
            <Label
              htmlFor='exam-title'
              className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block'
            >
              {t('exam.editor.titleLabel')}{' '}
              <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='exam-title'
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError(false);
              }}
              placeholder={t('exam.editor.titlePlaceholder')}
              className={`text-base bg-background ${titleError ? 'border-destructive focus-visible:ring-destructive' : 'border-border'}`}
            />
            {titleError && (
              <p className='text-destructive text-xs mt-1'>
                {t('exam.editor.titleRequired')}
              </p>
            )}
          </div>

          <div>
            <Label
              htmlFor='exam-desc'
              className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 block'
            >
              {t('exam.editor.descriptionLabel')}
            </Label>
            <Textarea
              id='exam-desc'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('exam.editor.descriptionPlaceholder')}
              className='min-h-[80px] resize-none bg-background border-border'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <Label
                htmlFor='exam-time'
                className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-1.5'
              >
                <Clock className='w-3 h-3' />
                {t('exam.editor.timeLimitMinutes')}
              </Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='exam-time'
                  type='number'
                  min='1'
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className='bg-background border-border'
                />
                <span className='text-sm text-muted-foreground flex-shrink-0'>
                  min
                </span>
              </div>
            </div>
            <div>
              <Label className='text-xs uppercase tracking-widest text-muted-foreground/60 mb-2 flex items-center gap-1.5'>
                <Hash className='w-3 h-3' />
                {t('exam.editor.totalScore')}
              </Label>
              <div className='flex items-center gap-2'>
                <Input
                  value={calculateTotalScore()}
                  readOnly
                  className='bg-secondary border-border text-muted-foreground'
                />
                <span className='text-sm text-muted-foreground flex-shrink-0'>
                  pts
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Questions */}
        <div>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-2'>
              <p className='text-xs uppercase tracking-widest text-muted-foreground/60'>
                {t('exam.editor.questionsHeading', {
                  count: visibleQuestions.length,
                })}
              </p>
            </div>
            <Button
              onClick={() => setQuestions([...questions, emptyQuestion()])}
              variant='outline'
              size='sm'
              className='gap-2 text-xs'
            >
              <Plus className='w-3.5 h-3.5' />
              {t('exam.editor.addQuestion')}
            </Button>
          </div>

          {visibleQuestions.length === 0 ? (
            <div className='text-center py-16 bg-[var(--pl-bg)] border-2 border-dashed border-border rounded-xl'>
              <p className='text-muted-foreground text-sm mb-4'>
                {t('exam.editor.noQuestionsYet')}
              </p>
              <Button
                onClick={() => setQuestions([emptyQuestion()])}
                variant='outline'
                size='sm'
                className='gap-2'
              >
                <Plus className='w-4 h-4' />
                {t('exam.editor.addFirstQuestion')}
              </Button>
            </div>
          ) : (
            visibleQuestions.map((question, index) => (
              <QuestionItem
                key={question.id}
                question={question}
                index={index}
                errors={questionErrors.get(question.id)}
                onClearError={(field, answerId) =>
                  clearQuestionError(question.id, field, answerId)
                }
                onUpdate={handleUpdateQuestion}
                onDelete={handleDeleteQuestion}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))
          )}

          {visibleQuestions.length > 0 && (
            <button
              onClick={() => setQuestions([...questions, emptyQuestion()])}
              className='w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-[var(--pl-bg)] transition-colors cursor-pointer mt-2'
            >
              <Plus className='w-4 h-4' />
              {t('exam.editor.addQuestion')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
