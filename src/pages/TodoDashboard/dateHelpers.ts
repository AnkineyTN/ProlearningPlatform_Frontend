export const toIsoDate = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const todayIso = (): string => toIsoDate(new Date());

export const getMondayOfWeek = (d: Date): Date => {
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + diff);
};

export const addDays = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

export const addMonths = (d: Date, n: number): Date =>
  new Date(d.getFullYear(), d.getMonth() + n, 1);

export const startOfMonth = (year: number, month: number): Date =>
  new Date(year, month, 1);

export const endOfMonth = (year: number, month: number): Date =>
  new Date(year, month + 1, 0);

export const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const formatWeekRange = (start: Date, locale: string): string => {
  const end = addDays(start, 6);
  const sameMonth = start.getMonth() === end.getMonth();
  const startLabel = start.toLocaleDateString(locale, { month: "short", day: "numeric" });
  const endLabel = sameMonth
    ? end.toLocaleDateString(locale, { day: "numeric" })
    : end.toLocaleDateString(locale, { month: "short", day: "numeric" });
  return `${startLabel} – ${endLabel}`;
};
