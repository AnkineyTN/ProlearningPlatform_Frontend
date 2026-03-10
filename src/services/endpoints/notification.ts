import type { AxiosResponse } from 'axios';
import api from '../client';

import type {
  DeviceTokenRegistration,
  NotificationResponse,
  NotificationListResponse,
  NotificationUnreadCountResponse,
  MarkNotificationsReadRequest,
  VoidResponse,
  MarkAsReadResponse,
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
    size: number = 10,
    sort: string = 'createdAt,DESC',
  ): Promise<AxiosResponse<NotificationListResponse>> =>
    api.get('/notifications', {
      params: { page, size, sort },
    }),

  /**
   * Get unread notifications
   */
  getUnreadNotifications: (
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt,DESC',
  ): Promise<AxiosResponse<NotificationListResponse>> =>
    api.get('/notifications/unread', {
      params: { page, size, sort },
    }),

  /**
   * Get count of unread notifications
   */
  getUnreadCount: (): Promise<AxiosResponse<NotificationUnreadCountResponse>> =>
    api.get('/notifications/unread/count'),

  /**
   * Mark a specific notification as read
   */
  markAsRead: (
    notificationId: number | string,
  ): Promise<AxiosResponse<NotificationResponse>> =>
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
};
