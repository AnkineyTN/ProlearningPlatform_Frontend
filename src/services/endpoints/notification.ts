import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  DeviceTokenRegistration,
  SingleNotificationResponse,
  NotificationListResponse,
  NotificationUnreadCountResponse,
  DebugCreateNotificationRequest,
  MarkNotificationsReadRequest,
  VoidResponse,
  MarkAsReadResponse,
  SetNotificationPreferencesResponse,
  UpdateSetNotificationPreferencesRequest,
  GlobalNotificationPreferencesResponse,
  UpdateGlobalNotificationPreferencesRequest,
} from '../types/notification.types';

export const notificationAPI = {
  /**
   * Register device token for push notifications
   */
  registerDeviceToken: (
    data: DeviceTokenRegistration,
  ): Promise<AxiosResponse<VoidResponse>> =>
    api.post('/notifications/device/register', data),

  /**
   * Unregister device token
   */
  unregisterDeviceToken: (
    data: DeviceTokenRegistration,
  ): Promise<AxiosResponse<VoidResponse>> =>
    api.post('/notifications/device/unregister', data),

  /**
   * Get all notifications with pagination
   */
  getNotifications: (
    page: number = 0,
    size: number = 20,
    sort?: string,
  ): Promise<AxiosResponse<NotificationListResponse>> =>
    api.get('/notifications', {
      params: sort != null ? { page, size, sort } : { page, size },
    }),

  /**
   * Get unread notifications
   */
  getUnreadNotifications: (
    page: number = 0,
    size: number = 20,
    sort?: string,
  ): Promise<AxiosResponse<NotificationListResponse>> =>
    api.get('/notifications/unread', {
      params: sort != null ? { page, size, sort } : { page, size },
    }),

  /**
   * Get count of unread notifications
   */
  getUnreadCount: (): Promise<AxiosResponse<NotificationUnreadCountResponse>> =>
    api.get('/notifications/unread/count'),

  /**
   * Debug: create a notification for a user
   * POST /notifications/debug/create/{userId}
   *
   * Note: some environments may expose it under `/api/...` already via baseURL.
   */
  debugCreateNotification: (
    userId: number | string,
    payload: DebugCreateNotificationRequest,
  ): Promise<AxiosResponse<SingleNotificationResponse>> =>
    api.post(`/notifications/debug/create/${userId}`, payload),

  /**
   * Mark a specific notification as read
   */
  markAsRead: (
    notificationId: number | string,
  ): Promise<AxiosResponse<SingleNotificationResponse>> =>
    api.patch(`/notifications/${notificationId}/read`),

  /**
   * Mark multiple notifications as read
   */
  markMultipleAsRead: (
    data: MarkNotificationsReadRequest,
  ): Promise<AxiosResponse<MarkAsReadResponse>> =>
    api.patch('/notifications/read', data),

  /**
   * Mark all notifications as read
   */
  markAllAsRead: (): Promise<AxiosResponse<MarkAsReadResponse>> =>
    api.patch('/notifications/read-all'),

  /**
   * Delete a notification
   */
  deleteNotification: (
    notificationId: number | string,
  ): Promise<AxiosResponse<VoidResponse>> =>
    api.delete(`/notifications/${notificationId}`),

  // ─── Notification Preferences ──────────────────────────────────────────────

  /**
   * GET /sets/{setId}/notifications/preferences
   * Returns notification preferences scoped to a specific study set
   */
  getSetNotificationPreferences: (
    setId: number | string,
  ): Promise<AxiosResponse<SetNotificationPreferencesResponse>> =>
    api.get(`/sets/${setId}/notifications/preferences`),

  /**
   * PUT /sets/{setId}/notifications/preferences
   * Updates notification preferences scoped to a specific study set
   */
  updateSetNotificationPreferences: (
    setId: number | string,
    data: UpdateSetNotificationPreferencesRequest,
  ): Promise<AxiosResponse<SetNotificationPreferencesResponse>> =>
    api.put(`/sets/${setId}/notifications/preferences`, data),

  /**
   * GET /notifications/preferences
   * Returns the current user's global notification preferences
   */
  getGlobalNotificationPreferences: (): Promise<
    AxiosResponse<GlobalNotificationPreferencesResponse>
  > => api.get('/notifications/preferences'),

  /**
   * PUT /notifications/preferences
   * Updates the current user's global notification preferences
   */
  updateGlobalNotificationPreferences: (
    data: UpdateGlobalNotificationPreferencesRequest,
  ): Promise<AxiosResponse<GlobalNotificationPreferencesResponse>> =>
    api.put('/notifications/preferences', data),
};
