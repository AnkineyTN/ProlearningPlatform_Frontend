import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, UserPlus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { ResourceType } from '@/services/endpoints/collaboration';
import type {
  CollabMember,
  InviteTarget,
  UserSearchResult,
} from '@/services/types/collaboration.types';
import {
  useInviteMembers,
  useSearchCollabUsers,
} from '@/hooks/useCollaboration';
import InviteSearchDropdown from './InviteSearchDropdown';
import { RoleIcon } from './RoleIcon';
import { roleLabel } from './roleHelpers';

type SelectedUser = UserSearchResult | { email: string };

interface InviteTabProps {
  setId: number;
  resourceType: ResourceType;
  resourceId: number;
  isOwner: boolean;
  active: boolean;
  members: CollabMember[];
  onInvitedSwitchToMembers: () => void;
}

export default function InviteTab({
  setId,
  resourceType,
  resourceId,
  isOwner,
  active,
  members,
  onInvitedSwitchToMembers,
}: InviteTabProps) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('VIEWER');
  const [showDropdown, setShowDropdown] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(id);
  }, [keyword]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Reset internal state when tab/dialog becomes inactive.
  useEffect(() => {
    if (!active) {
      setKeyword('');
      setDebouncedKeyword('');
      setSelectedUsers([]);
      setShowDropdown(false);
    }
  }, [active]);

  const { data: searchResults = [], isFetching: isSearching } =
    useSearchCollabUsers(
      setId,
      resourceType,
      resourceId,
      debouncedKeyword,
      active,
    );

  const inviteMutation = useInviteMembers(setId, resourceType, resourceId);

  const filteredResults = searchResults.filter((u) => {
    const alreadySelected = selectedUsers.some(
      (s) => 'id' in s && s.id === u.id,
    );
    const alreadyMember = members.some((m) => m.userId === u.id);
    return !alreadySelected && !alreadyMember;
  });

  const handleSelectUser = useCallback((user: UserSearchResult) => {
    setSelectedUsers((prev) => [...prev, user]);
    setKeyword('');
    setDebouncedKeyword('');
    setShowDropdown(false);
  }, []);

  const handleAddByEmail = useCallback(() => {
    const trimmed = keyword.trim();
    if (!trimmed || !trimmed.includes('@')) return;
    const alreadyAdded = selectedUsers.some(
      (s) => 'email' in s && s.email === trimmed,
    );
    if (!alreadyAdded) {
      setSelectedUsers((prev) => [...prev, { email: trimmed }]);
    }
    setKeyword('');
    setDebouncedKeyword('');
    setShowDropdown(false);
  }, [keyword, selectedUsers]);

  const handleRemoveSelected = (idx: number) => {
    setSelectedUsers((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) return;
    const targets: InviteTarget[] = selectedUsers.map((u) =>
      'id' in u ? { userId: u.id } : { email: u.email },
    );
    try {
      const res = await inviteMutation.mutateAsync({
        targets,
        role: inviteRole,
      });
      const results = res.data.data ?? [];
      const failed = results.filter((r) => !r.success);
      const succeeded = results.filter((r) => r.success);

      if (succeeded.length > 0) {
        toast.success(t('collaboration.invite.invitationsSent', { count: succeeded.length }));
      }
      if (failed.length > 0) {
        failed.forEach((f) => {
          const errorMsg =
            f.error === 'User not found'
              ? t('collaboration.invite.errorUserNotFound')
              : f.error === 'User is already a member'
                ? t('collaboration.invite.errorAlreadyMember')
                : f.error === 'Cannot invite yourself'
                  ? t('collaboration.invite.errorCannotInviteSelf')
                  : t('collaboration.invite.errorFailedToInvite');
          toast.error(`${f.email ?? f.userId}: ${errorMsg}`);
        });
      }
      setSelectedUsers([]);
      onInvitedSwitchToMembers();
    } catch (error) {
      toast.error(
        apiErrorMessage(error, t('collaboration.invite.errorFailedToSend')),
      );
    }
  };

  const showEmailFallback =
    debouncedKeyword.trim().length >= 2 &&
    !isSearching &&
    filteredResults.length === 0 &&
    debouncedKeyword.includes('@');

  if (!isOwner) {
    return (
      <div className='flex flex-col gap-4'>
        <p className='rounded-md bg-[var(--pl-bg-sunken)] px-3 py-2 text-sm text-muted-foreground'>
          {t('collaboration.invite.ownerOnly')}
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-4'>
      {selectedUsers.length > 0 && (
        <div className='flex flex-wrap gap-1.5'>
          {selectedUsers.map((u, i) => (
            <Badge
              key={i}
              variant='outline'
              className='gap-1 rounded-full border-transparent bg-[var(--pl-accent-border)] px-2.5 py-1 text-sm text-primary'
            >
              {'email' in u && !('id' in u)
                ? u.email
                : `${'firstName' in u ? u.firstName : ''} ${'lastName' in u ? u.lastName : ''}`.trim()}
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => handleRemoveSelected(i)}
                className='h-4 w-4 rounded-full p-0 hover:bg-[var(--pl-accent-border)]/60'
              >
                <X className='size-3' />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      <InviteSearchDropdown
        ref={searchRef}
        keyword={keyword}
        debouncedKeyword={debouncedKeyword}
        isSearching={isSearching}
        showDropdown={showDropdown}
        filteredResults={filteredResults}
        showEmailFallback={showEmailFallback}
        dropdownRef={dropdownRef}
        onKeywordChange={setKeyword}
        onShowDropdown={setShowDropdown}
        onSelectUser={handleSelectUser}
        onAddByEmail={handleAddByEmail}
      />

      {resourceType === 'notes' && (
        <div className='flex items-center gap-2'>
          <span className='text-sm text-muted-foreground'>{t('collaboration.invite.role')}</span>
          {(['EDITOR', 'VIEWER'] as const).map((r) => (
            <Button
              key={r}
              variant={inviteRole === r ? 'default' : 'outline'}
              onClick={() => setInviteRole(r)}
              size='sm'
              className='rounded-full'
            >
              <RoleIcon role={r} />
              {roleLabel(r)}
            </Button>
          ))}
        </div>
      )}

      <Button
        onClick={() => void handleInvite()}
        disabled={selectedUsers.length === 0 || inviteMutation.isPending}
        className='w-full'
      >
        {inviteMutation.isPending ? (
          <Loader2 className='size-4 animate-spin' />
        ) : (
          <>
            <UserPlus className='size-4' />
            {t('collaboration.invite.inviteButton')}{' '}
            {selectedUsers.length > 0 ? t('collaboration.invite.inviteCount', { count: selectedUsers.length }) : ''}
          </>
        )}
      </Button>
    </div>
  );
}
