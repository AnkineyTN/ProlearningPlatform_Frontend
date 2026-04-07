import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Layers,
  Loader2,
  MoreHorizontal,
  Shield,
} from "lucide-react";

import { useAppSelector } from "@/hooks/redux";
import { notificationAPI } from "@/services/endpoints/notification";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotificationsInfinite,
  useUnreadNotificationCount,
  type NotificationTab,
} from "@/hooks/useNotifications";
import type { UserNotificationItem } from "@/services/types/notification.types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function compactRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const seconds = Math.floor((Date.now() - then) / 1000);
  if (seconds < 45) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(days / 365)}y`;
}

function isSystemLikeType(type: string): boolean {
  return /SYSTEM|SECURITY|ADMIN/i.test(type);
}

function NotificationRow({
  item,
  onActivate,
  onMarkRead,
  isActivating,
}: {
  item: UserNotificationItem;
  onActivate: (n: UserNotificationItem) => void;
  onMarkRead: (n: UserNotificationItem) => void;
  isActivating: boolean;
}) {
  const { t } = useTranslation();
  const systemLike = isSystemLikeType(item.type);
  const initial = (item.title?.trim()?.[0] ?? item.message?.trim()?.[0] ?? "N")
    .toUpperCase();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onActivate(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onActivate(item);
        }
      }}
      className={cn(
        "flex w-full gap-3 rounded-lg px-2 py-2.5 text-left transition-colors",
        "hover:bg-muted/80 focus-visible:bg-muted/80 focus-visible:outline-none",
        !item.isRead && "bg-primary/5",
        isActivating && "pointer-events-none opacity-70",
      )}
    >
      <div className="relative shrink-0">
        <Avatar className="size-11 border border-border/60">
          <AvatarFallback
            className={cn(
              "text-sm font-semibold",
              systemLike
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground",
            )}
          >
            {initial}
          </AvatarFallback>
        </Avatar>
        {systemLike && (
          <span
            className="absolute -bottom-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-popover"
            aria-hidden
          >
            <Shield className="size-3" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground line-clamp-2">
          {item.title}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground line-clamp-2">
          {item.message}
        </p>
        <p className="mt-1 text-xs font-medium text-primary/90">
          {compactRelativeTime(item.createdAt)}
        </p>
      </div>
      <div className="flex w-9 shrink-0 items-start justify-center pt-2">
        {!item.isRead && (
          <button
            type="button"
            disabled={isActivating}
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(item);
            }}
            className={cn(
              "flex size-7 items-center justify-center rounded-full transition-colors",
              "hover:bg-muted focus-visible:bg-muted focus-visible:outline-none",
            )}
            aria-label={t("notificationsPanel.markAsRead")}
            title={t("notificationsPanel.markAsRead")}
          >
            <span className="size-2.5 rounded-full bg-primary shadow-sm" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<NotificationTab>("all");
  const [moreOpen, setMoreOpen] = useState(false);
  const [activatingId, setActivatingId] = useState<number | null>(null);
  const [creatingTest, setCreatingTest] = useState(false);
  const moreWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) setMoreOpen(false);
  }, [open]);

  useEffect(() => {
    if (!moreOpen) return;
    const close = (e: MouseEvent) => {
      if (
        moreWrapRef.current &&
        !moreWrapRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [moreOpen]);

  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const listQuery = useNotificationsInfinite(tab, open);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const items = useMemo(
    () =>
      listQuery.data?.pages.flatMap((p) => p.data.notifications) ?? [],
    [listQuery.data?.pages],
  );

  const handleActivate = useCallback(
    async (n: UserNotificationItem) => {
      setActivatingId(n.id);
      try {
        if (!n.isRead) {
          try {
            await markRead.mutateAsync(n.id);
          } catch {
            /* still allow navigation */
          }
        }
        const url = n.actionUrl?.trim();
        if (url) {
          if (/^https?:\/\//i.test(url)) {
            window.location.assign(url);
          } else {
            navigate(url.startsWith("/") ? url : `/${url}`);
          }
        }
      } finally {
        setActivatingId(null);
      }
    },
    [markRead, navigate],
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

  const handleCreateTest = useCallback(async () => {
    if (!userId) return;
    setCreatingTest(true);
    try {
      const now = new Date();
      await notificationAPI.debugCreateNotification(userId, {
        type: "GENERAL",
        title: `Test notification (${now.toLocaleTimeString()})`,
        message: `Generated at ${now.toISOString()}`,
      });
      setMoreOpen(false);
      // Refresh list + badge
      void listQuery.refetch();
    } finally {
      setCreatingTest(false);
    }
  }, [listQuery, userId]);

  if (!token) {
    return null;
  }

  const badge =
    unreadCount > 0 ? (unreadCount > 99 ? "99+" : String(unreadCount)) : null;

  const isLoadingFirst =
    listQuery.isPending && items.length === 0 && open;
  const loadError = listQuery.isError && items.length === 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative size-9 shrink-0 rounded-full",
            open && "bg-accent",
          )}
          title={t("header.notifications")}
          aria-label={t("header.notifications")}
        >
          <Bell className="size-[1.35rem]" />
          {badge && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] justify-center rounded-full bg-destructive px-1 text-[10px] font-bold leading-4 text-destructive-foreground shadow-sm">
              {badge}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[min(100vw-1.5rem,380px)] p-0 overflow-hidden rounded-xl border-border shadow-lg"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="border-b border-border bg-popover px-3 pt-3 pb-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold tracking-tight">
              {t("notificationsPanel.title")}
            </h2>
            <div className="relative shrink-0" ref={moreWrapRef}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 shrink-0 rounded-full"
                aria-expanded={moreOpen}
                aria-haspopup="menu"
                aria-label={t("notificationsPanel.moreActions")}
                onClick={() => setMoreOpen((v) => !v)}
              >
                <MoreHorizontal className="size-4" />
              </Button>
              {moreOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-full z-[60] mt-1 min-w-[11rem] rounded-md border border-border bg-popover py-1 shadow-md"
                >
                  {import.meta.env.DEV && (
                    <button
                      type="button"
                      role="menuitem"
                      disabled={!userId || creatingTest}
                      className="flex w-full px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
                      onClick={() => void handleCreateTest()}
                    >
                      {creatingTest ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="size-4 animate-spin" />
                          {t("notificationsPanel.createTest")}
                        </span>
                      ) : (
                        t("notificationsPanel.createTest")
                      )}
                    </button>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    disabled={markAllRead.isPending || unreadCount === 0}
                    className="flex w-full px-3 py-2 text-left text-sm hover:bg-muted disabled:opacity-50"
                    onClick={() => {
                      void markAllRead.mutateAsync();
                      setMoreOpen(false);
                    }}
                  >
                    {t("notificationsPanel.markAllRead")}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-3 flex gap-1 rounded-full bg-muted/60 p-1">
            {(["all", "unread"] as const).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  tab === key
                    ? "bg-primary/20 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {key === "all"
                  ? t("notificationsPanel.tabAll")
                  : t("notificationsPanel.tabUnread")}
              </button>
            ))}
          </div>
        </div>

        <div className="max-h-[min(70vh,420px)] overflow-y-auto px-2 py-2">
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t("notificationsPanel.sectionEarlier")}
            </span>
            {listQuery.hasNextPage && (
              <button
                type="button"
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                disabled={listQuery.isFetchingNextPage}
                onClick={() => void listQuery.fetchNextPage()}
              >
                {t("notificationsPanel.seeAll")}
              </button>
            )}
          </div>

          {isLoadingFirst && (
            <div className="flex justify-center py-12 text-muted-foreground">
              <Loader2 className="size-8 animate-spin" />
            </div>
          )}

          {loadError && (
            <div className="flex flex-col items-center gap-2 py-10 px-4 text-center text-sm text-muted-foreground">
              <Layers className="size-10 opacity-40" />
              {t("notificationsPanel.loadError")}
            </div>
          )}

          {!isLoadingFirst && !loadError && items.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 px-4 text-center text-sm text-muted-foreground">
              <Bell className="size-10 opacity-40" />
              {tab === "unread"
                ? t("notificationsPanel.emptyUnread")
                : t("notificationsPanel.empty")}
            </div>
          )}

          <ul className="flex flex-col gap-0.5">
            {items.map((item) => (
              <li key={item.id}>
                <NotificationRow
                  item={item}
                  onActivate={handleActivate}
                  onMarkRead={handleMarkReadOnly}
                  isActivating={activatingId === item.id}
                />
              </li>
            ))}
          </ul>

          {listQuery.isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
