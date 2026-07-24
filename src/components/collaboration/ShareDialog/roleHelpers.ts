import type { TFunction } from 'i18next';
import type { CollabRole } from '@/services/types/collaboration.types';

export function roleLabel(role: CollabRole, t: TFunction) {
  if (role === 'OWNER') return t('collaboration.role.owner');
  if (role === 'EDITOR') return t('collaboration.role.editor');
  return t('collaboration.role.viewer');
}
