import type { TFunction } from 'i18next';
import type { UserNotificationItem } from '@/services/types/notification.types';

const TYPE_KEY_MAP: Record<string, { title: string; message: string }> = {
  DAILY_TODO_REMINDER: {
    title: 'notification.daily_todo.title',
    message: 'notification.daily_todo.message',
  },
  WEEKLY_TODO_REMINDER: {
    title: 'notification.weekly_todo.title',
    message: 'notification.weekly_todo.message',
  },
  GOAL_DEADLINE_REMINDER: {
    title: 'notification.goal_deadline.title',
    message: 'notification.goal_deadline.message',
  },
  GOAL_INACTIVE_REMINDER: {
    title: 'notification.goal_inactive.title',
    message: 'notification.goal_inactive.message',
  },
};

export function getNotificationContent(
  item: UserNotificationItem,
  t: TFunction,
): { title: string; message: string } {
  const keys = TYPE_KEY_MAP[item.type];
  if (!keys) return { title: item.title, message: item.message };

  const data = item.data as Record<string, unknown> | null | undefined;
  const count = data?.count as number | undefined;
  const goalTitle = data?.goalTitle as string | undefined;
  const days = data?.days as number | undefined;

  const period =
    days !== undefined
      ? t(`notification.goal_deadline.period_${days}`, { defaultValue: `${days} day(s)` })
      : undefined;

  return {
    title: t(keys.title, { defaultValue: item.title }),
    message: t(keys.message, {
      count,
      goalTitle,
      period,
      defaultValue: item.message,
    }),
  };
}
