import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen,
  ExternalLink,
  FileText,
  FlipHorizontal,
  GraduationCap,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { todoAPI } from '@/services/endpoints/todo';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useAuth } from '@/hooks/useAuth';
import { ResourceMentionInput } from './SetMentionInput';
import type { SearchResourceType } from '@/services/types/search.types';
import type {
  Goal,
  ResourceRef,
  Todo,
  TodoPriority,
  TodoStatus,
  TodoType,
} from '@/services/types/todo.types';
import type { ResourceType } from './constants';

type TodoDetailModalProps = {
  open: boolean;
  todo: Todo | null;
  goals: Goal[];
  onClose: () => void;
};

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  set: <BookOpen className='w-3.5 h-3.5' />,
  note: <FileText className='w-3.5 h-3.5' />,
  flashcard: <FlipHorizontal className='w-3.5 h-3.5' />,
  exam: <GraduationCap className='w-3.5 h-3.5' />,
};

const RESOURCE_COLORS: Record<ResourceType, string> = {
  set: 'oklch(0.7 0.15 260)',
  note: 'oklch(0.72 0.12 180)',
  flashcard: 'oklch(0.7 0.15 310)',
  exam: 'oklch(0.72 0.15 40)',
};

const SEARCH_TYPE_MAP: Record<ResourceType, SearchResourceType> = {
  set: 'SET',
  note: 'NOTE',
  flashcard: 'FLASHCARD',
  exam: 'EXAM',
};

function extractSearchItems(data: unknown): Record<string, unknown>[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  const o = data as Record<string, unknown>;
  if (Array.isArray(o.content)) return o.content as Record<string, unknown>[];
  if (Array.isArray(o.items)) return o.items as Record<string, unknown>[];
  if (Array.isArray(o.data)) return o.data as Record<string, unknown>[];
  return [];
}

