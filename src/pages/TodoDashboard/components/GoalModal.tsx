import { useState, useRef, useEffect, useMemo } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { X, CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { todoAPI } from '@/services/endpoints/todo';
import type { Goal, GoalType } from '@/services/types/todo.types';
import { GOAL_PRESET_COLORS } from '../constants';

type GoalModalProps = {
  open: boolean;
  onClose: () => void;
  editGoal?: Goal | null;
  longGoals?: Goal[];
};

const YEARS = Array.from({ length: 10 }, (_, i) => 2022 + i);

const GoalModal = ({
  open,
  onClose,
  editGoal,
  longGoals = [],
}: GoalModalProps) => {
  const { t, i18n } = useTranslation();
  const monthLabels = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) =>
        new Date(2000, i, 1).toLocaleString(i18n.language, { month: 'short' }),
      ),
    [i18n.language],
  );
  const qc = useQueryClient();
  const [title, setTitle] = useState(editGoal?.title ?? '');
  const [description, setDescription] = useState(editGoal?.description ?? '');
  const [color, setColor] = useState(editGoal?.color ?? GOAL_PRESET_COLORS[0]);
  const [targetDate, setTargetDate] = useState(editGoal?.targetDate ?? '');
  const [type, setType] = useState<GoalType>(editGoal?.type ?? 'LONG');
  const [parentGoalId, setParentGoalId] = useState<number | ''>(
    editGoal?.parentGoalId ?? '',
  );
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!calendarOpen) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        document
          .querySelector('[data-radix-popper-content-wrapper]')
          ?.contains(target)
      )
        return;
      if (
        calendarRef.current &&
        !calendarRef.current.contains(target) &&
        triggerRef.current &&
        !triggerRef.current.contains(target)
      ) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [calendarOpen]);

  const selectedDate = targetDate ? parseISO(targetDate) : undefined;

  const openCalendar = () => {
    if (calendarOpen) {
      setCalendarOpen(false);
      return;
    }
    if (!triggerRef.current) {
      setCalendarOpen(true);
      return;
    }
    setDisplayMonth(selectedDate ?? new Date());
    const rect = triggerRef.current.getBoundingClientRect();
    const CAL_H = 380;
    const CAL_W = 290;
    const style: React.CSSProperties = { position: 'fixed', zIndex: 9999 };
    if (window.innerHeight - rect.bottom >= CAL_H || rect.top < CAL_H) {
      style.top = rect.bottom + 4;
    } else {
      style.bottom = window.innerHeight - rect.top + 4;
    }
    if (window.innerWidth - rect.left >= CAL_W) {
      style.left = rect.left;
    } else {
      style.right = window.innerWidth - rect.right;
    }
    setDropdownStyle(style);
    setCalendarOpen(true);
  };

  const shiftMonth = (delta: number) => {
    setDisplayMonth((d) => new Date(d.getFullYear(), d.getMonth() + delta, 1));
  };

  const createMutation = useMutation({
    mutationFn: todoAPI.createGoal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success(t('todo.toast.goalCreated'));
      onClose();
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('todo.toast.goalCreateFailed'))),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Parameters<typeof todoAPI.updateGoal>[1];
    }) => todoAPI.updateGoal(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success(t('todo.toast.goalUpdated'));
      onClose();
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('todo.toast.goalUpdateFailed'))),
  });

  if (!open) return null;

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!title.trim()) return toast.warning(t('todo.toast.goalNameRequired'));
    const payload = {
      title,
      description: description || undefined,
      color,
      targetDate: targetDate || undefined,
      type,
      parentGoalId:
        type === 'SHORT' && parentGoalId !== ''
          ? Number(parentGoalId)
          : undefined,
      clearParentGoal: type === 'LONG' ? true : undefined,
    };
    if (editGoal) {
      updateMutation.mutate({ id: editGoal.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-[var(--pl-bg)] rounded-2xl p-6 w-full max-w-md shadow-xl'>
        <div className='flex items-center justify-between mb-4'>
          <h1 className='font-bold text-foreground font-[family-name:var(--font-display)] italic'>
            {editGoal
              ? t('todo.goalModal.editTitle')
              : t('todo.goalModal.createTitle')}
          </h1>
          <Button
            onClick={onClose}
            variant='ghost'
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='w-5 h-5' />
          </Button>
        </div>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label>{t('todo.goalModal.goalType')}</Label>
            <div className='grid grid-cols-2 gap-2'>
              {(['LONG', 'SHORT'] as GoalType[]).map((gt) => (
                <button
                  key={gt}
                  onClick={() => setType(gt)}
                  className={`cursor-pointer rounded-xl px-3 py-2 text-sm border transition-all text-left ${
                    type === gt
                      ? 'border-[var(--pl-accent)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] font-medium'
                      : 'border-[var(--pl-border)] text-muted-foreground'
                  }`}
                >
                  <div className='font-medium'>
                    {gt === 'LONG'
                      ? t('todo.goalModal.longLabel')
                      : t('todo.goalModal.shortLabel')}
                  </div>
                  <div className='text-[11px] opacity-70 mt-0.5'>
                    {gt === 'LONG'
                      ? t('todo.goalModal.longDesc')
                      : t('todo.goalModal.shortDesc')}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {type === 'SHORT' && longGoals.length > 0 && (
            <div className='space-y-2'>
              <Label>{t('todo.goalModal.parentGoal')}</Label>
              <Select
                value={parentGoalId === '' ? 'none' : String(parentGoalId)}
                onValueChange={(v) =>
                  setParentGoalId(v === 'none' ? '' : Number(v))
                }
              >
                <SelectTrigger className='w-full rounded-xl'>
                  <SelectValue placeholder={t('todo.goalModal.noParent')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none'>
                    {t('todo.goalModal.noParent')}
                  </SelectItem>
                  {longGoals.map((g) => (
                    <SelectItem key={g.id} value={String(g.id)}>
                      {g.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className='space-y-2'>
            <Label>{t('todo.goalModal.nameLabel')}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('todo.goalModal.namePlaceholder')}
              className='rounded-xl'
            />
          </div>
          <div className='space-y-2'>
            <Label>{t('todo.goalModal.descLabel')}</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('todo.goalModal.descPlaceholder')}
              className='rounded-xl'
            />
          </div>

          <div className='space-y-2'>
            <Label>{t('todo.goalModal.targetDate')}</Label>
            <button
              ref={triggerRef}
              type='button'
              onClick={openCalendar}
              className='w-full flex items-center gap-2 rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] px-3 py-2 text-sm text-left transition-colors hover:border-[var(--pl-accent)]'
            >
              <CalendarIcon className='w-4 h-4 text-[var(--pl-text-muted)] shrink-0' />
              {selectedDate ? (
                <span className='text-[var(--pl-text)]'>
                  {format(selectedDate, 'dd/MM/yyyy')}
                </span>
              ) : (
                <span className='text-[var(--pl-text-faint)]'>
                  {t('todo.goalModal.selectDate')}
                </span>
              )}
            </button>

            {calendarOpen && (
              <div
                ref={calendarRef}
                style={dropdownStyle}
                className='rounded-2xl border border-[var(--pl-border)] bg-[var(--pl-bg)] shadow-xl overflow-hidden'
              >
                {/* Custom month/year header */}
                <div className='flex items-center gap-1 px-3 pt-3 pb-1'>
                  <button
                    type='button'
                    onClick={() => shiftMonth(-1)}
                    className='h-7 w-7 shrink-0 rounded-lg flex items-center justify-center hover:bg-[var(--pl-bg-hover)] text-[var(--pl-text-muted)]'
                  >
                    <ChevronLeft className='w-4 h-4' />
                  </button>
                  <div className='flex items-center gap-1 flex-1 justify-center'>
                    <Select
                      value={String(displayMonth.getMonth())}
                      onValueChange={(v) =>
                        setDisplayMonth(
                          new Date(displayMonth.getFullYear(), Number(v), 1),
                        )
                      }
                    >
                      <SelectTrigger className='h-7 w-auto border-none shadow-none px-2 text-sm font-medium focus:ring-0 focus-visible:ring-0'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {monthLabels.map((label, i) => (
                          <SelectItem key={i} value={String(i)}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={String(displayMonth.getFullYear())}
                      onValueChange={(v) =>
                        setDisplayMonth(
                          new Date(Number(v), displayMonth.getMonth(), 1),
                        )
                      }
                    >
                      <SelectTrigger className='h-7 w-auto border-none shadow-none px-2 text-sm font-medium focus:ring-0 focus-visible:ring-0'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={String(y)}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    type='button'
                    onClick={() => shiftMonth(1)}
                    className='h-7 w-7 shrink-0 rounded-lg flex items-center justify-center hover:bg-[var(--pl-bg-hover)] text-[var(--pl-text-muted)]'
                  >
                    <ChevronRight className='w-4 h-4' />
                  </button>
                </div>

                <Calendar
                  mode='single'
                  selected={selectedDate}
                  month={displayMonth}
                  onMonthChange={setDisplayMonth}
                  onSelect={(date) => {
                    setTargetDate(date ? format(date, 'yyyy-MM-dd') : '');
                    setCalendarOpen(false);
                  }}
                  classNames={{
                    month_caption: 'hidden',
                    nav: 'hidden',
                  }}
                />
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <Label>{t('todo.goalModal.color')}</Label>
            <div className='flex gap-2 flex-wrap'>
              {GOAL_PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`cursor-pointer w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className='flex gap-3 mt-6'>
          <Button variant='outline' className='flex-1' onClick={onClose}>
            {t('todo.goalModal.cancel')}
          </Button>
          <Button
            disabled={isLoading}
            onClick={handleSubmit}
            className='flex-1'
          >
            {editGoal ? t('todo.goalModal.save') : t('todo.goalModal.create')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GoalModal;
