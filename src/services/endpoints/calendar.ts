import type { AxiosResponse } from 'axios';
import api from '../client';
import type {
  CalendarAuthUrlResponse,
  CalendarGenericResponse,
  CalendarSettingsRequest,
  CalendarStatusResponse,
} from '../types/calendar.types';

export const calendarAPI = {
  getStatus: (): Promise<AxiosResponse<CalendarStatusResponse>> =>
    api.get('/calendar/status'),

  getAuthUrl: (): Promise<AxiosResponse<CalendarAuthUrlResponse>> =>
    api.get('/calendar/auth/url'),

  updateSettings: (
    data: CalendarSettingsRequest,
  ): Promise<AxiosResponse<CalendarGenericResponse>> =>
    api.patch('/calendar/settings', data),

  disconnect: (): Promise<AxiosResponse<CalendarGenericResponse>> =>
    api.delete('/calendar/disconnect'),
};
