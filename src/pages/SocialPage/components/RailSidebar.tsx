import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Brain,
  ChevronDown,
  ClipboardList,
  Eye,
  GraduationCap,
  Flame,
  TrendingUp,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useTrendingResources,
  useTrendingCreators,
  useTrendingTopics,
} from '@/hooks/useSocial';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { socialAPI } from '@/services/endpoints/social';
import type { TrendingPeriod, TrendingResource } from '@/services/types/social.types';

const RESOURCE_PATH: Record<TrendingResource['type'], string> = {
  NOTE: 'notes',
  FLASHCARD: 'flashcards',
  EXAM: 'exams',
};

// ─── UserAvatar ───────────────────────────────────────────────────────────────

export const UserAvatar = ({
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

  return (
    <Avatar className='shrink-0' style={{ width: size, height: size }}>
      {src && <AvatarImage src={src} alt={name} className='object-cover' />}
      <AvatarFallback
        className='text-white font-semibold'
        style={{
          background: `linear-gradient(135deg, oklch(0.68 0.14 ${h}), oklch(0.55 0.16 ${(h + 40) % 360}))`,
          fontSize: size * 0.38,
        }}
      >
        {initials}
      </AvatarFallback>
    </Avatar>
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

// ─── TYPE_META ────────────────────────────────────────────────────────────────

const TYPE_META = {
  NOTE: {
    labelKey: 'social.rail.typNote',
    cls: 'text-[var(--pl-warning-text)]',
    icon: BookOpen,
  },
  FLASHCARD: {
    labelKey: 'social.rail.typFlashcard',
    cls: 'text-[var(--pl-accent)]',
    icon: Brain,
  },
  EXAM: {
    labelKey: 'social.rail.typExam',
    cls: 'text-[var(--pl-danger-text)]',
    icon: ClipboardList,
  },
} as const;

const RANK_MEDAL = ['🥇', '🥈', '🥉'];

// ─── TrendingPanel ────────────────────────────────────────────────────────────

const TrendingPanel = ({ period }: { period: TrendingPeriod }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading } = useTrendingResources({ period, top: 5 });

  const openResource = (item: TrendingResource) => {
    if (item.setId == null) return;
    socialAPI.postViewLog(item.type, item.id).catch(() => {});
    navigate(`/sets/${item.setId}/${RESOURCE_PATH[item.type]}/${item.id}`, {
      state: { backTo: '/social' },
    });
  };

  return (
    <RailPanel kicker={t('social.rail.trendingKicker')} title={t('social.rail.trendingTitle')}>
      <div className='px-2 pb-3'>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex gap-3 px-2.5 py-2.5'>
              <Skeleton className='w-5 h-4 shrink-0' />
              <div className='flex-1 flex flex-col gap-1.5'>
                <Skeleton className='h-3 w-4/5' />
                <Skeleton className='h-2.5 w-2/3' />
              </div>
            </div>
          ))}
        {!isLoading &&
          (data ?? []).map((item) => {
            const m = TYPE_META[item.type];
            const TypeIcon = m.icon;
            return (
              <Button
                key={item.id}
                variant='ghost'
                onClick={() => openResource(item)}
                className='w-full flex gap-3 px-2.5 py-2.5 rounded-[8px] h-auto text-left items-start justify-start'
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
                    <TypeIcon size={10} className={m.cls} />
                    <span className={m.cls}>{t(m.labelKey)}</span>
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
                    <span className='flex items-center gap-0.5 text-[var(--pl-warning-text)]'>
                      <Flame size={9} />
                      {item.trendingScore}
                    </span>
                  </div>
                </div>
              </Button>
            );
          })}
        {!isLoading && (data ?? []).length === 0 && (
          <p className='px-2.5 py-4 text-[12px] text-[var(--pl-text-faint)] text-center'>
            {t('social.rail.noTrending')}
          </p>
        )}
      </div>
    </RailPanel>
  );
};

// ─── TopCreatorsPanel ─────────────────────────────────────────────────────────

const TopCreatorsPanel = ({ period }: { period: TrendingPeriod }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useTrendingCreators({ period, top: 5 });

  return (
    <RailPanel kicker={t('social.rail.creatorsKicker')} title={t('social.rail.creatorsTitle')}>
      <div className='px-2 pb-3'>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center gap-2.5 px-2.5 py-2'>
              <Skeleton className='w-4 h-3 shrink-0' />
              <Skeleton className='w-7 h-7 rounded-full shrink-0' />
              <div className='flex-1 flex flex-col gap-1.5'>
                <Skeleton className='h-3 w-3/4' />
                <Skeleton className='h-2.5 w-1/2' />
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
              <UserAvatar name={creator.fullName} src={creator.avatarUrl} size={28} />
              <div className='flex-1 min-w-0 text-left'>
                <div className='text-[12.5px] font-medium truncate text-[var(--pl-text)]'>
                  {creator.fullName}
                </div>
                <div
                  style={{ fontFamily: 'var(--font-mono-pl)' }}
                  className='text-[10.5px] text-[var(--pl-text-faint)]'
                >
                  {t('social.rail.resources', { count: creator.totalResources })}
                </div>
              </div>
              {creator.newResourcesInPeriod > 0 && (
                <span
                  style={{ fontFamily: 'var(--font-mono-pl)', color: 'var(--pl-success)' }}
                  className='text-[10.5px] shrink-0'
                >
                  +{creator.newResourcesInPeriod}
                </span>
              )}
            </div>
          ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className='px-2.5 py-4 text-[12px] text-[var(--pl-text-faint)] text-center'>
            {t('social.rail.noCreators')}
          </p>
        )}
      </div>
    </RailPanel>
  );
};

