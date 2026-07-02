export type HistoryTarget =
  | { kind: 'set'; setId: number }
  | { kind: 'flashcard'; setId: number; flashcardId: number }
  | { kind: 'exam'; setId: number; examId: number };
