import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { ResourceType } from '@/services/endpoints/collaboration';
import type { CollabMember } from '@/services/types/collaboration.types';
import {
  useRemoveMember,
  useUpdateMemberRole,
} from '@/hooks/useCollaboration';
import MemberRow from './MemberRow';

interface MembersTabProps {
  setId: number;
  resourceType: ResourceType;
  resourceId: number;
  isOwner: boolean;
  isLoading: boolean;
  members: CollabMember[];
  currentUserId?: number;
}

export default function MembersTab({
  setId,
  resourceType,
  resourceId,
  isOwner,
  isLoading,
  members,
  currentUserId,
}: MembersTabProps) {
  const { t } = useTranslation();
  const updateRoleMutation = useUpdateMemberRole(
    setId,
    resourceType,
    resourceId,
  );
  const removeMutation = useRemoveMember(setId, resourceType, resourceId);

  const handleUpdateRole = async (
    member: CollabMember,
    newRole: 'EDITOR' | 'VIEWER',
  ) => {
    try {
      await updateRoleMutation.mutateAsync({
        targetUserId: member.userId,
        role: newRole,
      });
      toast.success(t('collaboration.members.roleUpdated'));
    } catch {
      toast.error(t('collaboration.members.updateRoleError'));
    }
  };

  const handleRemoveMember = async (member: CollabMember) => {
    try {
      await removeMutation.mutateAsync(member.userId);
      toast.success(t('collaboration.members.memberRemoved'));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? t('collaboration.members.removeMemberError');
      toast.error(msg);
    }
  };

  return (
    <div className='flex flex-col gap-2 max-h-80 overflow-y-auto'>
      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Loader2 className='size-6 animate-spin text-muted-foreground' />
        </div>
      ) : members.length === 0 ? (
        <p className='py-6 text-center text-sm text-muted-foreground'>
          {t('collaboration.members.noMembers')}
        </p>
      ) : (
        members.map((member) => (
          <MemberRow
            key={member.userId}
            member={member}
            currentUserId={currentUserId}
            isOwner={isOwner}
            resourceType={resourceType}
            isUpdatingRole={updateRoleMutation.isPending}
            isRemoving={removeMutation.isPending}
            onUpdateRole={(newRole) => void handleUpdateRole(member, newRole)}
            onRemove={() => void handleRemoveMember(member)}
          />
        ))
      )}
    </div>
  );
}
