import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { collaborationAPI, type ResourceType } from '@/services/endpoints/collaboration';
import type { InviteRequest } from '@/services/types/collaboration.types';

// ─── Query keys ───────────────────────────────────────────────────────────────

export const collabKeys = {
  members: (setId: number, resourceType: ResourceType, resourceId: number) =>
    ['collab', 'members', setId, resourceType, resourceId] as const,
  searchUsers: (setId: number, resourceType: ResourceType, resourceId: number, keyword: string) =>
    ['collab', 'search', setId, resourceType, resourceId, keyword] as const,
  pendingNotes: () => ['collab', 'pending', 'notes'] as const,
  pendingFlashcards: () => ['collab', 'pending', 'flashcards'] as const,
  pendingExams: () => ['collab', 'pending', 'exams'] as const,
};

// ─── Search users ─────────────────────────────────────────────────────────────

export function useSearchCollabUsers(
  setId: number,
  resourceType: ResourceType,
  resourceId: number,
  keyword: string,
  enabled = true,
) {
  return useQuery({
    queryKey: collabKeys.searchUsers(setId, resourceType, resourceId, keyword),
    queryFn: () =>
      collaborationAPI
        .searchUsers(setId, resourceType, resourceId, keyword)
        .then((r) => r.data.data ?? []),
    enabled: enabled && keyword.trim().length >= 2,
    staleTime: 30_000,
  });
}

// ─── Members list ─────────────────────────────────────────────────────────────

export function useCollabMembers(
  setId: number,
  resourceType: ResourceType,
  resourceId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: collabKeys.members(setId, resourceType, resourceId),
    queryFn: () =>
      collaborationAPI
        .getMembers(setId, resourceType, resourceId)
        .then((r) => r.data.data ?? []),
    enabled: enabled && resourceId > 0 && setId > 0,
    staleTime: 30_000,
  });
}

// ─── Invite members ───────────────────────────────────────────────────────────

export function useInviteMembers(
  setId: number,
  resourceType: ResourceType,
  resourceId: number,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteRequest) =>
      collaborationAPI.inviteMembers(setId, resourceType, resourceId, payload),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: collabKeys.members(setId, resourceType, resourceId),
      });
    },
  });
}

// ─── Update role ──────────────────────────────────────────────────────────────

export function useUpdateMemberRole(
  setId: number,
  resourceType: ResourceType,
  resourceId: number,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ targetUserId, role }: { targetUserId: number; role: 'EDITOR' | 'VIEWER' }) =>
      collaborationAPI.updateMemberRole(resourceId, targetUserId, role),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: collabKeys.members(setId, resourceType, resourceId),
      });
    },
  });
}

// ─── Remove member ────────────────────────────────────────────────────────────

export function useRemoveMember(
  setId: number,
  resourceType: ResourceType,
  resourceId: number,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: number) =>
      collaborationAPI.removeMember(setId, resourceType, resourceId, targetUserId),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: collabKeys.members(setId, resourceType, resourceId),
      });
    },
  });
}

// ─── Accept / Decline invite (in-app) ────────────────────────────────────────

export function useAcceptInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      setId,
      resourceType,
      resourceId,
    }: {
      setId: number;
      resourceType: ResourceType;
      resourceId: number;
    }) => collaborationAPI.acceptInvite(setId, resourceType, resourceId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collabKeys.pendingNotes() });
      void qc.invalidateQueries({ queryKey: collabKeys.pendingFlashcards() });
      void qc.invalidateQueries({ queryKey: collabKeys.pendingExams() });
    },
  });
}

export function useDeclineInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      setId,
      resourceType,
      resourceId,
    }: {
      setId: number;
      resourceType: ResourceType;
      resourceId: number;
    }) => collaborationAPI.declineInvite(setId, resourceType, resourceId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: collabKeys.pendingNotes() });
      void qc.invalidateQueries({ queryKey: collabKeys.pendingFlashcards() });
      void qc.invalidateQueries({ queryKey: collabKeys.pendingExams() });
    },
  });
}

// ─── Pending invites ──────────────────────────────────────────────────────────

export function usePendingNoteInvites() {
  return useQuery({
    queryKey: collabKeys.pendingNotes(),
    queryFn: () => collaborationAPI.getPendingNoteInvites().then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });
}

export function usePendingFlashcardInvites() {
  return useQuery({
    queryKey: collabKeys.pendingFlashcards(),
    queryFn: () => collaborationAPI.getPendingFlashcardInvites().then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });
}

export function usePendingExamInvites() {
  return useQuery({
    queryKey: collabKeys.pendingExams(),
    queryFn: () => collaborationAPI.getPendingExamInvites().then((r) => r.data.data ?? []),
    staleTime: 60_000,
  });
}
