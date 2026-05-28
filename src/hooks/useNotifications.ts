/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { notificationAPI } from "@/services/endpoints/notification";
import type {
  GlobalNotificationPreferences,
  NotificationListResponse,
  SetNotificationPreferences,
  UserNotificationItem,
} from "@/services/types/notification.types";

const PAGE_SIZE = 20;

function optimisticMarkReadInList(
  data: any,
  id: number | string,
): typeof data {
  if (!data) return data;
  // Works with infinite query data shape: { pages: NotificationListResponse[]; pageParams: any[] }
  const next = {
    ...data,
    pages: (data.pages ?? []).map((page: NotificationListResponse) => {
      const notifications = page.data.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true, readAt: n.readAt ?? new Date().toISOString() } : n,
      );
      return {
        ...page,
        data: {
          ...page.data,
          notifications,
          unreadCount: Math.max(
            0,
            notifications.reduce((acc, n) => acc + (n.isRead ? 0 : 1), 0),
          ),
        },
      };
    }),
  };
  return next;
}

function optimisticMarkAllReadInList(data: any): typeof data {
  if (!data) return data;
  const nowIso = new Date().toISOString();
  const next = {
    ...data,
    pages: (data.pages ?? []).map((page: NotificationListResponse) => ({
      ...page,
      data: {
        ...page.data,
        notifications: page.data.notifications.map((n: UserNotificationItem) => ({
          ...n,
          isRead: true,
          readAt: n.readAt ?? nowIso,
        })),
        unreadCount: 0,
      },
    })),
  };
  return next;
}

export function useUnreadNotificationCount() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["notifications", "unreadCount"],
    queryFn: async () => {
      const res = await notificationAPI.getUnreadCount();
      return res.data.data.unreadCount;
    },
    enabled: !!token,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}

export type NotificationTab = "all" | "unread" | "invites";

