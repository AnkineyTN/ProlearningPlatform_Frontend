import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Crown, Eye, Loader2, Pencil, Search, UserMinus, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { ResourceType } from '@/services/endpoints/collaboration';
import type {
  CollabMember,
  CollabRole,
  InviteTarget,
  UserSearchResult,
} from '@/services/types/collaboration.types';
import {
  useCollabMembers,
  useInviteMembers,
  useRemoveMember,
  useSearchCollabUsers,
  useUpdateMemberRole,
} from '@/hooks/useCollaboration';

type Tab = 'invite' | 'members';

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

function roleLabel(role: CollabRole) {
  if (role === 'OWNER') return 'Owner';
  if (role === 'EDITOR') return 'Editor';
  return 'Viewer';
}

function RoleIcon({ role }: { role: CollabRole }) {
  if (role === 'OWNER') return <Crown className="size-3.5 text-amber-500" />;
  if (role === 'EDITOR') return <Pencil className="size-3.5 text-blue-500" />;
  return <Eye className="size-3.5 text-muted-foreground" />;
}

function statusBadge(status: CollabMember['status']) {
  if (status === 'PENDING')
    return (
      <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        Pending
      </span>
    );
  return null;
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
  const [tab, setTab] = useState<Tab>('invite');
  const [keyword, setKeyword] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<(UserSearchResult | { email: string })[]>([]);
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('VIEWER');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce keyword
  useEffect(() => {
    const t = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(t);
  }, [keyword]);

  // Close dropdown on outside click
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

  const { data: searchResults = [], isFetching: isSearching } = useSearchCollabUsers(
    setId,
    resourceType,
    resourceId,
    debouncedKeyword,
    tab === 'invite',
  );

  const { data: members = [], isLoading: isLoadingMembers, refetch: refetchMembers } =
    useCollabMembers(setId, resourceType, resourceId, tab === 'members' && open);

  const inviteMutation = useInviteMembers(setId, resourceType, resourceId);
  const updateRoleMutation = useUpdateMemberRole(setId, resourceType, resourceId);
  const removeMutation = useRemoveMember(setId, resourceType, resourceId);

  const isOwner = userRole === 'OWNER';

  // Filter out already-selected and already-members from search results
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
      const res = await inviteMutation.mutateAsync({ targets, role: inviteRole });
      const results = res.data.data ?? [];
      const failed = results.filter((r) => !r.success);
      const succeeded = results.filter((r) => r.success);

      if (succeeded.length > 0) {
        toast.success(`${succeeded.length} invitation(s) sent`);
      }
      if (failed.length > 0) {
        failed.forEach((f) => {
          const errorMsg =
            f.error === 'User not found'
              ? 'User not found'
              : f.error === 'User is already a member'
                ? 'Already a member'
                : f.error === 'Cannot invite yourself'
                  ? 'Cannot invite yourself'
                  : 'Failed to invite';
          toast.error(`${f.email ?? f.userId}: ${errorMsg}`);
        });
      }

      setSelectedUsers([]);
      setTab('members');
      void refetchMembers();
    } catch {
      toast.error('Failed to send invitations');
    }
  };

  const handleUpdateRole = async (member: CollabMember, newRole: 'EDITOR' | 'VIEWER') => {
    try {
      await updateRoleMutation.mutateAsync({ targetUserId: member.userId, role: newRole });
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (member: CollabMember) => {
    try {
      await removeMutation.mutateAsync(member.userId);
      toast.success('Member removed');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to remove member';
      toast.error(msg);
    }
  };

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setKeyword('');
      setDebouncedKeyword('');
      setSelectedUsers([]);
      setShowDropdown(false);
    }
  }, [open]);

  const showEmailFallback =
    debouncedKeyword.trim().length >= 2 &&
    !isSearching &&
    filteredResults.length === 0 &&
    debouncedKeyword.includes('@');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Share</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex gap-1 rounded-full bg-muted/60 p-1">
          {(['invite', 'members'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                'flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'bg-primary/20 text-primary'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'invite' ? 'Invite' : 'Members'}
            </button>
          ))}
        </div>

        {/* ── INVITE TAB ── */}
        {tab === 'invite' && (
          <div className="flex flex-col gap-4">
            {!isOwner && (
              <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                Only the owner can invite collaborators.
              </p>
            )}

            {isOwner && (
              <>
                {/* Selected chips */}
                {selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUsers.map((u, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-sm text-primary"
                      >
                        {'email' in u && !('id' in u) ? u.email : `${'firstName' in u ? u.firstName : ''} ${'lastName' in u ? u.lastName : ''}`.trim()}
                        <button
                          type="button"
                          onClick={() => handleRemoveSelected(i)}
                          className="rounded-full hover:bg-primary/20"
                        >
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search input */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={searchRef}
                    placeholder="Search by name or email…"
                    className="pl-8"
                    value={keyword}
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}

                  {/* Dropdown */}
                  {showDropdown && debouncedKeyword.trim().length >= 2 && (
                    <div
                      ref={dropdownRef}
                      className="absolute left-0 top-full z-50 mt-1 w-full rounded-md border border-border bg-popover py-1 shadow-md"
                    >
                      {filteredResults.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => handleSelectUser(u)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <Avatar className="size-7">
                            <AvatarFallback className="text-xs">
                              {u.firstName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </button>
                      ))}

                      {showEmailFallback && (
                        <button
                          type="button"
                          onClick={handleAddByEmail}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                        >
                          <UserPlus className="size-4 shrink-0 text-muted-foreground" />
                          <span>
                            Invite <strong>{keyword.trim()}</strong> by email
                          </span>
                        </button>
                      )}

                      {!isSearching && filteredResults.length === 0 && !showEmailFallback && (
                        <p className="px-3 py-2 text-sm text-muted-foreground">No users found</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Role selector (notes only) */}
                {resourceType === 'notes' && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Role:</span>
                    {(['EDITOR', 'VIEWER'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setInviteRole(r)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium border transition-colors',
                          inviteRole === r
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <RoleIcon role={r} />
                        {roleLabel(r)}
                      </button>
                    ))}
                  </div>
                )}

                <Button
                  onClick={() => void handleInvite()}
                  disabled={selectedUsers.length === 0 || inviteMutation.isPending}
                  className="w-full"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="size-4" />
                      Invite {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {tab === 'members' && (
          <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
            {isLoadingMembers ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No members yet</p>
            ) : (
              members.map((member) => {
                const isCurrentUser = member.userId === currentUserId;
                const canEdit = isOwner && member.role !== 'OWNER';
                return (
                  <div
                    key={member.userId}
                    className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="text-sm">
                        {member.firstName[0]}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {member.firstName} {member.lastName}
                        {isCurrentUser && (
                          <span className="ml-1 text-xs text-muted-foreground">(you)</span>
                        )}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{member.email}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {statusBadge(member.status)}

                      {/* Role display / selector */}
                      {canEdit && resourceType === 'notes' ? (
                        <select
                          value={member.role}
                          onChange={(e) =>
                            void handleUpdateRole(member, e.target.value as 'EDITOR' | 'VIEWER')
                          }
                          disabled={updateRoleMutation.isPending}
                          className="rounded border border-border bg-background px-2 py-0.5 text-xs focus:outline-none"
                        >
                          <option value="EDITOR">Editor</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <RoleIcon role={member.role} />
                          {roleLabel(member.role)}
                        </span>
                      )}

                      {/* Remove button */}
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => void handleRemoveMember(member)}
                          disabled={removeMutation.isPending}
                          className="rounded-full p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Remove member"
                        >
                          {removeMutation.isPending ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <UserMinus className="size-3.5" />
                          )}
                        </button>
                      )}

                      {/* Done icon for active members */}
                      {member.status === 'ACTIVE' && member.role !== 'OWNER' && !canEdit && (
                        <Check className="size-3.5 text-green-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
