import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Layers,
  Loader2,
  Megaphone,
  ShieldAlert,
  Sparkles,
  StickyNote,
  X,
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useAcceptInvite, useDeclineInvite } from '@/hooks/useCollaboration';
import {
  type NotificationTab,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsInfinite,
} from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

import type { UserNotificationItem } from '@/services/types/notification.types';
import type { ResourceType } from '@/services/endpoints/collaboration';

const INVITE_TYPES: Record<string, ResourceType> = {
  NOTE_INVITE: 'notes',
  FLASHCARD_INVITE: 'flashcards',
  EXAM_INVITE: 'exams',
};

function isInviteType(type: string): type is keyof typeof INVITE_TYPES {
  return type in INVITE_TYPES;
}

type TypeConfig = {
  icon: React.ComponentType<{ className?: string; size?: number }>;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  dotColor: string;
};

const NOTIFICATION_TYPE_CONFIG: Record<string, TypeConfig> = {
  CARD_DUE_REMINDER: {
    icon: BookOpen,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500',
    dotColor: 'bg-amber-500',
  },
  STUDY_SESSION_REMINDER: {
    icon: Calendar,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500',
    dotColor: 'bg-blue-500',
  },
  STUDY_STREAK: {
    icon: Sparkles,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500',
    dotColor: 'bg-orange-500',
  },
  ACHIEVEMENT_UNLOCKED: {
    icon: Award,
    iconColor: 'text-yellow-500',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500',
    dotColor: 'bg-yellow-500',
  },
  SYSTEM_ANNOUNCEMENT: {
    icon: Megaphone,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500',
    dotColor: 'bg-purple-500',
  },
  ACCOUNT_ACTIVITY: {
    icon: ShieldAlert,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500',
    dotColor: 'bg-red-500',
  },
  WEEKLY_SUMMARY: {
    icon: ClipboardCheck,
    iconColor: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500',
    dotColor: 'bg-pink-500',
  },
  NOTE_INVITE: {
    icon: StickyNote,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  NOTE_INVITE_ACCEPTED: {
    icon: Check,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500',
    dotColor: 'bg-emerald-500',
  },
  FLASHCARD_INVITE: {
    icon: BookOpen,
    iconColor: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500',
    dotColor: 'bg-cyan-500',
  },
  EXAM_INVITE: {
    icon: FileText,
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500',
    dotColor: 'bg-indigo-500',
  },
  GENERAL: {
    icon: Bell,
    iconColor: 'text-muted-foreground',
    bgColor: 'bg-muted',
    borderColor: 'border-muted-foreground',
    dotColor: 'bg-muted-foreground',
  },
};

const DEFAULT_TYPE_CONFIG: TypeConfig = {
  icon: Bell,
  iconColor: 'text-muted-foreground',
  bgColor: 'bg-muted',
  borderColor: 'border-muted-foreground',
  dotColor: 'bg-muted-foreground',
};

function getTypeConfig(type: string): TypeConfig {
  return NOTIFICATION_TYPE_CONFIG[type] ?? DEFAULT_TYPE_CONFIG;
}

function compactRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

type Bucket = 'today' | 'yesterday' | 'thisWeek' | 'earlier';

function getBucket(iso: string): Bucket {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'earlier';
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const t = d.getTime();
  if (t >= startOfToday) return 'today';
  if (t >= startOfToday - 86_400_000) return 'yesterday';
  if (t >= startOfToday - 7 * 86_400_000) return 'thisWeek';
  return 'earlier';
}

function buildInviteDestUrl(item: UserNotificationItem): string | null {
  const resourceType = INVITE_TYPES[item.type];
  if (!resourceType) return null;
  const data = item.data as
    | { noteId?: number; flashcardId?: number; examId?: number; setId?: number }
    | undefined;
  const setId = data?.setId;
  const resourceId =
    resourceType === 'notes'
      ? data?.noteId
      : resourceType === 'flashcards'
        ? data?.flashcardId
        : data?.examId;
  if (!setId || !resourceId) return null;
  if (resourceType === 'notes') return `/sets/${setId}/notes/${resourceId}`;
  if (resourceType === 'exams') return `/sets/${setId}/exams/${resourceId}`;
  return `/sets/${setId}/flashcards/${resourceId}`;
}

function buildBundleDestUrl(item: UserNotificationItem): string | null {
  const data = item.data as { bundleId?: number | string } | undefined;
  if (!data?.bundleId) return null;
  return `/review-bundles/${data.bundleId}`;
}

type InviteLocalStatus = 'accepted' | 'declined' | null;

function InviteActions({
  item,
  onDone,
}: {
  item: UserNotificationItem;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const resourceType = INVITE_TYPES[item.type];
  const data = item.data as
    | {
        noteId?: number;
        flashcardId?: number;
        examId?: number;
        setId?: number;
        expiresAt?: string;
      }
    | undefined;

  const resourceId =
    resourceType === 'notes'
      ? data?.noteId
      : resourceType === 'flashcards'
        ? data?.flashcardId
        : data?.examId;
  const setId = data?.setId;
  const expiresAt = data?.expiresAt;

  const [localStatus, setLocalStatus] = useState<InviteLocalStatus>(null);

  const acceptMutation = useAcceptInvite();
  const declineMutation = useDeclineInvite();
  const markRead = useMarkNotificationRead();

  if (!resourceId || !setId) return null;

  const isExpired = !!(expiresAt && new Date(expiresAt) < new Date());

  function buildDestUrl() {
    if (resourceType === 'notes') return `/sets/${setId}/notes/${resourceId}`;
    if (resourceType === 'exams') return `/sets/${setId}/exams/${resourceId}`;
    return `/sets/${setId}/flashcards/${resourceId}`;
  }

  const handleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(buildDestUrl());
  };

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await acceptMutation.mutateAsync({ setId, resourceType, resourceId });
      await markRead.mutateAsync(item.id).catch(() => {});
      setLocalStatus('accepted');
      onDone();
      navigate(buildDestUrl());
    } catch {
      toast.error('Failed to accept invitation');
    }
  };

  const handleDecline = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await declineMutation.mutateAsync({ setId, resourceType, resourceId });
      await markRead.mutateAsync(item.id).catch(() => {});
      setLocalStatus('declined');
      toast.success('Invitation declined');
      onDone();
    } catch {
      toast.error('Failed to decline invitation');
    }
  };

  const isBusy = acceptMutation.isPending || declineMutation.isPending;

  if (localStatus === 'accepted') {
    return (
      <div
        className='mt-2 flex items-center gap-2'
        onClick={(e) => e.stopPropagation()}
      >
        <span className='flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400'>
          <Check className='size-3' />
          Accepted
        </span>
        <button
          type='button'
          onClick={handleOpen}
          className='text-xs font-medium text-primary hover:underline'
        >
          Open →
        </button>
      </div>
    );
  }

  if (localStatus === 'declined') {
    return (
      <div className='mt-2' onClick={(e) => e.stopPropagation()}>
        <span className='flex w-fit items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
          <X className='size-3' />
          Declined
        </span>
      </div>
    );
  }

  if (item.isRead && !isExpired) {
    return (
      <div className='mt-2' onClick={(e) => e.stopPropagation()}>
        <button
          type='button'
          onClick={handleOpen}
          className='text-xs font-medium text-primary hover:underline'
        >
          Open →
        </button>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className='mt-2'>
        <span className='inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground'>
          <AlertTriangle className='size-3' />
          Invitation expired
        </span>
      </div>
    );
  }

  return (
    <div className='mt-2 flex gap-2' onClick={(e) => e.stopPropagation()}>
      <Button
        size='sm'
        variant='default'
        className='h-7 gap-1 px-3 text-xs'
        disabled={isBusy}
        onClick={(e) => void handleAccept(e)}
      >
        {acceptMutation.isPending ? (
          <Loader2 className='size-3 animate-spin' />
        ) : (
          <Check className='size-3' />
        )}
        Accept
      </Button>
      <Button
        size='sm'
        variant='outline'
        className='h-7 gap-1 px-3 text-xs'
        disabled={isBusy}
        onClick={(e) => void handleDecline(e)}
      >
        {declineMutation.isPending ? (
          <Loader2 className='size-3 animate-spin' />
        ) : (
          <X className='size-3' />
        )}
        Decline
      </Button>
    </div>
  );
}

