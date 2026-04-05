// Device token registration
export type DeviceTokenRegistration = {
  deviceToken: string;
  deviceType?: "WEB" | "MOBILE" | "DESKTOP";
};

/** One notification from GET /notifications or GET /notifications/unread */
export type UserNotificationItem = {
  id: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  actionUrl?: string | null;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
};

export type NotificationListPayload = {
  notifications: UserNotificationItem[];
  unreadCount: number;
  currentPage: number;
  totalPages: number;
  totalElements: number;
};

/** Wrapped API body for list endpoints */
export type NotificationListResponse = {
  status: string;
  message: string;
  data: NotificationListPayload;
  metadata: Record<string, unknown> | null;
};

export type NotificationUnreadCountResponse = {
  status: string;
  message: string;
  data: {
    unreadCount: number;
  };
  metadata: Record<string, unknown> | null;
};

export type SingleNotificationResponse = {
  status: string;
  message: string;
  data: UserNotificationItem;
  metadata: Record<string, unknown> | null;
};

export type MarkNotificationsReadRequest = {
  notificationIds: (number | string)[];
};

export type VoidResponse = {
  status: string;
  message: string;
  data: null;
  metadata: Record<string, never>;
};

export type MarkAsReadResponse = {
  status: string;
  message: string;
  data: {
    markedCount: number;
  };
  metadata: Record<string, unknown>;
};
