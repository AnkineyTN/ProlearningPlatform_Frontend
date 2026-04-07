import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/redux";
import { notificationAPI } from "@/services/endpoints/notification";
import type {
  NotificationListResponse,
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
  const token = useAppSelector((s) => s.auth.token);
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

export type NotificationTab = "all" | "unread";

export function useNotificationsInfinite(tab: NotificationTab, open: boolean) {
  const token = useAppSelector((s) => s.auth.token);
  return useInfiniteQuery({
    queryKey: ["notifications", "list", tab],
    initialPageParam: 0,
    enabled: !!token && open,
    queryFn: async ({ pageParam }) => {
      const res =
        tab === "all"
          ? await notificationAPI.getNotifications(pageParam, PAGE_SIZE)
          : await notificationAPI.getUnreadNotifications(pageParam, PAGE_SIZE);
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