function NotificationCard({
  item,
  onActivate,
  onMarkRead,
  isActivating,
  onRefresh,
}: {
  item: UserNotificationItem;
  onActivate: (n: UserNotificationItem) => void;
  onMarkRead: (n: UserNotificationItem) => void;
  isActivating: boolean;
  onRefresh: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const config = getTypeConfig(item.type);
  const Icon = config.icon;
  const isWeeklySummary = item.type === 'WEEKLY_SUMMARY';
  const bundleDestUrl = isWeeklySummary ? buildBundleDestUrl(item) : null;

  return (
    <div
      role='button'
      tabIndex={0}
      onClick={() => onActivate(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate(item);
        }
      }}
      className={cn(
        'group relative flex w-full gap-3 rounded-xl border border-transparent p-3 text-left transition-colors',
        'hover:bg-[var(--pl-accent-soft)]',
        !item.isRead &&
          cn(
            'bg-primary/5 border-l-[3px] rounded-l-md',
            config.borderColor,
          ),
        isActivating && 'pointer-events-none opacity-70',
      )}
    >
      <div className='shrink-0 self-start'>
        <span
          className={cn(
            'flex size-11 items-center justify-center rounded-full',
            config.bgColor,
            config.iconColor,
          )}
        >
          <Icon className='size-5' />
        </span>
      </div>
      <div className='min-w-0 flex-1'>
        <div className='flex items-start justify-between gap-2'>
          <p className='text-sm font-semibold leading-snug text-foreground'>
            {item.title}
          </p>
          <span className='shrink-0 text-[11px] font-medium text-muted-foreground'>
            {compactRelativeTime(item.createdAt)}
          </span>
        </div>
        <p className='mt-1 text-sm text-muted-foreground'>{item.message}</p>

        {bundleDestUrl && (
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation();
              navigate(bundleDestUrl);
            }}
            className='mt-2 inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2.5 py-1 text-xs font-medium text-pink-500 hover:bg-pink-500/20'
          >
            View review bundle
            <ChevronRight className='size-3' />
          </button>
        )}

        {isInviteType(item.type) && (
          <InviteActions item={item} onDone={onRefresh} />
        )}
      </div>
      {!item.isRead && (
        <button
          type='button'
          disabled={isActivating}
          onClick={(e) => {
            e.stopPropagation();
            onMarkRead(item);
          }}
          className='absolute right-2 top-2 flex size-6 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 focus-visible:opacity-100'
          aria-label={t('notificationsPanel.markAsRead')}
          title={t('notificationsPanel.markAsRead')}
        >
          <span className={cn('size-2 rounded-full', config.dotColor)} />
        </button>
      )}
    </div>
  );
}

