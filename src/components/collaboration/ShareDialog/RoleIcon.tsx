import { Crown, Eye, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type {
  CollabMember,
  CollabRole,
} from '@/services/types/collaboration.types';

export function RoleIcon({ role }: { role: CollabRole }) {
  if (role === 'OWNER') return <Crown className='size-3.5' />;
  if (role === 'EDITOR') return <Pencil className='size-3.5' />;
  return <Eye className='size-3.5' />;
}

export function StatusBadge({ status }: { status: CollabMember['status'] }) {
  if (status !== 'PENDING') return null;
  return (
    <Badge
      variant='outline'
      className='rounded-full px-1.5 py-0.5 text-[10px] font-medium border-transparent bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    >
      Pending
    </Badge>
  );
}
