import { useEffect, useMemo, useState } from 'react';
import { useSetData, useUpdateSet } from '@/hooks/useSets';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Flame,
  FlipHorizontal,
  Search,
  Target,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { type Set } from '@/components/cards/SetCard';
import CreateNewModal from '@/components/modals/CreateNewModal';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { getTimeAgo } from '@/lib/utils';
import { type UpdateSetPayload } from '@/services/types/set.types';
import ModeToggle from '@/components/theme/mode-toggle';
import NotificationBell from '@/components/notifications/NotificationBell';
import LanguageToggle from '@/components/language/language-toggle';
import { cn } from '@/lib/utils';
import ActivityHeatmap from '@/components/cards/ActivityHeatmap';
import { useStreak, useActivitySummary } from '@/hooks/useActivityLog';

/* ── helpers ─────────────────────────────────────────────── */
function parseGlobalSearchItems(data: unknown): Record<string, unknown>[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data as Record<string, unknown>[];
  if (typeof data === 'object') {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.content)) return o.content as Record<string, unknown>[];
    if (Array.isArray(o.items)) return o.items as Record<string, unknown>[];
    if (Array.isArray(o.data)) return o.data as Record<string, unknown>[];
  }
  return [];
}

function searchResultTitle(item: Record<string, unknown>): string {
  const raw = item.title ?? item.name ?? item.code ?? item.id;
  return raw != null ? String(raw) : '—';
}

function searchResultHref(item: Record<string, unknown>): string | null {
  const id = item.id ?? item.resourceId;
  if (id == null) return null;
  const typeRaw = item.type ?? item.resourceType ?? item.searchType ?? '';
  const type = String(typeRaw).toUpperCase();
  const setId = item.setId ?? item.set_id;
  if (type.includes('SET')) return `/sets/${id}`;
  if (type.includes('NOTE') && setId != null)
    return `/sets/${setId}/notes/${id}`;
  if (type.includes('NOTE')) return `/note/${id}`;
  if (type.includes('FLASH') && setId != null)
    return `/sets/${setId}/flashcards/${id}`;
  if (type.includes('EXAM') && setId != null)
    return `/sets/${setId}/exams/${id}`;
  return null;
}

