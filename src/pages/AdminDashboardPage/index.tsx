import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdminDashboard } from './useAdminDashboard';
import AdminPageHeader from './AdminPageHeader';
import UsersSection from './UsersSection';
import AnalyticsSection from './AnalyticsSection';
import AppealsSection from './AppealsSection';
import BlockedUsersSection from './BlockedUsersSection';
import PlatformStatsSection from './PlatformStatsSection';
import PomodoroAssetsSection from './PomodoroAssetsSection';
import UserDetailSheet from './UserDetailSheet';
import EditUserDialog from './EditUserDialog';
import DeleteUserDialog from './DeleteUserDialog';
import BlockUserDialog from './BlockUserDialog';
import type { AdminUserDirectoryRow } from '@/services/types/adminUsers.types';

type AdminTab = 'users' | 'appeals' | 'blocked' | 'stats' | 'pomodoro';

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const [detailRow, setDetailRow] = useState<AdminUserDirectoryRow | null>(
    null,
  );

  const {
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
    searchKeyword,
    handleSearchChange,
    accountTypeFilter,
    setAccountTypeFilter,
    usersQuery,
    analyticsQuery,
    rows,
    analytics,
    refreshAll,
    formatDate,
    openEdit,
    saveEdit,
    updateMutation,
    deleteMutation,
    blockMutation,
    unblockMutation,
  } = useAdminDashboard();

  const tabs: { key: AdminTab; label: string }[] = [
    { key: 'users', label: t('adminDashboard.tabUsers') },
    { key: 'appeals', label: t('adminDashboard.tabAppeals') },
    { key: 'blocked', label: t('adminDashboard.tabBlocked') },
    { key: 'stats', label: t('adminDashboard.tabStats') },
    { key: 'pomodoro', label: t('adminDashboard.tabPomodoro') },
  ];

  return (
    <div className='min-h-screen bg-[var(--pl-bg-sunken)] text-foreground p-6 md:p-10'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <AdminPageHeader
          isFetching={usersQuery.isFetching || analyticsQuery.isFetching}
          onRefresh={refreshAll}
        />

        <div className='flex gap-1 border-b border-border'>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <UsersSection
            rows={rows}
            page={page}
            isLoading={usersQuery.isLoading}
            isFetching={usersQuery.isFetching}
            isError={usersQuery.isError}
            searchKeyword={searchKeyword}
            accountTypeFilter={accountTypeFilter}
            onSearchChange={handleSearchChange}
            onAccountTypeChange={setAccountTypeFilter}
            formatDate={formatDate}
            onEdit={openEdit}
            onDelete={(id, label) => setDeleteTarget({ id, label })}
            onBlock={(id, label, isBlocked) => {
              if (isBlocked) {
                unblockMutation.mutate(id);
              } else {
                setBlockTarget({ id, label, isBlocked });
              }
            }}
            onViewDetail={(row) => setDetailRow(row)}
            onPrevPage={() => setPage((p) => Math.max(0, p - 1))}
            onNextPage={() => setPage((p) => p + 1)}
          />
        )}

        {activeTab === 'appeals' && <AppealsSection />}
        {activeTab === 'blocked' && <BlockedUsersSection />}
        {activeTab === 'stats' && <PlatformStatsSection />}
        {activeTab === 'pomodoro' && <PomodoroAssetsSection />}

        {activeTab === 'stats' && (
          <AnalyticsSection
            analytics={analytics}
            isLoading={analyticsQuery.isLoading}
            isError={analyticsQuery.isError}
          />
        )}
      </div>

      <EditUserDialog
        open={editRow != null}
        firstName={editFirst}
        lastName={editLast}
        accountType={editAccountType}
        isSaving={updateMutation.isPending}
        onFirstNameChange={setEditFirst}
        onLastNameChange={setEditLast}
        onAccountTypeChange={setEditAccountType}
        onClose={() => setEditRow(null)}
        onSave={saveEdit}
      />

      <DeleteUserDialog
        target={deleteTarget}
        isPending={deleteMutation.isPending}
        onClose={() => setDeleteTarget(null)}
        onConfirm={(id) => deleteMutation.mutate(id)}
      />

      {blockTarget && !blockTarget.isBlocked && (
        <BlockUserDialog
          open={true}
          userName={blockTarget.label}
          reason={blockReason}
          isSaving={blockMutation.isPending}
          onReasonChange={setBlockReason}
          onClose={() => {
            setBlockTarget(null);
            setBlockReason('');
          }}
          onConfirm={() =>
            blockMutation.mutate({
              userId: blockTarget.id,
              reason: blockReason,
            })
          }
        />
      )}

      {detailRow && (
        <UserDetailSheet
          user={detailRow.user}
          onClose={() => setDetailRow(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
