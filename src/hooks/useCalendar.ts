import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { calendarAPI } from '@/services/endpoints/calendar';

const CALENDAR_STATUS_KEY = ['calendar', 'status'] as const;

export function useCalendarStatus() {
  return useQuery({
    queryKey: CALENDAR_STATUS_KEY,
    queryFn: () => calendarAPI.getStatus(),
    select: (res) => res.data.data,
  });
}

export function useConnectCalendar() {
  return useMutation({
    mutationFn: async () => {
      const res = await calendarAPI.getAuthUrl();
      return res.data.data.authorizationUrl;
    },
  });
}

export function useToggleCalendarSync() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (syncEnabled: boolean) =>
      calendarAPI.updateSettings({ syncEnabled }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CALENDAR_STATUS_KEY });
    },
  });
}

export function useDisconnectCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => calendarAPI.disconnect(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CALENDAR_STATUS_KEY });
    },
  });
}
