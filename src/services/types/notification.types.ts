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

export type DebugCreateNotificationRequest = {
  type: string;
  title: string;
  message: string;
};

export type VoidResponse = {
  status: string;
  message: string;
  data: null;
  metadata: Record<string, never>;
};

/**
 * Response for PATCH /notifications/read and PATCH /notifications/read-all
 * Backend returns a free-form number map (additionalProp* in swagger).
 */
export type MarkAsReadResponse = {
  status: string;
  message: string;
  data: Record<string, number>;
  metadata: Record<string, unknown> | null;
};

// ─── Notification Preferences ────────────────────────────────────────────────

export type SetNotificationPreferences = {
  weeklySummaryEnabled: boolean;
  weeklySummaryDay: number;
};

export type SetNotificationPreferencesResponse = {
  status: string;
  message: string;
  data: SetNotificationPreferences;
  metadata: Record<string, unknown> | null;
};

export type UpdateSetNotificationPreferencesRequest = {
  weeklySummaryEnabled: boolean;
  /** 0–7 where 0 = Sunday, 7 = Saturday (or as defined by backend) */
  weeklySummaryDay: number;
};

export type GlobalNotificationPreferences = {
  dueCardReminderEnabled: boolean;
  systemAnnouncementEnabled: boolean;
  accountActivityEnabled: boolean;
};

export type GlobalNotificationPreferencesResponse = {
  status: string;
  message: string;
  data: GlobalNotificationPreferences;
  metadata: Record<string, unknown> | null;
};

export type UpdateGlobalNotificationPreferencesRequest = {
  dueCardReminderEnabled: boolean;
  systemAnnouncementEnabled: boolean;
  accountActivityEnabled: boolean;
};