// ─── TrendingTopicsPanel ──────────────────────────────────────────────────────

const TrendingTopicsPanel = ({ period }: { period: TrendingPeriod }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useTrendingTopics({ period, top: 6 });

  return (
    <RailPanel kicker={t('social.rail.topicsKicker')} title={t('social.rail.topicsTitle')}>
      <div className='px-[18px] pb-4'>
        {isLoading &&
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={cn('flex justify-between py-2.5', i > 0 && 'border-t border-[var(--pl-border)]')}>
              <Skeleton className='h-3 w-2/5' />
              <Skeleton className='h-3 w-1/5' />
            </div>
          ))}
        {!isLoading &&
          (data ?? []).map((topic, i) => (
            <Button
              key={topic.topic}
              variant='ghost'
              className={cn(
                'flex items-center justify-between py-2.5 w-full h-auto rounded-none text-left hover:opacity-80 hover:bg-transparent',
                i > 0 && 'border-t border-[var(--pl-border)]',
              )}
            >
              <div className='flex items-baseline gap-2'>
                <span className='text-[13.5px] text-[var(--pl-text)]'>{topic.topic}</span>
                <span
                  style={{ fontFamily: 'var(--font-mono-pl)' }}
                  className='text-[10.5px] text-[var(--pl-text-faint)]'
                >
                  {topic.totalResources.toLocaleString()}
                </span>
              </div>
              {topic.newResourcesInPeriod > 0 && (
                <span
                  style={{ fontFamily: 'var(--font-mono-pl)', color: 'var(--pl-success)' }}
                  className='text-[10.5px]'
                >
                  +{topic.newResourcesInPeriod}
                </span>
              )}
            </Button>
          ))}
        {!isLoading && (data ?? []).length === 0 && (
          <p className='py-4 text-[12px] text-[var(--pl-text-faint)] text-center'>
            {t('social.rail.noTopics')}
          </p>
        )}
      </div>
    </RailPanel>
  );
};

// ─── RailContent ──────────────────────────────────────────────────────────────

const RailContent = () => {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<TrendingPeriod>('D7');

  const PERIOD_TABS: { id: TrendingPeriod; label: string }[] = [
    { id: 'H24', label: '24h' },
    { id: 'D7', label: '7d' },
    { id: 'D30', label: '30d' },
    { id: 'ALL_TIME', label: t('social.rail.periodAll') },
  ];

  return (
    <>
      {/* Period switcher */}
      <div className='flex gap-1'>
        {PERIOD_TABS.map((tab) => (
          <Button
            key={tab.id}
            variant='ghost'
            onClick={() => setPeriod(tab.id)}
            className={cn(
              'flex-1 py-1 rounded-full text-[11.5px] h-auto font-[family-name:var(--font-mono-pl)]',
              period === tab.id
                ? 'text-[var(--pl-accent)] font-medium bg-[var(--pl-accent-soft)]'
                : 'text-[var(--pl-text-faint)]',
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <TrendingPanel period={period} />
      <TopCreatorsPanel period={period} />
      <TrendingTopicsPanel period={period} />
      <div className='px-4 py-3.5 rounded-[12px] border border-dashed border-[var(--pl-border)] text-[11.5px] text-[var(--pl-text-faint)] leading-relaxed'>
        {t('social.rail.footer')}
      </div>
    </>
  );
};

// ─── RailSidebar ──────────────────────────────────────────────────────────────

const RailSidebar = () => (
  <aside className='hidden lg:flex flex-col gap-4 sticky top-6'>
    <RailContent />
  </aside>
);

// ─── MobileRail ───────────────────────────────────────────────────────────────

export const MobileRail = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className='lg:hidden mt-10'>
      <CollapsibleTrigger asChild>
        <Button
          variant='ghost'
          className='w-full justify-between px-4 py-3 h-auto rounded-[12px] border border-[var(--pl-border)] bg-[var(--pl-bg-elev)] text-[13px] font-medium text-[var(--pl-text)]'
        >
          <span className='flex items-center gap-2'>
            <TrendingUp size={14} className='text-[var(--pl-accent)]' />
            {t('social.rail.mobileToggle')}
          </span>
          <ChevronDown
            size={15}
            className={cn(
              'text-[var(--pl-text-faint)] transition-transform',
              open && 'rotate-180',
            )}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className='flex flex-col gap-4 pt-4'>
          <RailContent />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default RailSidebar;
