import type { AppealDto, AppealStatus } from '@/services/endpoints/appeals';
import type { AdminUserDirectoryRow } from '@/services/types/adminUsers.types';
import type { AdminUpdateAssetRequest } from '@/services/endpoints/adminPomodoro';

export type Tab = 'queue' | 'blocks' | 'history';

export type ListItem = {
  id: string;
  name: string;
  email: string;
  userId?: number;
  reason: string;
  date: string;
  appealDate?: string;
  status?: AppealStatus;
  severity?: string;
  raw: AppealDto | AdminUserDirectoryRow;
  kind: 'appeal' | 'block';
};

export type PomodoroSubTab = 'spaces' | 'sounds';

export type EditingItem = { id: number; name: string; description: string };

export type UpdateMutation = {
  mutate: (v: { id: number; body: AdminUpdateAssetRequest }) => void;
  isPending: boolean;
};

export type DeleteMutation = {
  mutate: (id: number) => void;
  isPending: boolean;
};
