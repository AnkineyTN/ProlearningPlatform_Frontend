import { Check, Loader2, UserMinus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ResourceType } from '@/services/endpoints/collaboration';
import type { CollabMember } from '@/services/types/collaboration.types';
import { RoleIcon, StatusBadge } from './RoleIcon';
import { roleLabel } from './roleHelpers';

interface MemberRowProps {
  member: CollabMember;
  currentUserId?: number;
  isOwner: boolean;
  resourceType: ResourceType;
  isUpdatingRole: boolean;
  isRemoving: boolean;
  onUpdateRole: (newRole: 'EDITOR' | 'VIEWER') => void;
  onRemove: () => void;
}

export default function MemberRow({
  member,
  currentUserId,
  isOwner,
  resourceType,
  isUpdatingRole,
  isRemoving,
  onUpdateRole,
  onRemove,
}: MemberRowProps) {
  const isCurrentUser = member.userId === currentUserId;
  const canEdit = isOwner && member.role !== 'OWNER';

  return (
    <div className='flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-[var(--pl-bg-hover)]'>
      <Avatar className='size-9'>
        <AvatarFallback className='text-sm'>
          {member.firstName[0]}
        </AvatarFallback>
      </Avatar>

      <div className='min-w-0 flex-1'>
        <p className='truncate text-sm font-medium'>
          {member.firstName} {member.lastName}
          {isCurrentUser && (
            <span className='ml-1 text-xs text-muted-foreground'>(you)</span>
          )}
        </p>
        <p className='truncate text-xs text-muted-foreground'>
          {member.email}
        </p>
      </div>

      <div className='flex items-center gap-1.5 shrink-0'>
        <StatusBadge status={member.status} />

        {canEdit && resourceType === 'notes' ? (
          <Select
            value={member.role}
            onValueChange={(v) => onUpdateRole(v as 'EDITOR' | 'VIEWER')}
            disabled={isUpdatingRole}
          >
            <SelectTrigger
              size='sm'
              className='h-7 w-auto gap-1 rounded-md px-2 py-0.5 text-xs'
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='EDITOR'>Editor</SelectItem>
              <SelectItem value='VIEWER'>Viewer</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <span className='flex items-center gap-1 text-xs text-muted-foreground'>
            <RoleIcon role={member.role} />
            {roleLabel(member.role)}
          </span>
        )}

        {canEdit && (
          <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={onRemove}
            disabled={isRemoving}
            title='Remove member'
            className='h-7 w-7 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
          >
            {isRemoving ? (
              <Loader2 className='size-3.5 animate-spin' />
            ) : (
              <UserMinus className='size-3.5' />
            )}
          </Button>
        )}

        {member.status === 'ACTIVE' && member.role !== 'OWNER' && !canEdit && (
          <Check className='size-3.5 text-green-500' />
        )}
      </div>
    </div>
  );
}
