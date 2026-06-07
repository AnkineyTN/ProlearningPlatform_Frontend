export function formatPeriod(from: string, to: string, locale: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === 'vi' ? 'vi-VN' : 'en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  return `${fmt(from)} – ${fmt(to)}`;
}
