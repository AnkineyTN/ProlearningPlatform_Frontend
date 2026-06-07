import type { ReactNode } from 'react';
import type { ResourceRef } from '@/services/types/todo.types';

// ─── Title renderer ───────────────────────────────────────────────────────────

/** Renders a todo title with any embedded resource names as clickable links. */
export function renderTitleWithRefs(
  title: string,
  todo: {
    setRefs?: ResourceRef[];
    noteRefs?: ResourceRef[];
    flashcardRefs?: ResourceRef[];
    examRefs?: ResourceRef[];
  },
  isDone: boolean,
): ReactNode {
  type RefWithUrl = { ref: ResourceRef; url: string };

  const collect = (
    refs: ResourceRef[] | undefined,
    getUrl: (r: ResourceRef) => string,
  ): RefWithUrl[] =>
    (refs ?? [])
      .filter((r) => r.title && title.includes(r.title))
      .map((r) => ({ ref: r, url: getUrl(r) }));

  const allLinked: RefWithUrl[] = [
    ...collect(todo.setRefs, (r) => `/sets/${r.id}`),
    ...collect(todo.noteRefs, (r) => `/sets/${r.setId}/notes/${r.id}`),
    ...collect(
      todo.flashcardRefs,
      (r) => `/sets/${r.setId}/flashcards/${r.id}`,
    ),
    ...collect(todo.examRefs, (r) => `/sets/${r.setId}/exams/${r.id}`),
  ];

  if (!allLinked.length) return title;

  let parts: (string | React.ReactElement)[] = [title];

  allLinked.forEach(({ ref, url }, refIdx) => {
    const newParts: typeof parts = [];
    parts.forEach((part, partIdx) => {
      if (typeof part !== 'string') {
        newParts.push(part);
        return;
      }
      const idx = part.indexOf(ref.title!);
      if (idx === -1) {
        newParts.push(part);
        return;
      }
      if (idx > 0) newParts.push(part.slice(0, idx));
      newParts.push(
        <a
          key={`${refIdx}-${partIdx}`}
          href={url}
          onClick={(e) => e.stopPropagation()}
          className={`font-semibold hover:underline ${isDone ? 'opacity-50' : ''}`}
          style={{ color: 'var(--pl-accent)' }}
        >
          {ref.title}
        </a>,
      );
      const after = part.slice(idx + ref.title!.length);
      if (after) newParts.push(after);
    });
    parts = newParts;
  });

  return <>{parts}</>;
}

/** Backward-compat alias. */
export const renderTitleWithSetRefs = (
  title: string,
  setRefs: ResourceRef[],
  isDone: boolean,
) => renderTitleWithRefs(title, { setRefs }, isDone);