/* ── stat card ───────────────────────────────────────────── */
function StatCard({
  kicker,
  value,
  unit,
  hint,
  trend,
  trendDir,
  icon,
  progress,
}: {
  kicker: string;
  value: string;
  unit: string;
  hint?: string;
  trend?: string;
  trendDir?: 'up' | 'down';
  icon?: React.ReactNode;
  progress?: number;
}) {
  return (
    <div className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] px-5 pt-[18px] pb-5 overflow-hidden'>
      <div className='flex justify-between items-start'>
        <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)]'>
          {kicker}
        </div>
        {icon && <span className='text-[var(--pl-accent)]'>{icon}</span>}
      </div>
      <div className='flex items-baseline gap-[6px] mt-[14px]'>
        <span className='text-[40px] font-semibold tracking-[-0.03em] leading-none text-[var(--pl-text)]'>
          {value}
        </span>
        <span className='text-[13px] text-[var(--pl-text-muted)] tabular-nums'>
          {unit}
        </span>
      </div>
      {progress !== undefined && (
        <div className='mt-3 h-[3px] bg-[var(--pl-border)] rounded-full overflow-hidden'>
          <div
            className='h-full bg-[var(--pl-accent)]'
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <div className='mt-[10px] flex justify-between text-[11px] text-[var(--pl-text-faint)]'>
        <span>{hint}</span>
        {trend && (
          <span
            className={cn(
              'tabular-nums',
              trendDir === 'up'
                ? 'text-[var(--pl-success,oklch(0.72_0.15_155))]'
                : 'text-[var(--pl-danger,oklch(0.65_0.2_25))]',
            )}
          >
            {trendDir === 'up' ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── panel wrapper ───────────────────────────────────────── */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[14px] overflow-hidden'>
      {children}
    </section>
  );
}

function PanelHead({
  kicker,
  title,
  right,
}: {
  kicker?: string;
  title?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className='px-6 pt-[18px] pb-[14px] flex items-end justify-between gap-3'>
      <div>
        {kicker && (
          <div className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)] mb-1'>
            {kicker}
          </div>
        )}
        {title && (
          <div className='text-[18px] font-semibold tracking-[-0.015em] text-[var(--pl-text)]'>
            {title}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

/* ── mini calendar ───────────────────────────────────────── */
function MiniCalendar() {
  const now = new Date();
  const [current, setCurrent] = useState(now);
  const year = current.getFullYear();
  const month = current.getMonth();
  const today = now.getDate();
  const sameMonth = now.getFullYear() === year && now.getMonth() === month;

  const monthName = current.toLocaleString('default', { month: 'long' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const studyDays = useMemo(
    () => new Set([1, 3, 5, 7, 8, 10, 12, 14, 15, 17, 18, 19]),
    [],
  );

  const prev = () => setCurrent(new Date(year, month - 1, 1));
  const next = () => setCurrent(new Date(year, month + 1, 1));

  return (
    <Panel>
      <PanelHead
        kicker={`${monthName} ${year}`}
        title='This month'
        right={
          <div className='flex gap-1'>
            <button
              onClick={prev}
              className='w-[26px] h-[26px] rounded-[6px] grid place-items-center bg-[var(--pl-bg-hover)] text-[var(--pl-text-muted)] border-0 cursor-pointer'
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={next}
              className='w-[26px] h-[26px] rounded-[6px] grid place-items-center bg-[var(--pl-bg-hover)] text-[var(--pl-text-muted)] border-0 cursor-pointer'
            >
              <ChevronRight size={12} />
            </button>
          </div>
        }
      />
      <div className='px-5 pt-1 pb-[18px]'>
        <div className='grid grid-cols-7 gap-1 text-[10px] text-[var(--pl-text-faint)] text-center mb-[6px]'>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>
        <div className='grid grid-cols-7 gap-1'>
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={'e' + i} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const isToday = sameMonth && d === today;
            const hasActivity = studyDays.has(d);
            return (
              <button
                key={d}
                className={cn(
                  'aspect-square rounded-[6px] grid place-items-center text-[11px] relative border-0 cursor-pointer',
                  isToday
                    ? 'bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] font-semibold'
                    : hasActivity
                      ? 'bg-transparent text-[var(--pl-text)]'
                      : 'bg-transparent text-[var(--pl-text-faint)]',
                )}
              >
                {d}
                {!isToday && hasActivity && (
                  <span className='absolute bottom-[3px] w-[3px] h-[3px] rounded-full bg-[var(--pl-accent)]' />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}

/* ── checklist panel ─────────────────────────────────────── */
const DEFAULT_CHECKLIST = [
  { text: 'Review 20 flashcards', done: false },
  { text: "Complete today's exam", done: false },
  { text: 'Write a note summary', done: false },
  { text: 'Study session 25 min', done: false },
];

function ChecklistPanel() {
  const [items, setItems] = useState(DEFAULT_CHECKLIST);
  const done = items.filter((i) => i.done).length;
  const pct = Math.round((done / items.length) * 100);

  const toggle = (idx: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, done: !item.done } : item)),
    );
  };

  return (
    <Panel>
      <PanelHead
        kicker="Today's practice"
        title='Daily checklist'
        right={
          <span className='tabular-nums text-[12px] text-[var(--pl-text-muted)]'>
            {done}/{items.length} · {pct}%
          </span>
        }
      />
      <div className='px-6 pb-2'>
        <div className='h-[3px] bg-[var(--pl-border)] rounded-full overflow-hidden'>
          <div
            className='h-full bg-[var(--pl-accent)] transition-[width] duration-400'
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className='px-3 pt-2 pb-4'>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => toggle(i)}
            className='w-full flex items-center gap-3 px-3 py-[10px] rounded-[7px] text-left bg-transparent border-0 cursor-pointer transition-[background] duration-150 hover:bg-[var(--pl-bg-hover)]'
          >
            <div
              className={cn(
                'w-[18px] h-[18px] rounded-[5px] grid place-items-center shrink-0 transition-all duration-150',
                item.done
                  ? 'bg-[var(--pl-accent)] border-[1.5px] border-[var(--pl-accent)]'
                  : 'bg-transparent border-[1.5px] border-[var(--pl-border-strong)]',
              )}
            >
              {item.done && (
                <svg
                  width='10'
                  height='10'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='var(--pl-accent-fg)'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M20 6L9 17l-5-5' />
                </svg>
              )}
            </div>
            <span
              className={cn(
                'text-[13.5px]',
                item.done
                  ? 'line-through text-[var(--pl-text-faint)]'
                  : 'text-[var(--pl-text)]',
              )}
            >
              {item.text}
            </span>
          </button>
        ))}
      </div>
    </Panel>
  );
}

/* ── main dashboard ──────────────────────────────────────── */
const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const updateSetMutation = useUpdateSet();
  const [selectedSet, setSelectedSet] = useState<Set | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data: streak } = useStreak();
  const { data: summary } = useActivitySummary(7);

  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(searchKeyword.trim()),
      400,
    );
    return () => window.clearTimeout(timer);
  }, [searchKeyword]);

  const {
    data: searchPayload,
    isFetching: searchLoading,
    isError: searchError,
  } = useGlobalSearch(debouncedSearch, { size: 15 });
  const searchItems = parseGlobalSearchItems(searchPayload?.data);

  const { data: setData } = useSetData({
    page: 0,
    size: 5,
    sort: [{ property: 'id', direction: 'DESC' }],
  });
  const sets: Set[] = ((setData?.data?.data as unknown[]) || []).map(
    (item: unknown) => {
      const i = item as Record<string, unknown>;
      return {
        id: i.id as number,
        title: i.title as string,
        code: i.code as string,
        progress: i.progress as number,
        duration: i.duration as string,
        flashcards: i.flashcards as number,
        tests: i.tests as number,
        audio: i.audio as number,
        video: i.video as string,
        lastUpdated: i.lastUpdated as string,
        date: i.date as string,
        description: (i.description as string) ?? '',
        numNotes: (i.numNotes as number) ?? 0,
        updated_at: getTimeAgo(i.updatedAt as string),
        created_at: new Date(i.createdAt as string).toLocaleDateString(
          'en-GB',
          {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          },
        ),
      };
    },
  );

  const handleUpdateSubmit = async (data: Record<string, unknown>) => {
    if (!selectedSet) return;
    try {
      const payload: UpdateSetPayload = {
        ...(data as UpdateSetPayload),
        privacy: data.privacy === 'PUBLIC' ? 'PUBLIC' : 'PRIVATE',
      };
      await updateSetMutation.mutateAsync({ id: selectedSet.id, payload });
      setIsUpdateModalOpen(false);
      setSelectedSet(null);
    } catch {
      toast.error('Failed to update set');
    }
  };

  const weekMinutes = summary?.totalMinutes ?? 0;
  const weekHours = (weekMinutes / 60).toFixed(1);

  return (
    <div className='min-h-screen bg-[var(--pl-bg)] transition-[background] duration-300'>
      {/* Top bar */}
      <div className='px-10 pt-5 flex justify-between items-center'>
        <div>
          <div className='text-[11px] tracking-[0.14em] uppercase text-[var(--pl-text-faint)] mb-1'>
            {new Date().toLocaleDateString('en-GB', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </div>
          <h1
            className='text-5xl tracking-[-0.02em] text-[var(--pl-text)] m-0'
            style={{
              fontFamily: 'var(--font-display)',
            }}
          >
            {t('header.welcome')}
          </h1>
        </div>
        <div className='flex items-center gap-3'>
          {/* search */}
          <div className='flex items-center gap-2 px-[14px] py-2 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-full w-[260px]'>
            <Search
              size={14}
              className='text-[var(--pl-text-faint)] shrink-0'
            />
            <input
              placeholder={t('header.search')}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className='bg-transparent border-0 outline-none text-[13px] text-[var(--pl-text)] w-full'
            />
          </div>
          <NotificationBell />
          <ModeToggle />
          <LanguageToggle />
        </div>
      </div>

      <div className='px-10 pt-6 pb-[60px]'>
        {/* Search results overlay */}
        {debouncedSearch.length > 0 && (
          <div className='mb-6 bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[12px] p-4'>
            <div className='text-[13px] font-semibold text-[var(--pl-text)] mb-[10px]'>
              Search results
            </div>
            {searchLoading && (
              <p className='text-[13px] text-[var(--pl-text-faint)]'>
                Searching…
              </p>
            )}
            {searchError && (
              <p className='text-[13px] text-[var(--pl-danger,#e55)]'>
                Search failed. Try again.
              </p>
            )}
            {!searchLoading && !searchError && searchItems.length === 0 && (
              <p className='text-[13px] text-[var(--pl-text-faint)]'>
                No matches.
              </p>
            )}
            {!searchLoading && searchItems.length > 0 && (
              <ul className='list-none m-0 p-0'>
                {searchItems.map((item, idx) => {
                  const href = searchResultHref(item);
                  const title = searchResultTitle(item);
                  return (
                    <li
                      key={`${title}-${idx}`}
                      className={cn(
                        'flex items-center justify-between py-2 text-[13px]',
                        idx > 0 && 'border-t border-t-[var(--pl-border)]',
                      )}
                    >
                      <span className='text-[var(--pl-text)] font-medium'>
                        {title}
                      </span>
                      {href && (
                        <button
                          onClick={() => navigate(href)}
                          className='flex items-center gap-[5px] text-[12px] text-[var(--pl-accent-strong)] bg-transparent border-0 cursor-pointer'
                        >
                          <ExternalLink size={12} />
                          Open
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* ── Stat cards ── */}
        <div className='grid grid-cols-4 gap-[14px] mb-6'>
          <StatCard
            kicker='Current streak'
            value={streak ? String(streak.currentStreak) : '—'}
            unit='days'
            hint={streak?.studiedToday ? 'Studied today ✓' : 'Not studied yet'}
            trend={
              streak && streak.longestStreak > 0
                ? `Best ${streak.longestStreak}d`
                : undefined
            }
            trendDir='up'
            icon={<Flame size={20} />}
          />
          <StatCard
            kicker='Focus this week'
            value={weekHours}
            unit='h'
            hint={`${summary?.totalSessions ?? 0} sessions`}
            icon={<Timer size={18} />}
          />
          <StatCard
            kicker='Active sets'
            value={String(sets.length || 0)}
            unit='sets'
            hint='Tap to explore'
            icon={<Target size={18} />}
          />
          <StatCard
            kicker='Avg exam score'
            value={
              summary?.avgExamScore != null
                ? String(Math.round(summary.avgExamScore))
                : '—'
            }
            unit='%'
            hint='Last 7 days'
            icon={<TrendingUp size={18} />}
          />
        </div>

        {/* ── Main 2-col grid ── */}
        <div className='grid grid-cols-[1.55fr_1fr] gap-[18px]'>
          {/* Left column */}
          <div className='flex flex-col gap-[18px]'>
            <ChecklistPanel />

            {/* Recent sets */}
            <Panel>
              <PanelHead
                kicker='Your library'
                title='Recent sets'
                right={
                  <button
                    onClick={() => navigate('/sets')}
                    className='flex items-center gap-1 text-[12.5px] text-[var(--pl-text-muted)] bg-transparent border-0 cursor-pointer'
                  >
                    View all <ArrowRight size={11} />
                  </button>
                }
              />
              <div className='px-3 pt-1 pb-4'>
                {sets.length === 0 && (
                  <p className='px-[14px] py-3 text-[13px] text-[var(--pl-text-faint)]'>
                    No sets yet. Create your first set!
                  </p>
                )}
                {sets.map((s, i) => (
                  <button
                    key={s.id ?? i}
                    onClick={() => navigate(`/sets/${s.id}`)}
                    className='w-full flex items-center gap-[14px] px-[14px] py-3 rounded-lg text-left bg-transparent border-0 cursor-pointer transition-[background] duration-150 hover:bg-[var(--pl-bg-hover)]'
                  >
                    <div className='w-10 h-10 rounded-[10px] shrink-0 bg-[var(--pl-accent-soft)] border border-[var(--pl-accent-border)] text-[var(--pl-accent-strong)] grid place-items-center'>
                      <BookOpen size={16} />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='text-[14px] font-semibold text-[var(--pl-text)] overflow-hidden text-ellipsis whitespace-nowrap'>
                        {s.title}
                      </div>
                      {s.description && (
                        <div className='text-[12px] text-[var(--pl-text-muted)] mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap'>
                          {s.description}
                        </div>
                      )}
                    </div>
                    <div className='flex gap-[14px] text-[11.5px] text-[var(--pl-text-faint)] shrink-0 tabular-nums'>
                      <span>{s.numNotes} notes</span>
                      <span>{s.flashcards ?? 0} cards</span>
                      <span>{s.updated_at}</span>
                    </div>
                    <ArrowRight
                      size={13}
                      className='text-[var(--pl-text-faint)] shrink-0'
                    />
                  </button>
                ))}
              </div>
            </Panel>
          </div>

          {/* Right column */}
          <div className='flex flex-col gap-[18px]'>
            <MiniCalendar />
            <ActivityHeatmap months={6} />

            {/* Quick start */}
            <Panel>
              <PanelHead title='Quick start' />
              <div className='px-3 pt-1 pb-4 grid grid-cols-2 gap-2'>
                {[
                  {
                    icon: <FlipHorizontal size={16} />,
                    label: 'Flashcards',
                    sub: 'Review due',
                  },
                  {
                    icon: <Zap size={16} />,
                    label: 'Quick Quiz',
                    sub: 'Start now',
                  },
                  {
                    icon: <Timer size={16} />,
                    label: 'Focus timer',
                    sub: '25 min',
                  },
                  {
                    icon: <BookOpen size={16} />,
                    label: 'New note',
                    sub: 'Write',
                  },
                ].map((a) => (
                  <button
                    key={a.label}
                    className='px-[14px] py-3 rounded-[10px] bg-[var(--pl-bg-hover)] border border-[var(--pl-border)] flex flex-col items-start gap-[6px] text-left cursor-pointer transition-all duration-150 hover:border-[var(--pl-accent-border)] hover:bg-[var(--pl-accent-soft)]'
                  >
                    <span className='text-[var(--pl-accent)]'>{a.icon}</span>
                    <div className='text-[12.5px] font-semibold text-[var(--pl-text)]'>
                      {a.label}
                    </div>
                    <div className='text-[10.5px] text-[var(--pl-text-faint)]'>
                      {a.sub}
                    </div>
                  </button>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {selectedSet && (
        <CreateNewModal
          isUpdateMode
          type='Set'
          isOpen={isUpdateModalOpen}
          onClose={() => {
            setIsUpdateModalOpen(false);
            setSelectedSet(null);
          }}
          onSubmit={handleUpdateSubmit}
          initialData={{
            title: selectedSet.title,
            description: selectedSet.description,
            privacy: 'Public',
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
