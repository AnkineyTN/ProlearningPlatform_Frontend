import { useAdminDashboard } from './AdminDashboardPage/useAdminDashboard';
import AdminPageHeader from './AdminDashboardPage/AdminPageHeader';
import UsersSection from './AdminDashboardPage/UsersSection';
import AnalyticsSection from './AdminDashboardPage/AnalyticsSection';
import EditUserDialog from './AdminDashboardPage/EditUserDialog';
import DeleteUserDialog from './AdminDashboardPage/DeleteUserDialog';
import BlockUserDialog from './AdminDashboardPage/BlockUserDialog';
import AppealListDialog from './AdminDashboardPage/AppealListDialog';

const AdminDashboardPage = () => {
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
    appealTarget,
    setAppealTarget,
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

  return (
    <div className='min-h-screen bg-[var(--pl-bg-sunken)] text-foreground p-6 md:p-10'>
      <div className='max-w-6xl mx-auto space-y-6'>
        <AdminPageHeader
          isFetching={usersQuery.isFetching || analyticsQuery.isFetching}
          onRefresh={refreshAll}
        />

        <UsersSection
          rows={rows}
          page={page}
          isLoading={usersQuery.isLoading}
          isFetching={usersQuery.isFetching}
          isError={usersQuery.isError}
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
          onViewAppeals={(id, label) => setAppealTarget({ id, label })}
          onPrevPage={() => setPage((p) => Math.max(0, p - 1))}
          onNextPage={() => setPage((p) => p + 1)}
        />

        <AnalyticsSection
          analytics={analytics}
          isLoading={analyticsQuery.isLoading}
          isError={analyticsQuery.isError}
        />
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
          onClose={() => { setBlockTarget(null); setBlockReason(''); }}
          onConfirm={() => blockMutation.mutate({ userId: blockTarget.id, reason: blockReason })}
        />
      )}

      {appealTarget && (
        <AppealListDialog
          open={true}
          userId={appealTarget.id}
          userName={appealTarget.label}
          onClose={() => setAppealTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
