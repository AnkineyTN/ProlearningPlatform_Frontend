import {
  TRENDING_ITEMS,
  TOP_CREATORS,
  TRENDING_TOPICS,
  RECENT_ACTIVITY,
  TYPE_META,
} from '../mockData';

// ─── Avatar ────────────────────────────────────────────────────────────────────

export const Avatar = ({
  name,
  hue,
  size = 28,
}: {
  name: string;
  hue: number;
  size?: number;
}) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');
  return (
    <div
      className='grid place-items-center text-white font-semibold shrink-0'
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, oklch(0.68 0.14 ${hue}), oklch(0.55 0.16 ${(hue + 40) % 360}))`,
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

// ─── TrendingPanel ────────────────────────────────────────────────────────────

const TrendingPanel = () => (
  <RailPanel kicker='Right now' title='Trending' rightLabel='Last 24h'>
    <div className='px-2 pb-3'>
      {TRENDING_ITEMS.map((item, i) => {
        const m = TYPE_META[item.type];
        return (
          <button
            key={item.id}
            className='w-full flex gap-3 px-2.5 py-2.5 rounded-[8px] hover:bg-[var(--pl-bg-hover)] transition-colors text-left items-start'
          >
            <span
              style={{
                fontFamily: 'var(--font-display)',
                color: i === 0 ? 'var(--pl-accent)' : 'var(--pl-text-faint)',
              }}
              className='text-[20px] font-medium tracking-[-0.02em] leading-none w-5 shrink-0 mt-0.5'
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className='flex-1 min-w-0'>
              <div className='text-[12.5px] font-medium leading-[1.35] line-clamp-2 text-[var(--pl-text)]'>
                {item.title}
              </div>
              <div
                style={{ fontFamily: 'var(--font-mono-pl)' }}
                className='flex items-center gap-1.5 mt-1 text-[10.5px] text-[var(--pl-text-faint)]'
              >
                <span style={{ color: m.color }}>{m.label}</span>
                <span>·</span>
                <span>{item.author}</span>
                <span>·</span>
                <span>
                  {item.likes >= 1000
                    ? (item.likes / 1000).toFixed(1) + 'k'
                    : item.likes}{' '}
                  ♥
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  </RailPanel>
);

// ─── TopCreatorsPanel ─────────────────────────────────────────────────────────

const TopCreatorsPanel = () => (
  <RailPanel kicker='This week' title='Top creators'>
    <div className='px-2 pb-3'>
      {TOP_CREATORS.map((creator, i) => (
        <button
          key={creator.id}
          className='w-full flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] hover:bg-[var(--pl-bg-hover)] transition-colors'
        >
          <span
            style={{ fontFamily: 'var(--font-mono-pl)' }}
            className='text-[11px] text-[var(--pl-text-faint)] w-4 text-right shrink-0'
          >
            {String(i + 1).padStart(2, '0')}
          </span>
          <Avatar name={creator.name} hue={creator.hue} size={28} />
          <div className='flex-1 min-w-0 text-left'>
            <div className='text-[12.5px] font-medium truncate text-[var(--pl-text)]'>
              {creator.name}
            </div>
            <div
              style={{ fontFamily: 'var(--font-mono-pl)' }}
              className='text-[10.5px] text-[var(--pl-text-faint)]'
            >
              @{creator.handle} · {creator.followers}
            </div>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono-pl)',
              color: 'var(--pl-success)',
            }}
            className='text-[10.5px] shrink-0'
          >
            {creator.delta}
          </span>
        </button>
      ))}
    </div>
  </RailPanel>
);

// ─── TrendingTopicsPanel ──────────────────────────────────────────────────────

const TrendingTopicsPanel = () => (
  <RailPanel kicker='Explore' title='Trending topics'>
    <div className='px-[18px] pb-4'>
      {TRENDING_TOPICS.map((topic, i) => (
        <button
          key={topic.name}
          className={`flex items-center justify-between py-2.5 w-full text-left hover:opacity-80 transition-opacity ${i > 0 ? 'border-t border-[var(--pl-border)]' : ''}`}
        >
          <div className='flex items-baseline gap-2'>
            <span className='text-[13.5px] text-[var(--pl-text)]'>
              {topic.name}
            </span>
            <span
              style={{ fontFamily: 'var(--font-mono-pl)' }}
              className='text-[10.5px] text-[var(--pl-text-faint)]'
            >
              {topic.count.toLocaleString()}
            </span>
          </div>
          <span
            style={{
              fontFamily: 'var(--font-mono-pl)',
              color: 'var(--pl-success)',
            }}
            className='text-[10.5px]'
          >
            {topic.trend}
          </span>
        </button>
      ))}
    </div>
  </RailPanel>
);

// ─── RecentActivityPanel ──────────────────────────────────────────────────────

const RecentActivityPanel = () => (
  <RailPanel kicker='Following' title='Recent activity'>
    <div className='px-2 pb-3'>
      {RECENT_ACTIVITY.map((act) => (
        <div key={act.id} className='flex gap-2.5 px-2.5 py-2.5 rounded-[8px]'>
          <Avatar name={act.name} hue={act.hue} size={24} />
          <div className='flex-1 min-w-0'>
            <div className='text-[12.5px] leading-[1.4] text-[var(--pl-text)]'>
              <span className='font-medium'>{act.name}</span>
              <span className='text-[var(--pl-text-muted)]'> {act.verb} </span>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 13,
                }}
              >
                "{act.what}"
              </span>
            </div>
            <div
              style={{ fontFamily: 'var(--font-mono-pl)' }}
              className='text-[10.5px] text-[var(--pl-text-faint)] mt-0.5'
            >
              {act.when} ago
            </div>
          </div>
        </div>
      ))}
    </div>
  </RailPanel>
);

// ─── RailSidebar ──────────────────────────────────────────────────────────────

const RailSidebar = () => (
  <aside className='hidden lg:flex flex-col gap-4 sticky top-6'>
    <TrendingPanel />
    <TopCreatorsPanel />
    <TrendingTopicsPanel />
    <RecentActivityPanel />
    <div className='px-4 py-3.5 rounded-[12px] border border-dashed border-[var(--pl-border)] text-[11.5px] text-[var(--pl-text-faint)] leading-relaxed'>
      Everything here is shared by users. Forking a set keeps a link back to the
      original author.
    </div>
  </aside>
);

export default RailSidebar;
