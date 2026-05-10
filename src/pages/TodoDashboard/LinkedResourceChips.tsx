import { BookOpen, FileText, FlipHorizontal, GraduationCap } from 'lucide-react';
import type { ResourceRef } from '@/services/types/todo.types';
import type { MentionResourceType } from './mentionTypes';

// ─── Types ────────────────────────────────────────────────────────────────────
type ChipDef = {
  ref: ResourceRef;
  url: string;
  Icon: React.ElementType;
  color: string;
};

// ─── Chip style map ───────────────────────────────────────────────────────────
const CHIP_STYLES: Record<
  MentionResourceType,
  { color: string; Icon: React.ElementType }
> = {
  set: { color: 'oklch(0.7 0.15 260)', Icon: BookOpen },
  note: { color: 'oklch(0.72 0.12 180)', Icon: FileText },
  flashcard: { color: 'oklch(0.7 0.15 310)', Icon: FlipHorizontal },
  exam: { color: 'oklch(0.72 0.15 40)', Icon: GraduationCap },
};

// ─── Builder ──────────────────────────────────────────────────────────────────
function buildChips(todo: {
  setRefs?: ResourceRef[];
  noteRefs?: ResourceRef[];
  flashcardRefs?: ResourceRef[];
  examRefs?: ResourceRef[];
}): ChipDef[] {
  const add = (
    refs: ResourceRef[] | undefined,
    type: MentionResourceType,
    getUrl: (r: ResourceRef) => string,
  ) =>
    (refs ?? [])
      .filter((r) => r.title)
      .map((r) => ({
        ref: r,
        url: getUrl(r),
        ...CHIP_STYLES[type],
      }));

  return [
    ...add(todo.setRefs, 'set', (r) => `/sets/${r.id}`),
    ...add(todo.noteRefs, 'note', (r) => `/sets/${r.setId}/notes/${r.id}`),
    ...add(
      todo.flashcardRefs,
      'flashcard',
      (r) => `/sets/${r.setId}/flashcards/${r.id}`,
    ),
    ...add(todo.examRefs, 'exam', (r) => `/sets/${r.setId}/exams/${r.id}`),
  ];
}

// ─── Component ────────────────────────────────────────────────────────────────

/** Small chips showing linked resources, rendered next to Priority in task rows. */
export const LinkedResourceChips = ({
  todo,
}: {
  todo: {
    setRefs?: ResourceRef[];
    noteRefs?: ResourceRef[];
    flashcardRefs?: ResourceRef[];
    examRefs?: ResourceRef[];
  };
}) => {
  const chips = buildChips(todo);
  if (!chips.length) return null;

  return (
    <>
      {chips.map(({ ref, url, Icon, color }, i) => (
        <a
          key={`${ref.id}-${i}`}
          href={url}
          onClick={(e) => e.stopPropagation()}
          className='inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border shrink-0 hover:opacity-80 transition-opacity'
          style={{
            color,
            borderColor: `color-mix(in oklch, ${color} 35%, transparent)`,
            background: `color-mix(in oklch, ${color} 10%, transparent)`,
          }}
        >
          <Icon className='w-2.5 h-2.5' />
          <span className='max-w-[80px] truncate'>{ref.title}</span>
        </a>
      ))}
    </>
  );
};
