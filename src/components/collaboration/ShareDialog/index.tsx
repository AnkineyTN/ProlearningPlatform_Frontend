import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import type { ResourceType } from '@/services/endpoints/collaboration';
import type { CollabRole } from '@/services/types/collaboration.types';
import { useCollabMembers } from '@/hooks/useCollaboration';
import InviteTab from './InviteTab';
import MembersTab from './MembersTab';
import ShareTabBar, { type ShareTab } from './ShareTabBar';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setId: number;
  resourceType: ResourceType;
  resourceId: number;
  /** Current user's role — controls what actions are shown */
  userRole: CollabRole;
  currentUserId?: number;
}

export function ShareDialog({
  open,
  onOpenChange,
  setId,
  resourceType,
  resourceId,
  userRole,
  currentUserId,
}: ShareDialogProps) {
  const [tab, setTab] = useState<ShareTab>('invite');
  const isOwner = userRole === 'OWNER';

  const { data: members = [], isLoading: isLoadingMembers } = useCollabMembers(
    setId,
    resourceType,
    resourceId,
    tab === 'members' && open,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as ShareTab)}>
          <ShareTabBar />

          <TabsContent value='invite'>
            <InviteTab
              setId={setId}
              resourceType={resourceType}
              resourceId={resourceId}
              isOwner={isOwner}
              active={open && tab === 'invite'}
              members={members}
              onInvitedSwitchToMembers={() => setTab('members')}
            />
          </TabsContent>

          <TabsContent value='members'>
            <MembersTab
              setId={setId}
              resourceType={resourceType}
              resourceId={resourceId}
              isOwner={isOwner}
              isLoading={isLoadingMembers}
              members={members}
              currentUserId={currentUserId}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
