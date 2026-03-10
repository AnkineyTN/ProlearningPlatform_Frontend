// Device token registration
export type DeviceTokenRegistration = {
  deviceToken: string;
  deviceType?: 'WEB' | 'MOBILE' | 'DESKTOP';
};

// Notification types
export type NotificationType =
  | 'FLASHCARD_REMINDER'
  | 'QUIZ_AVAILABLE'
  | 'NEW_CONTENT'
  | 'SYSTEM_MESSAGE'
  | 'FRIEND_REQUEST'
  | 'COMMENT'
  | 'LIKE'
  | 'MENTION'
  | 'OTHER';

export type NotificationStatus = 'READ' | 'UNREAD';

export type Notification = {
  id: number | string;
  userId?: number;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  data?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
  readAt?: string;
};

export type NotificationResponse = {
  status: string;
  message: string;
  data: Notification;
  metadata: Record<string, never>;
};

export type NotificationListResponse = {
  status: string;
  message: string;
  data: Notification[];
  metadata: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
};

export type NotificationUnreadCountResponse = {
  status: string;
  message: string;
  data: {
    unreadCount: number;
  };
  metadata: Record<string, any>;
};

// Mark as read payloads
export type MarkNotificationsReadRequest = {
  notificationIds: (number | string)[];
};

// API Response types
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
  metadata: Record<string, any>;
};
