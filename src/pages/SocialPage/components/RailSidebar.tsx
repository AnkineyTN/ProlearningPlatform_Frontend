import { useState } from 'react';
import { BookOpen, Brain, ClipboardList, Eye, GraduationCap, Flame } from 'lucide-react';
import {
  useTrendingResources,
  useTrendingCreators,
  useTrendingTopics,
} from '@/hooks/useSocial';
import type { TrendingPeriod } from '@/services/types/social.types';
// ─── Avatar ────────────────────────────────────────────────────────────────────

export const Avatar = ({
  name,
  src,
  hue,
  size = 28,
}: {
  name: string;
  src?: string | null;
  hue?: number;
  size?: number;
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
  const h = hue ?? ((name.charCodeAt(0) * 37 + name.charCodeAt(1 % name.length) * 17) % 360);
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className='rounded-full object-cover shrink-0'
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className='grid place-items-center text-white font-semibold shrink-0'
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, oklch(0.68 0.14 ${h}), oklch(0.55 0.16 ${(h + 40) % 360}))`,
        fontSize: size * 0.38,
      }}
    >
      {initials}
    </div>
  );
};

// ─── RailPanel ────────────────────────────────────────────────────────────────

const RailPanel = ({
  kicker,
  title,
  children,
  rightLabel,
}: {
  kicker?: string;
  title: string;
  children: React.ReactNode;
  rightLabel?: string;
}) => (
  <section className='bg-[var(--pl-bg-elev)] border border-[var(--pl-border)] rounded-[12px] overflow-hidden'>
    <div className='px-[18px] pt-4 pb-3 flex items-end justify-between gap-2'>
      <div>
        {kicker && (
          <div
            style={{ fontFamily: 'var(--font-mono-pl)' }}
            className='text-[10px] tracking-[0.16em] uppercase text-[var(--pl-text-faint)] mb-1'
          >
            {kicker}
          </div>
        )}
        <div
          style={{ fontFamily: 'var(--font-display)' }}
          className='text-[16px] font-medium tracking-[-0.015em] text-[var(--pl-text)]'
        >
          {title}
        </div>
      </div>
      {rightLabel && (
        <span
          style={{ fontFamily: 'var(--font-mono-pl)' }}
          className='text-[10.5px] text-[var(--pl-text-faint)]'
        >
          {rightLabel}
        </span>
      )}
    </div>
    {children}
  </section>
);

// ─── PeriodTabs ───────────────────────────────────────────────────────────────

const PERIOD_TABS: { id: TrendingPeriod; label: string }[] = [
  { id: 'H24', label: '24h' },
  { id: 'D7', label: '7d' },
  { id: 'D30', label: '30d' },
  { id: 'ALL_TIME', label: 'All' },
];

const TYPE_META = {
  NOTE: { label: 'Note', color: 'oklch(0.7 0.12 95)', icon: BookOpen },
  FLASHCARD: { label: 'Flashcard', color: 'oklch(0.7 0.12 200)', icon: Brain },
  EXAM: { label: 'Exam', color: 'oklch(0.72 0.13 28)', icon: ClipboardList },
} as const;

const RANK_MEDAL = ['🥇', '🥈', '🥉'];

// ─── TrendingPanel ────────────────────────────────────────────────────────────

const TrendingPanel = ({ period }: { period: TrendingPeriod }) => {
  const { data, isLoading } = useTrendingResources({ period, top: 5 });

  return (
    <RailPanel kicker='Right now' title='Trending'>
      <div className='px-2 pb-3'>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex gap-3 px-2.5 py-2.5 animate-pulse'>
              <div className='w-5 h-4 rounded bg-[var(--pl-bg-hover)] shrink-0' />
              <div className='flex-1 flex flex-col gap-1.5'>
                <div className='h-3 w-4/5 rounded bg-[var(--pl-bg-hover)]' />
                <div className='h-2.5 w-2/3 rounded bg-[var(--pl-bg-hover)]' />
              </div>
            </div>
          ))}
        {!isLoading &&
          (data ?? []).map((item) => {
            const m = TYPE_META[item.type];
            const TypeIcon = m.icon;
            return (
              <button
                key={item.id}
                className='w-full flex gap-3 px-2.5 py-2.5 rounded-[8px] hover:bg-[var(--pl-bg-hover)] transition-colors text-left items-start'
              >
                <span
                  style={{
                    fontFamily: 'var(--font-display)',
                    color: item.rank <= 3 ? 'var(--pl-accent)' : 'var(--pl-text-faint)',
                  }}
                  className='text-[18px] font-medium tracking-[-0.02em] leading-none w-6 shrink-0 mt-0.5'
                >
                  {item.rank <= 3 ? RANK_MEDAL[item.rank - 1] : String(item.rank).padStart(2, '0')}
                </span>
                <div className='flex-1 min-w-0'>
                  <div className='text-[12.5px] font-medium leading-[1.35] line-clamp-2 text-[var(--pl-text)]'>
                    {item.title}
                  </div>
                  <div
                    style={{ fontFamily: 'var(--font-mono-pl)' }}
                    className='flex items-center gap-1.5 mt-1 text-[10.5px] text-[var(--pl-text-faint)]'
                  >
                    <TypeIcon size={10} style={{ color: m.color }} />
                    <span style={{ color: m.color }}>{m.label}</span>
                    <span>·</span>
                    <span>{item.ownerName}</span>
                  </div>
                  <div
                    style={{ fontFamily: 'var(--font-mono-pl)' }}
                    className='flex items-center gap-2 mt-1 text-[10px] text-[var(--pl-text-faint)]'
                  >
                    <span className='flex items-center gap-0.5'>
                      <Eye size={9} />
                      {item.viewCount}
                    </span>
                    <span className='flex items-center gap-0.5'>
                      <GraduationCap size={9} />
                      {item.sessionCount}
                    </span>
                    <span className='flex items-center gap-0.5' style={{ color: 'oklch(0.72 0.18 40)' }}>
                      <Flame size={9} />
                      {item.trendingScore}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        {!isLoading && (data ?? []).length === 0 && (
          <p className='px-2.5 py-4 text-[12px] text-[var(--pl-text-faint)] text-center'>
            No trending resources yet.
          </p>
        )}
      </div>
    </RailPanel>
  );
};

// ─── TopCreatorsPanel ─────────────────────────────────────────────────────────

const TopCreatorsPanel = ({ period }: { period: TrendingPeriod }) => {
  const { data, isLoading } = useTrendingCreators({ period, top: 5 });

  return (
    <RailPanel kicker='This period' title='Top creators'>
      <div className='px-2 pb-3'>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center gap-2.5 px-2.5 py-2 animate-pulse'>
              <div className='w-4 h-3 rounded bg-[var(--pl-bg-hover)] shrink-0' />
              <div className='w-7 h-7 rounded-full bg-[var(--pl-bg-hover)] shrink-0' />
              <div className='flex-1 flex flex-col gap-1.5'>
                <div className='h-3 w-3/4 rounded bg-[var(--pl-bg-hover)]' />
                <div className='h-2.5 w-1/2 rounded bg-[var(--pl-bg-hover)]' />
              </div>
            </div>
          ))}
        {!isLoading &&
          (data ?? []).map((creator) => (
            <div
              key={creator.userId}
              className='w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-[var(--pl-bg-hover)] transition-colors'
            >
              <span
                style={{ fontFamily: 'var(--font-mono-pl)' }}
                className='text-[11px] text-[var(--pl-text-faint)] w-4 text-right shrink-0'
              >
                {creator.rank <= 3 ? RANK_MEDAL[creator.rank - 1] : String(creator.rank).padStart(2, '0')}
              </span>
              <Avatar name={creator.fullName} src={creator.avatarUrl} size={28} />
              <div className='flex-1 min-w-0 text-left'>
                <div className='text-[12.5px] font-medium truncate text-[var(--pl-text)]'>
                  {creator.fullName}
                </div>
                <div
                  style={{ fontFamily: 'var(--font-mono-pl)' }}
                  className='text-[10.5px] text-[var(--pl-text-faint)]'
                >
                  {creator.totalResources} resources
                </div>
              </div>
              {creator.newResourcesInPeriod > 0 && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono-pl)',
                    color: 'var(--pl-success)',
                  }}
                  className='text-[10.5px] shrink-0'
                >
                  +{creator.newResourcesInPeriod}
                </span>
              )}
            </div>
          ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className='px-2.5 py-4 text-[12px] text-[var(--pl-text-faint)] text-center'>
            No creators yet.
          </p>
        )}
      </div>
    </RailPanel>
  );
};

// ─── TrendingTopicsPanel ──────────────────────────────────────────────────────

const TrendingTopicsPanel = ({ period }: { period: TrendingPeriod }) => {
  const { data, isLoading } = useTrendingTopics({ period, top: 6 });

  return (
    <RailPanel kicker='Explore' title='Trending topics'>
      <div className='px-[18px] pb-4'>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex justify-between py-2.5 border-t border-[var(--pl-border)] first:border-t-0 animate-pulse'>
              <div className='h-3 w-2/5 rounded bg-[var(--pl-bg-hover)]' />
              <div className='h-3 w-1/5 rounded bg-[var(--pl-bg-hover)]' />
            </div>
          ))}
        {!isLoading &&
          (data ?? []).map((topic, i) => (
            <button
              key={topic.topic}
              className={`flex items-center justify-between py-2.5 w-full text-left hover:opacity-80 transition-opacity ${i > 0 ? 'border-t border-[var(--pl-border)]' : ''}`}
            >
              <div className='flex items-baseline gap-2'>
                <span className='text-[13.5px] text-[var(--pl-text)]'>
                  {topic.topic}
                </span>
                <span
                  style={{ fontFamily: 'var(--font-mono-pl)' }}
                  className='text-[10.5px] text-[var(--pl-text-faint)]'
                >
                  {topic.totalResources.toLocaleString()}
                </span>
              </div>
              {topic.newResourcesInPeriod > 0 && (
                <span
                  style={{
                    fontFamily: 'var(--font-mono-pl)',
                    color: 'var(--pl-success)',
                  }}
                  className='text-[10.5px]'
                >
                  +{topic.newResourcesInPeriod}
                </span>
              )}
            </button>
          ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className='py-4 text-[12px] text-[var(--pl-text-faint)] text-center'>
            No topics yet.
          </p>
        )}
      </div>
    </RailPanel>
  );
};

// ─── RailSidebar ──────────────────────────────────────────────────────────────

const RailSidebar = () => {
  const [period, setPeriod] = useState<TrendingPeriod>('D7');

  return (
    <aside className='hidden lg:flex flex-col gap-4 sticky top-6'>
      {/* Period switcher */}
      <div className='flex gap-1'>
        {PERIOD_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPeriod(tab.id)}
            className='flex-1 py-1 rounded-full text-[11.5px] transition-all'
            style={
              period === tab.id
                ? {
                    background:
                      'oklch(var(--pl-accent-l) var(--pl-accent-c) var(--pl-accent-h) / 0.12)',
                    color: 'var(--pl-accent)',
                    fontWeight: 500,
                    fontFamily: 'var(--font-mono-pl)',
                  }
                : {
                    color: 'var(--pl-text-faint)',
                    fontFamily: 'var(--font-mono-pl)',
                  }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <TrendingPanel period={period} />
      <TopCreatorsPanel period={period} />
      <TrendingTopicsPanel period={period} />
      <div className='px-4 py-3.5 rounded-[12px] border border-dashed border-[var(--pl-border)] text-[11.5px] text-[var(--pl-text-faint)] leading-relaxed'>
        Everything here is shared by users. Forking a set keeps a link back to the
        original author.
      </div>
    </aside>
  );
};

export default RailSidebar;