export function useNotificationsInfinite(tab: NotificationTab, open: boolean) {
  const { token } = useAuth();
  return useInfiniteQuery({
    queryKey: ["notifications", "list", tab],
    initialPageParam: 0,
    enabled: !!token && open,
    queryFn: async ({ pageParam }) => {
      // The "invites" tab reuses the all-notifications endpoint; the client
      // filters down to invite types when rendering.
      const res =
        tab === "unread"
          ? await notificationAPI.getUnreadNotifications(pageParam, PAGE_SIZE)
          : await notificationAPI.getNotifications(pageParam, PAGE_SIZE);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.data;
      const next = currentPage + 1;
      return next < totalPages ? next : undefined;
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationAPI.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prevUnread = queryClient.getQueryData<number>([
        "notifications",
        "unreadCount",
      ]);
      const prevAll = queryClient.getQueryData<any>([
        "notifications",
        "list",
        "all",
      ]);
      const prevUnreadList = queryClient.getQueryData<any>([
        "notifications",
        "list",
        "unread",
      ]);

      queryClient.setQueryData<number>(
        ["notifications", "unreadCount"],
        (c) => (typeof c === "number" ? Math.max(0, c - 1) : c),
      );
      queryClient.setQueryData<any>(
        ["notifications", "list", "all"],
        (d: any) => optimisticMarkReadInList(d, id),
      );
      // If it was in unread list, we keep it but marked read; next refetch will clean it up.
      queryClient.setQueryData<any>(
        ["notifications", "list", "unread"],
        (d: any) => optimisticMarkReadInList(d, id),
      );

      return { prevUnread, prevAll, prevUnreadList };
    },
    onError: (_err, _id, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(["notifications", "unreadCount"], ctx.prevUnread);
      queryClient.setQueryData(["notifications", "list", "all"], ctx.prevAll);
      queryClient.setQueryData(
        ["notifications", "list", "unread"],
        ctx.prevUnreadList,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkMultipleNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationIds: (number | string)[]) =>
      notificationAPI.markMultipleAsRead({ notificationIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      const prevUnread = queryClient.getQueryData<number>([
        "notifications",
        "unreadCount",
      ]);
      const prevAll = queryClient.getQueryData<any>([
        "notifications",
        "list",
        "all",
      ]);
      const prevUnreadList = queryClient.getQueryData<any>([
        "notifications",
        "list",
        "unread",
      ]);

      queryClient.setQueryData(["notifications", "unreadCount"], 0);
      queryClient.setQueryData<any>(
        ["notifications", "list", "all"],
        (d: any) => optimisticMarkAllReadInList(d),
      );
      queryClient.setQueryData<any>(
        ["notifications", "list", "unread"],
        (d: any) => optimisticMarkAllReadInList(d),
      );

      return { prevUnread, prevAll, prevUnreadList };
    },
    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(["notifications", "unreadCount"], ctx.prevUnread);
      queryClient.setQueryData(["notifications", "list", "all"], ctx.prevAll);
      queryClient.setQueryData(
        ["notifications", "list", "unread"],
        ctx.prevUnreadList,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationAPI.deleteNotification(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const prevAll = queryClient.getQueryData<any>(['notifications', 'list', 'all']);
      const prevUnread = queryClient.getQueryData<any>(['notifications', 'list', 'unread']);
      const prevCount = queryClient.getQueryData<number>(['notifications', 'unreadCount']);

      const removeFromList = (data: any) => {
        if (!data) return data;
        return {
          ...data,
          pages: (data.pages ?? []).map((page: any) => {
            const removed = page.data.notifications.find((n: any) => n.id === id);
            const notifications = page.data.notifications.filter((n: any) => n.id !== id);
            return {
              ...page,
              data: {
                ...page.data,
                notifications,
                totalElements: Math.max(0, page.data.totalElements - 1),
                unreadCount: removed && !removed.isRead
                  ? Math.max(0, page.data.unreadCount - 1)
                  : page.data.unreadCount,
              },
            };
          }),
        };
      };

      const wasUnread = (data: any) => {
        if (!data) return false;
        for (const page of data.pages ?? []) {
          const found = page.data.notifications.find((n: any) => n.id === id);
          if (found) return !found.isRead;
        }
        return false;
      };

      const isUnread = wasUnread(prevAll);

      queryClient.setQueryData<any>(['notifications', 'list', 'all'], removeFromList);
      queryClient.setQueryData<any>(['notifications', 'list', 'unread'], removeFromList);
      if (isUnread) {
        queryClient.setQueryData<number>(
          ['notifications', 'unreadCount'],
          (c) => (typeof c === 'number' ? Math.max(0, c - 1) : c),
        );
      }

      return { prevAll, prevUnread, prevCount };
    },
    onError: (_err, _id, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(['notifications', 'list', 'all'], ctx.prevAll);
      queryClient.setQueryData(['notifications', 'list', 'unread'], ctx.prevUnread);
      queryClient.setQueryData(['notifications', 'unreadCount'], ctx.prevCount);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ─── Per-user (global) notification preferences ──────────────────────────────

const GLOBAL_PREFS_KEY = ["notifications", "preferences"] as const;

export function useGlobalNotificationPreferences() {
  const { token } = useAuth();
  return useQuery({
    queryKey: GLOBAL_PREFS_KEY,
    enabled: !!token,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const res = await notificationAPI.getGlobalNotificationPreferences();
      return res.data.data;
    },
  });
}

/**
 * Send only the changed fields. Spec: each toggle calls
 * `updatePreferencesMutation.mutate({ <field>: val })`; backend strips undefined.
 */
export function useUpdateGlobalNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partial: Partial<GlobalNotificationPreferences>) =>
      notificationAPI.updateGlobalNotificationPreferences(
        partial as Parameters<
          typeof notificationAPI.updateGlobalNotificationPreferences
        >[0],
      ),
    onMutate: async (partial) => {
      await queryClient.cancelQueries({ queryKey: GLOBAL_PREFS_KEY });
      const prev = queryClient.getQueryData<GlobalNotificationPreferences>(
        GLOBAL_PREFS_KEY,
      );
      if (prev) {
        queryClient.setQueryData<GlobalNotificationPreferences>(
          GLOBAL_PREFS_KEY,
          { ...prev, ...partial },
        );
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(GLOBAL_PREFS_KEY, ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: GLOBAL_PREFS_KEY });
    },
  });
}

// ─── Per-set notification preferences (weekly review reminder) ───────────────

const setPrefsKey = (setId: number | string) =>
  ["notifications", "set-preferences", String(setId)] as const;

export function useSetNotificationPreferences(
  setId: number | string | undefined,
  enabled = true,
) {
  const { token } = useAuth();
  return useQuery({
    queryKey: setPrefsKey(setId ?? ""),
    enabled: !!token && !!setId && enabled,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const res = await notificationAPI.getSetNotificationPreferences(setId!);
      return res.data.data;
    },
  });
}

export function useUpdateSetNotificationPreferences(setId: number | string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (partial: Partial<SetNotificationPreferences>) =>
      notificationAPI.updateSetNotificationPreferences(
        setId,
        partial as Parameters<
          typeof notificationAPI.updateSetNotificationPreferences
        >[1],
      ),
    onMutate: async (partial) => {
      const key = setPrefsKey(setId);
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData<SetNotificationPreferences>(key);
      if (prev) {
        queryClient.setQueryData<SetNotificationPreferences>(key, {
          ...prev,
          ...partial,
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(setPrefsKey(setId), ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: setPrefsKey(setId) });
    },
  });
}
