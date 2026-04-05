import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useAppSelector } from "@/hooks/redux";
import { notificationAPI } from "@/services/endpoints/notification";

const PAGE_SIZE = 20;

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
