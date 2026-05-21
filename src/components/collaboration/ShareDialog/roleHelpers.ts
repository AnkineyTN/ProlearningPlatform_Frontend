import type { CollabRole } from '@/services/types/collaboration.types';

export function roleLabel(role: CollabRole) {
  if (role === 'OWNER') return 'Owner';
  if (role === 'EDITOR') return 'Editor';
  return 'Viewer';
}
