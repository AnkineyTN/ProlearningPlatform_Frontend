import type { AxiosResponse } from 'axios';
import api, { publicApi } from '../client';
import type {
  UserSearchResponse,
  InviteRequest,
  InviteResponse,
  MembersListResponse,
  CollabVoidResponse,
  PendingNoteInvite,
  PendingFlashcardInvite,
  PendingExamInvite,
  PendingInvitesResponse,
  AcceptByTokenResponse,
} from '../types/collaboration.types';

export type ResourceType = 'notes' | 'flashcards' | 'exams';

export const collaborationAPI = {
  // ─── Search users ──────────────────────────────────────────────────────────

  searchUsers: (
    setId: number,
    resourceType: ResourceType,
    resourceId: number,
    keyword: string,
    page = 0,
    size = 10,
  ): Promise<AxiosResponse<UserSearchResponse>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (keyword.trim()) params.set('keyword', keyword.trim());
    return api.get(`/sets/${setId}/${resourceType}/${resourceId}/users/search?${params}`);
  },

  // ─── Invite members ────────────────────────────────────────────────────────

  inviteMembers: (
    setId: number,
    resourceType: ResourceType,
    resourceId: number,
    payload: InviteRequest,
  ): Promise<AxiosResponse<InviteResponse>> =>
    api.post(`/sets/${setId}/${resourceType}/${resourceId}/members/invite`, payload),

  // ─── List members ──────────────────────────────────────────────────────────

  getMembers: (
    setId: number,
    resourceType: ResourceType,
    resourceId: number,
    keyword = '',
    page = 0,
    size = 20,
  ): Promise<AxiosResponse<MembersListResponse>> => {
    const params = new URLSearchParams({ page: String(page), size: String(size) });
    if (keyword.trim()) params.set('keyword', keyword.trim());
    return api.get(`/sets/${setId}/${resourceType}/${resourceId}/members?${params}`);
  },

  // ─── Change role (notes only) ──────────────────────────────────────────────

  updateMemberRole: (
    noteId: number,
    targetUserId: number,
    role: 'EDITOR' | 'VIEWER',
  ): Promise<AxiosResponse<CollabVoidResponse>> =>
    api.patch(`/notes/${noteId}/members/${targetUserId}/role`, { role }),

  // ─── Remove member ─────────────────────────────────────────────────────────

  removeMember: (
    setId: number,
    resourceType: ResourceType,
    resourceId: number,
    targetUserId: number,
  ): Promise<AxiosResponse<CollabVoidResponse>> =>
    api.delete(`/sets/${setId}/${resourceType}/${resourceId}/members/${targetUserId}`),

  // ─── Accept invite (in-app) ────────────────────────────────────────────────

  acceptInvite: (
    setId: number,
    resourceType: ResourceType,
    resourceId: number,
  ): Promise<AxiosResponse<CollabVoidResponse>> =>
    api.post(`/sets/${setId}/${resourceType}/${resourceId}/members/accept`),

  // ─── Decline invite (in-app) ───────────────────────────────────────────────

  declineInvite: (
    setId: number,
    resourceType: ResourceType,
    resourceId: number,
  ): Promise<AxiosResponse<CollabVoidResponse>> =>
    api.post(`/sets/${setId}/${resourceType}/${resourceId}/members/decline`),

  // ─── Pending invites ───────────────────────────────────────────────────────

  getPendingNoteInvites: (): Promise<AxiosResponse<PendingInvitesResponse<PendingNoteInvite>>> =>
    api.get('/notes/invites/pending'),

  getPendingFlashcardInvites: (): Promise<AxiosResponse<PendingInvitesResponse<PendingFlashcardInvite>>> =>
    api.get('/flashcards/pending'),

  getPendingExamInvites: (): Promise<AxiosResponse<PendingInvitesResponse<PendingExamInvite>>> =>
    api.get('/exams/pending'),

  // ─── Accept by token (email link) ─────────────────────────────────────────

  acceptNoteByToken: (token: string): Promise<AxiosResponse<AcceptByTokenResponse>> =>
    publicApi.post(`/notes/invites/accept-by-token?token=${encodeURIComponent(token)}`),

  acceptExamByToken: (token: string): Promise<AxiosResponse<AcceptByTokenResponse>> =>
    publicApi.post(`/exam-invites/accept-by-token?token=${encodeURIComponent(token)}`),

  acceptFlashcardByToken: (token: string): Promise<AxiosResponse<AcceptByTokenResponse>> =>
    publicApi.post(`/flashcard-invites/accept-by-token?token=${encodeURIComponent(token)}`),
};
