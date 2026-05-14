import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import {
  adminUsersAPI,
  extractAdminUsersList,
} from '@/services/endpoints/adminUsers';
import { onboardingAPI } from '@/services/endpoints/onboarding';
import type { AdminUserDirectoryRow } from '@/services/types/adminUsers.types';

const PAGE_SIZE = 20;

export { PAGE_SIZE };

export const useAdminDashboard = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [editRow, setEditRow] = useState<AdminUserDirectoryRow | null>(null);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editAccountType, setEditAccountType] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);
  const [blockTarget, setBlockTarget] = useState<{
    id: number;
    label: string;
    isBlocked: boolean;
  } | null>(null);
  const [blockReason, setBlockReason] = useState('');
  const [appealTarget, setAppealTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);

  const usersQuery = useQuery({
    queryKey: ['admin', 'users', page],
    queryFn: async () => {
      const res = await adminUsersAPI.list({
        page,
        size: PAGE_SIZE,
        sort: 'id,DESC',
      });
      return extractAdminUsersList(res.data.data);
    },
  });

  const analyticsQuery = useQuery({
    queryKey: ['admin', 'onboarding', 'analytics'],
    queryFn: async () => {
      const res = await onboardingAPI.getAdminAnalytics();
      return res.data.data;
    },
  });

  useEffect(() => {
    if (!editRow) return;
    const u = editRow.user;
    setEditFirst(u.firstName);
    setEditLast(u.lastName);
    setEditAccountType(u.accountType ?? '');
  }, [editRow]);

  const updateMutation = useMutation({
    mutationFn: async (payload: {
      userId: number;
      firstName: string;
      lastName: string;
      accountType: string | undefined;
    }) => {
      const body: Record<string, string> = {
        firstName: payload.firstName,
        lastName: payload.lastName,
      };
      if (payload.accountType != null && payload.accountType !== '') {
        body.accountType = payload.accountType;
      }
      return adminUsersAPI.update(payload.userId, body);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('adminDashboard.userUpdated'));
      setEditRow(null);
    },
    onError: () => {
      toast.error(t('adminDashboard.updateError'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => adminUsersAPI.delete(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('adminDashboard.userDeleted'));
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error(t('adminDashboard.deleteError'));
    },
  });

  const blockMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: number; reason: string }) =>
      adminUsersAPI.blockUser(userId, { reason }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('adminDashboard.userBlocked'));
      setBlockTarget(null);
      setBlockReason('');
    },
    onError: () => toast.error(t('adminDashboard.blockError')),
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: number) => adminUsersAPI.unblockUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('adminDashboard.userUnblocked'));
      setBlockTarget(null);
    },
    onError: () => toast.error(t('adminDashboard.unblockError')),
  });

  const refreshAll = () => {
    void usersQuery.refetch();
    void analyticsQuery.refetch();
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    try {
      const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
      return new Date(iso).toLocaleString(locale);
    } catch {
      return iso;
    }
  };

  const openEdit = (row: AdminUserDirectoryRow) => setEditRow(row);

  const saveEdit = () => {
    if (!editRow) return;
    updateMutation.mutate({
      userId: editRow.user.id,
      firstName: editFirst.trim(),
      lastName: editLast.trim(),
      accountType: editAccountType === '' ? undefined : editAccountType,
    });
  };

  return {
    t,
    page,
    setPage,
    editRow,
    setEditRow,
    editFirst,
    setEditFirst,
    editLast,
    setEditLast,
    editAccountType,
    setEditAccountType,
    deleteTarget,
    setDeleteTarget,
    blockTarget,
    setBlockTarget,
    blockReason,
    setBlockReason,
    appealTarget,
    setAppealTarget,
    usersQuery,
    analyticsQuery,
    rows: usersQuery.data ?? [],
    analytics: analyticsQuery.data,
    refreshAll,
    formatDate,
    openEdit,
    saveEdit,
    updateMutation,
    deleteMutation,
    blockMutation,
    unblockMutation,
  };
};