const BUCKET_ORDER: Bucket[] = ['today', 'yesterday', 'thisWeek', 'earlier'];

export default function NotificationDrawer({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<NotificationTab>('all');
  const [activatingId, setActivatingId] = useState<number | null>(null);

  const listQuery = useNotificationsInfinite(tab, open);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const allItems = useMemo(
    () => listQuery.data?.pages.flatMap((p) => p.data.notifications) ?? [],
    [listQuery.data?.pages],
  );

  const items = useMemo(
    () =>
      tab === 'invites'
        ? allItems.filter((n) => isInviteType(n.type))
        : allItems,
    [tab, allItems],
  );

  const grouped = useMemo(() => {
    const map: Record<Bucket, UserNotificationItem[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      earlier: [],
    };
    for (const it of items) {
      map[getBucket(it.createdAt)].push(it);
    }
    return map;
  }, [items]);

  const totalUnread = useMemo(
    () => allItems.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0),
    [allItems],
  );

  const handleActivate = useCallback(
    async (n: UserNotificationItem) => {
      setActivatingId(n.id);
      try {
        if (!n.isRead) {
          try {
            await markRead.mutateAsync(n.id);
          } catch {
            /* allow navigation */
          }
        }
        if (n.type === 'WEEKLY_SUMMARY') {
          const bundleUrl = buildBundleDestUrl(n);
          if (bundleUrl) {
            navigate(bundleUrl);
            onOpenChange(false);
            return;
          }
        }
        if (isInviteType(n.type)) {
          const destUrl = buildInviteDestUrl(n);
          if (destUrl) {
            navigate(destUrl);
            onOpenChange(false);
            return;
          }
        }
        const url = n.actionUrl?.trim();
        if (url) {
          if (/^https?:\/\//i.test(url)) {
            window.location.assign(url);
          } else {
            navigate(url.startsWith('/') ? url : `/${url}`);
            onOpenChange(false);
          }
        }
      } finally {
        setActivatingId(null);
      }
    },
    [markRead, navigate, onOpenChange],
  );

  const handleMarkReadOnly = useCallback(
    async (n: UserNotificationItem) => {
      if (n.isRead) return;
      setActivatingId(n.id);
      try {
        await markRead.mutateAsync(n.id);
      } finally {
        setActivatingId(null);
      }
    },
    [markRead],
  );

  const isLoadingFirst = listQuery.isPending && items.length === 0 && open;
  const loadError = listQuery.isError && items.length === 0;

  const tabKeys: NotificationTab[] = ['all', 'unread', 'invites'];

  const bucketLabel = (b: Bucket) => {
    if (b === 'today') return 'Today';
    if (b === 'yesterday') return 'Yesterday';
    if (b === 'thisWeek') return 'This week';
    return t('notificationsPanel.sectionEarlier');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side='right'
        className='flex w-full flex-col gap-0 p-0 sm:max-w-md bg-[var(--pl-bg-elev)]'
      >
        <SheetHeader className='shrink-0 gap-3 border-b border-border px-4 pb-3 pt-5'>
          <div className='flex items-center justify-between gap-2 pr-8'>
            <SheetTitle className='text-xl font-bold tracking-tight'>
              {t('notificationsPanel.title')}
              {totalUnread > 0 && (
                <span className='ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-foreground'>
                  {totalUnread > 99 ? '99+' : totalUnread}
                </span>
              )}
            </SheetTitle>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='h-8 gap-1.5 text-xs'
              disabled={markAllRead.isPending || totalUnread === 0}
              onClick={() => void markAllRead.mutateAsync()}
            >
              {markAllRead.isPending ? (
                <Loader2 className='size-3.5 animate-spin' />
              ) : (
                <CheckCheck className='size-3.5' />
              )}
              {t('notificationsPanel.markAllRead')}
            </Button>
          </div>
          <div className='flex gap-1 rounded-full bg-[var(--pl-bg-sunken)] p-1'>
            {tabKeys.map((key) => {
              const label =
                key === 'all'
                  ? t('notificationsPanel.tabAll')
                  : key === 'unread'
                    ? t('notificationsPanel.tabUnread')
                    : t('notificationsPanel.tabInvites', {
                        defaultValue: 'Invites',
                      });
              return (
                <button
                  key={key}
                  type='button'
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    tab === key
                      ? 'bg-primary/20 text-primary'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-3 py-3'>
          {isLoadingFirst && (
            <div className='flex justify-center py-16 text-muted-foreground'>
              <Loader2 className='size-8 animate-spin' />
            </div>
          )}

          {loadError && (
            <div className='flex flex-col items-center gap-2 py-16 px-4 text-center text-sm text-muted-foreground'>
              <Layers className='size-10 opacity-40' />
              {t('notificationsPanel.loadError')}
            </div>
          )}

          {!isLoadingFirst && !loadError && items.length === 0 && (
            <div className='flex flex-col items-center gap-2 py-16 px-4 text-center text-sm text-muted-foreground'>
              <Bell className='size-10 opacity-40' />
              {tab === 'unread'
                ? t('notificationsPanel.emptyUnread')
                : tab === 'invites'
                  ? t('notificationsPanel.emptyInvites', {
                      defaultValue: 'No pending invitations',
                    })
                  : t('notificationsPanel.empty')}
            </div>
          )}

          {!isLoadingFirst && !loadError && items.length > 0 && (
            <div className='flex flex-col gap-4'>
              {BUCKET_ORDER.map((bucket) => {
                const list = grouped[bucket];
                if (list.length === 0) return null;
                return (
                  <section key={bucket} className='flex flex-col gap-1'>
                    <h3 className='px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                      {bucketLabel(bucket)}
                    </h3>
                    <div className='flex flex-col gap-1'>
                      {list.map((item) => (
                        <NotificationCard
                          key={item.id}
                          item={item}
                          onActivate={handleActivate}
                          onMarkRead={handleMarkReadOnly}
                          isActivating={activatingId === item.id}
                          onRefresh={() => void listQuery.refetch()}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}

              {listQuery.hasNextPage && (
                <div className='flex justify-center pt-2'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    disabled={listQuery.isFetchingNextPage}
                    onClick={() => void listQuery.fetchNextPage()}
                    className='gap-1.5 text-xs'
                  >
                    {listQuery.isFetchingNextPage ? (
                      <>
                        <Loader2 className='size-3.5 animate-spin' />
                        Loading…
                      </>
                    ) : (
                      t('notificationsPanel.seeAll')
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