const ResourceSearchPicker = ({
  type,
  onAdd,
}: {
  type: ResourceType;
  onAdd: (ref: ResourceRef) => void;
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  const { data: searchResult, isFetching } = useGlobalSearch(debouncedQuery, {
    searchType: SEARCH_TYPE_MAP[type],
    size: 50,
  });

  const allItems = extractSearchItems(searchResult?.data);
  const items = user ? allItems.filter((item) => Number(item.userId) === user.id) : allItems;

  const handleSelect = (item: Record<string, unknown>) => {
    const id = Number(item.id ?? item.resourceId);
    if (!id) return;
    const setId = item.setId != null ? Number(item.setId) : null;
    const title = String(
      item.title ?? item.name ?? item.code ?? `${type} #${id}`,
    );
    onAdd({ id, setId, title });
    setQuery('');
    setDebouncedQuery('');
  };

  return (
    <div className='relative'>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t('todo.detailModal.searchResource', {
          type: t(`todo.resource.${type}`),
        })}
        className='w-full rounded-lg border border-[var(--pl-border)] bg-transparent text-xs px-2 py-1.5 text-[var(--pl-text)] outline-none focus:border-[var(--pl-accent)]'
        autoFocus
      />
      {debouncedQuery.length > 0 && (
        <div className='mt-1 rounded-lg border border-[var(--pl-border)] bg-[var(--pl-bg)] max-h-44 overflow-y-auto shadow-lg'>
          {isFetching ? (
            <div className='px-3 py-2 text-xs text-[var(--pl-text-faint)]'>
              ...
            </div>
          ) : items.length === 0 ? (
            <div className='px-3 py-2 text-xs text-[var(--pl-text-faint)]'>
              {t('todo.detailModal.noResults')}
            </div>
          ) : (
            items.map((item, i) => (
              <button
                key={i}
                type='button'
                onClick={() => handleSelect(item)}
                className='w-full text-left px-3 py-2 text-xs text-[var(--pl-text)] hover:bg-[var(--pl-bg-hover)] border-b border-[var(--pl-border)] last:border-0 truncate'
              >
                {String(item.title ?? item.name ?? item.code ?? item.id ?? '—')}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const TodoDetailModal = ({
  open,
  todo,
  goals,
  onClose,
}: TodoDetailModalProps) => {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const [title, setTitle] = useState(todo?.title ?? '');
  const [description, setDescription] = useState(todo?.description ?? '');
  const [priority, setPriority] = useState<TodoPriority>(
    todo?.priority ?? 'MEDIUM',
  );
  const [dueDate, setDueDate] = useState(todo?.dueDate ?? '');
  const [todoType, setTodoType] = useState<TodoType>(todo?.type ?? 'DAILY');
  const [todoStatus, setTodoStatus] = useState<TodoStatus>(
    todo?.status ?? 'TODO',
  );
  const [goalId, setGoalId] = useState<number | ''>(todo?.goalId ?? '');

  const [setRefs, setSetRefs] = useState<ResourceRef[]>(todo?.setRefs ?? []);
  const [noteRefs, setNoteRefs] = useState<ResourceRef[]>(todo?.noteRefs ?? []);
  const [flashcardRefs, setFlashcardRefs] = useState<ResourceRef[]>(
    todo?.flashcardRefs ?? [],
  );
  const [examRefs, setExamRefs] = useState<ResourceRef[]>(todo?.examRefs ?? []);
  const [addingType, setAddingType] = useState<ResourceType | null>(null);

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof todoAPI.updateTodo>[1]) =>
      todoAPI.updateTodo(todo!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] });
      qc.invalidateQueries({ queryKey: ['goals'] });
      toast.success(t('todo.toast.todoUpdated'));
      onClose();
    },
    onError: () => toast.error(t('todo.toast.todoUpdateFailed')),
  });

  if (!open || !todo) return null;

  const getNavUrl = (type: ResourceType, ref: ResourceRef): string => {
    switch (type) {
      case 'set':
        return `/sets/${ref.id}`;
      case 'note':
        return `/sets/${ref.setId}/notes/${ref.id}`;
      case 'flashcard':
        return `/sets/${ref.setId}/flashcards/${ref.id}`;
      case 'exam':
        return `/sets/${ref.setId}/exams/${ref.id}`;
    }
  };

  const removeRef = (type: ResourceType, id: number) => {
    const update = (prev: ResourceRef[]) => prev.filter((r) => r.id !== id);
    if (type === 'set') setSetRefs(update);
    else if (type === 'note') setNoteRefs(update);
    else if (type === 'flashcard') setFlashcardRefs(update);
    else setExamRefs(update);
  };

  const addRef = (type: ResourceType, ref: ResourceRef) => {
    const update = (prev: ResourceRef[]) =>
      prev.some((r) => r.id === ref.id) ? prev : [...prev, ref];
    if (type === 'set') setSetRefs(update);
    else if (type === 'note') setNoteRefs(update);
    else if (type === 'flashcard') setFlashcardRefs(update);
    else setExamRefs(update);
    setAddingType(null);
  };

  const handleSave = () => {
    if (!title.trim()) return toast.warn(t('todo.toast.todoNameRequired'));
    updateMutation.mutate({
      title,
      description: description || undefined,
      priority,
      dueDate: dueDate || undefined,
      type: todoType,
      status: todoStatus,
      goalId: goalId !== '' ? Number(goalId) : undefined,
      clearGoal: goalId === '' && todo.goalId != null,
      setRefs,
      noteRefs,
      flashcardRefs,
      examRefs,
    });
  };

  const allRefs: { type: ResourceType; refs: ResourceRef[] }[] = [
    { type: 'set', refs: setRefs },
    { type: 'note', refs: noteRefs },
    { type: 'flashcard', refs: flashcardRefs },
    { type: 'exam', refs: examRefs },
  ];

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-[var(--pl-bg)] rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-base font-bold text-foreground'>
            {t('todo.detailModal.title')}
          </h2>
          <button
            onClick={onClose}
            className='text-muted-foreground hover:text-foreground'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        <div className='space-y-4'>
          <div className='rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] px-3 py-2'>
            <ResourceMentionInput
              value={title}
              onChange={setTitle}
              onRefAdded={(type, ref) => {
                const setter =
                  type === "set" ? setSetRefs
                  : type === "note" ? setNoteRefs
                  : type === "flashcard" ? setFlashcardRefs
                  : setExamRefs;
                setter((prev) => prev.some((r) => r.id === ref.id) ? prev : [...prev, ref]);
              }}
              placeholder={t('todo.detailModal.namePlaceholder')}
              className='w-full bg-transparent outline-none text-sm text-[var(--pl-text)]'
            />
          </div>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t('todo.detailModal.descPlaceholder')}
            className='rounded-xl'
          />

          {/* Type + Status row */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs text-muted-foreground mb-1.5 block'>
                {t('todo.detailModal.taskType')}
              </label>
              <div className='flex gap-1.5'>
                {(['DAILY', 'WEEKLY'] as TodoType[]).map((tt) => (
                  <button
                    key={tt}
                    onClick={() => setTodoType(tt)}
                    className={`flex-1 rounded-lg px-2 py-1.5 text-xs border transition-all ${
                      todoType === tt
                        ? 'border-[var(--pl-accent)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] font-medium'
                        : 'border-[var(--pl-border)] text-muted-foreground'
                    }`}
                  >
                    {t(`todo.todoType.${tt}`)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className='text-xs text-muted-foreground mb-1.5 block'>
                {t('todo.detailModal.status')}
              </label>
              <div className='flex gap-1'>
                {(['TODO', 'DONE', 'SKIPPED'] as TodoStatus[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setTodoStatus(s)}
                    className={`flex-1 rounded-lg px-1.5 py-1.5 text-[10px] border transition-all ${
                      todoStatus === s
                        ? 'border-[var(--pl-accent)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] font-medium'
                        : 'border-[var(--pl-border)] text-muted-foreground'
                    }`}
                  >
                    {t(`todo.todoStatus.${s}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Priority + Due date */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='text-xs text-muted-foreground mb-1.5 block'>
                {t('todo.detailModal.priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TodoPriority)}
                className='w-full rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] text-sm px-3 py-2 text-[var(--pl-text)] outline-none'
              >
                <option value='LOW'>{t('todo.detailModal.priorityLow')}</option>
                <option value='MEDIUM'>
                  {t('todo.detailModal.priorityMedium')}
                </option>
                <option value='HIGH'>
                  {t('todo.detailModal.priorityHigh')}
                </option>
              </select>
            </div>
            <div>
              <label className='text-xs text-muted-foreground mb-1.5 block'>
                {t('todo.detailModal.dueDate')}
              </label>
              <Input
                type='date'
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className='rounded-xl'
              />
            </div>
          </div>

          {/* Goal */}
          <div>
            <label className='text-xs text-muted-foreground mb-1.5 block'>
              {t('todo.detailModal.goal')}
            </label>
            <select
              value={goalId}
              onChange={(e) =>
                setGoalId(e.target.value === '' ? '' : Number(e.target.value))
              }
              className='w-full rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg)] text-sm px-3 py-2 text-[var(--pl-text)] outline-none'
            >
              <option value=''>{t('todo.detailModal.noGoal')}</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </select>
          </div>

          {/* Linked resources */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <label className='text-xs font-medium text-[var(--pl-text)]'>
                {t('todo.detailModal.resources')}
              </label>
              <div className='flex gap-1'>
                {(['set', 'note', 'flashcard', 'exam'] as ResourceType[]).map(
                  (rt) => (
                    <button
                      key={rt}
                      onClick={() =>
                        setAddingType(addingType === rt ? null : rt)
                      }
                      title={t('todo.detailModal.addResource', {
                        type: t(`todo.resource.${rt}`),
                      })}
                      style={{
                        color:
                          addingType === rt ? RESOURCE_COLORS[rt] : undefined,
                      }}
                      className={`p-1.5 rounded-lg border transition-all text-[var(--pl-text-faint)] hover:text-[var(--pl-text)] ${
                        addingType === rt
                          ? 'border-[var(--pl-accent)] bg-[var(--pl-accent-soft)]'
                          : 'border-[var(--pl-border)]'
                      }`}
                    >
                      {RESOURCE_ICONS[rt]}
                    </button>
                  ),
                )}
              </div>
            </div>

            {addingType && (
              <div className='mb-2 p-2 rounded-xl border border-[var(--pl-border)] bg-[var(--pl-bg-elev)]'>
                <p className='text-[11px] text-muted-foreground mb-1.5'>
                  {t('todo.detailModal.addResource', {
                    type: t(`todo.resource.${addingType}`),
                  })}
                </p>
                <ResourceSearchPicker
                  type={addingType}
                  onAdd={(ref) => addRef(addingType, ref)}
                />
              </div>
            )}

            <div className='flex flex-wrap gap-1.5'>
              {allRefs.flatMap(({ type, refs }) =>
                refs.map((ref) => {
                  const navUrl = getNavUrl(type, ref);
                  return (
                    <div
                      key={`${type}-${ref.id}`}
                      className='inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 border text-[11px] group'
                      style={{
                        borderColor: `color-mix(in oklch, ${RESOURCE_COLORS[type]} 40%, transparent)`,
                        background: `color-mix(in oklch, ${RESOURCE_COLORS[type]} 10%, transparent)`,
                        color: RESOURCE_COLORS[type],
                      }}
                    >
                      {RESOURCE_ICONS[type]}
                      <a
                        href={navUrl}
                        onClick={(e) => e.stopPropagation()}
                        className='hover:underline flex items-center gap-1'
                        target='_self'
                        rel='noopener noreferrer'
                      >
                        {ref.title ??
                          `${t(`todo.resource.${type}`)} #${ref.id}`}
                        <ExternalLink className='w-2.5 h-2.5 opacity-60' />
                      </a>
                      <button
                        onClick={() => removeRef(type, ref.id)}
                        className='opacity-0 group-hover:opacity-100 transition-opacity ml-0.5'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </div>
                  );
                }),
              )}
              {allRefs.every(({ refs }) => refs.length === 0) && (
                <p className='text-[11px] text-[var(--pl-text-faint)] italic'>
                  {t('todo.detailModal.noResources')}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className='flex gap-3 mt-6'>
          <Button
            variant='outline'
            className='flex-1 rounded-xl'
            onClick={onClose}
          >
            {t('todo.detailModal.cancel')}
          </Button>
          <Button
            disabled={updateMutation.isPending}
            onClick={handleSave}
            className='flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          >
            {t('todo.detailModal.save')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodoDetailModal;
