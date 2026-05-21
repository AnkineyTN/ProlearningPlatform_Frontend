import type { BlockNoteEditor as BlockNoteEditorClass } from '@blocknote/core';

const USER_COLOR_PALETTE = [
  '#958DF1',
  '#F98181',
  '#FBBC88',
  '#FAF594',
  '#70CFF8',
  '#94FADB',
  '#B9F18D',
];

export function generateUserColor(userId: number): string {
  return USER_COLOR_PALETTE[userId % USER_COLOR_PALETTE.length];
}

export function isEditorEmpty(editor: BlockNoteEditorClass): boolean {
  const blocks = editor.document;
  if (!blocks || blocks.length === 0) return true;
  if (blocks.length !== 1) return false;
  const first = blocks[0];
  if (first.type !== 'paragraph') return false;
  if (!first.content) return true;
  return Array.isArray(first.content) && first.content.length === 0;
}

export async function hydrateBlocks(
  editor: BlockNoteEditorClass,
  rawContent: string,
): Promise<void> {
  try {
    const trimmed = rawContent.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          editor.replaceBlocks(editor.document, parsed);
          return;
        }
      } catch {
        // not JSON; fall through to HTML parse
      }
    }
    const parsed = await editor.tryParseHTMLToBlocks(rawContent);
    if (parsed && parsed.length > 0) {
      editor.replaceBlocks(editor.document, parsed);
    }
  } catch (e) {
    console.error('[NoteEditor] Failed to hydrate content:', e);
  }
}
