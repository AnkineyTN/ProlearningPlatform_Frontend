import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  Bell,
  Timer,
  List,
  Settings,
  PanelLeftClose,
  PanelLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AdminTopBar from './components/TopBar';
import { useAdminDashboard } from './useAdminDashboard';
import OverviewSection from './components/OverviewSection';
import UsersSection from './components/UserSection';
import AppealsBlocksSection from './components/AppealsBlockSection';
import PomodoroAssetsSection from './components/PomodoroAssetsSection';
import UserDetailSheet from './components/UserDetailSheet';
import EditUserDialog from './components/UserSection/EditUserDialog';
import DeleteUserDialog from './components/UserSection/DeleteUserDialog';
import BlockUserDialog from './components/UserSection/BlockUserDialog';
import type { AdminUserDirectoryRow } from '@/services/types/adminUsers.types';

type AdminSection =
  | 'overview'
  | 'users'
  | 'appeals'
  | 'pomodoro'
  | 'logs'
  | 'settings';

const NAV_ITEMS: {
  id: AdminSection;
  labelKey: string;
  icon: React.ElementType;
}[] = [
  { id: 'overview', labelKey: 'sidebarOverview', icon: LayoutDashboard },
  { id: 'users', labelKey: 'sidebarUsers', icon: Users },
  { id: 'appeals', labelKey: 'sidebarAppeals', icon: Bell },
  { id: 'pomodoro', labelKey: 'sidebarPomodoro', icon: Timer },
];

const FOOTER_ITEMS: {
  id: AdminSection;
  labelKey: string;
  icon: React.ElementType;
}[] = [
  { id: 'logs', labelKey: 'sidebarAuditLog', icon: List },
  { id: 'settings', labelKey: 'sidebarSettings', icon: Settings },
];

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [section, setSection] = useState<AdminSection>('overview');
  const [collapsed, setCollapsed] = useState(false);
  const [detailRow, setDetailRow] = useState<AdminUserDirectoryRow | null>(
    null,
  );

  const dashboard = useAdminDashboard();

  const initials = authUser
    ? [authUser.firstName?.[0], authUser.lastName?.[0]]
        .filter(Boolean)
        .join('')
        .toUpperCase() || 'A'
    : 'A';

  const fullName = authUser
    ? `${authUser.firstName ?? ''} ${authUser.lastName ?? ''}`.trim() || 'Admin'
    : 'Admin';

  return (
    <div className='flex min-h-screen bg-[var(--pl-bg)] text-foreground'>
      {/* Sidebar */}
      <aside
        className='flex flex-col flex-shrink-0 border-r border-border bg-[var(--pl-bg-sunken)] sticky top-0 h-screen transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]'
        style={{ width: collapsed ? 68 : 232 }}
      >
        {/* Logo */}
        <div
          className='h-[68px] flex items-center'
          style={{
            padding: collapsed ? 0 : '0 18px',
            justifyContent: collapsed ? 'center' : 'space-between',
          }}
        >
          {!collapsed ? (
            <>
              <Link
                to='/dashboard'
                className='flex items-center gap-2.5 hover:opacity-80 transition-opacity'
              >
                <div className='w-[30px] h-[30px] rounded-lg bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] grid place-items-center font-[family-name:var(--font-display)] font-medium text-lg'>
                  P
                </div>
                <div>
                  <div className='font-[family-name:var(--font-display)] text-lg font-medium tracking-tight leading-none'>
                    ProLearning
                  </div>
                  <div className='text-[10px] text-muted-foreground tracking-[0.14em] uppercase mt-0.5'>
                    {t('adminDashboard.adminConsole')}
                  </div>
                </div>
              </Link>
              <button
                onClick={() => setCollapsed(true)}
                className='text-muted-foreground hover:text-foreground transition-colors'
              >
                <PanelLeftClose className='w-4 h-4' />
              </button>
            </>
          ) : (
            <Link
              to='/dashboard'
              className='w-8 h-8 rounded-lg bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] grid place-items-center font-[family-name:var(--font-display)] font-medium text-lg hover:opacity-80 transition-opacity'
            >
              P
            </Link>
          )}
        </div>

        {/* Admin mode badge */}
        {!collapsed && (
          <div className='px-3 pb-3'>
            <div className='w-full flex items-center gap-2 px-2.5 py-[7px] bg-[var(--pl-bg)] border border-[var(--pl-accent-border)] rounded-lg text-[var(--pl-accent-strong)] text-[11px] tracking-[0.16em] uppercase'>
              <span className='w-1.5 h-1.5 rounded-full bg-[var(--pl-accent)]' />
              <span>{t('adminDashboard.adminMode')}</span>
            </div>
          </div>
        )}

        {/* Operations nav */}
        {!collapsed && (
          <div className='px-[18px] pt-1 pb-2 text-[10px] tracking-[0.18em] uppercase text-muted-foreground'>
            {t('adminDashboard.sidebarOps')}
          </div>
        )}
        <nav className='px-2.5 flex flex-col gap-0.5'>
          {NAV_ITEMS.map((item) => {
            const active = section === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-[11px] rounded-[7px] text-[13px] text-left w-full transition-all duration-150 ${
                  active
                    ? 'text-[var(--pl-accent-strong)] bg-[var(--pl-accent-soft)] font-medium'
                    : 'text-muted-foreground hover:bg-[var(--pl-bg-hover)]'
                }`}
                style={{
                  padding: collapsed ? '10px 0' : '8px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={
                  collapsed ? t(`adminDashboard.${item.labelKey}`) : undefined
                }
              >
                <Icon className='w-4 h-4 shrink-0' />
                {!collapsed && (
                  <span>{t(`adminDashboard.${item.labelKey}`)}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System nav */}
        {!collapsed && (
          <div className='px-[18px] pt-[18px] pb-2 text-[10px] tracking-[0.18em] uppercase text-muted-foreground'>
            {t('adminDashboard.sidebarSystem')}
          </div>
        )}
        <nav className='px-2.5 flex flex-col gap-0.5'>
          {FOOTER_ITEMS.map((item) => {
            const active = section === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-[11px] rounded-[7px] text-[13px] text-left w-full transition-all duration-150 ${
                  active
                    ? 'text-[var(--pl-accent-strong)] bg-[var(--pl-accent-soft)] font-medium'
                    : 'text-muted-foreground hover:bg-[var(--pl-bg-hover)]'
                }`}
                style={{
                  padding: collapsed ? '10px 0' : '8px 10px',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                }}
                title={
                  collapsed ? t(`adminDashboard.${item.labelKey}`) : undefined
                }
              >
                <Icon className='w-4 h-4 shrink-0' />
                {!collapsed && (
                  <span>{t(`adminDashboard.${item.labelKey}`)}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className='flex-1' />

        {/* User card */}
        <div className='p-3 border-t border-border'>
          <div className='flex items-center gap-2.5 p-1.5 rounded-lg'>
            <div className='w-[30px] h-[30px] rounded-lg shrink-0 bg-gradient-to-br from-[var(--pl-accent)] to-[oklch(0.62_0.09_185)] grid place-items-center text-white text-xs font-semibold'>
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className='flex-1 min-w-0'>
                  <div className='text-[12.5px] font-medium truncate'>
                    {fullName}
                  </div>
                  <div className='text-[10.5px] text-muted-foreground'>
                    {t('adminDashboard.superAdmin')}
                  </div>
                </div>
                <ChevronRight className='w-[13px] h-[13px] text-muted-foreground' />
              </>
            )}
          </div>
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className='mt-2.5 w-full grid place-items-center p-2 text-muted-foreground hover:text-foreground transition-colors'
            >
              <PanelLeft className='w-4 h-4' />
            </button>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className='flex-1 min-w-0 flex flex-col'>
        {section === 'overview' && <OverviewSection />}

        {section === 'users' && (
          <UsersSection
            rows={dashboard.rows}
            page={dashboard.page}
            isLoading={dashboard.usersQuery.isLoading}
            isFetching={dashboard.usersQuery.isFetching}
            isError={dashboard.usersQuery.isError}
            searchKeyword={dashboard.searchKeyword}
            accountTypeFilter={dashboard.accountTypeFilter}
            onSearchChange={dashboard.handleSearchChange}
            onAccountTypeChange={dashboard.setAccountTypeFilter}
            onEdit={dashboard.openEdit}
            onDelete={(id, label) => dashboard.setDeleteTarget({ id, label })}
            onBlock={(id, label, isBlocked) => {
              if (isBlocked) {
                dashboard.unblockMutation.mutate(id);
              } else {
                dashboard.setBlockTarget({ id, label, isBlocked });
              }
            }}
            onViewDetail={(row) => setDetailRow(row)}
            onPrevPage={() => dashboard.setPage((p) => Math.max(0, p - 1))}
            onNextPage={() => dashboard.setPage((p) => p + 1)}
          />
        )}

        {section === 'appeals' && <AppealsBlocksSection />}

        {section === 'pomodoro' && (
          <div className='flex-1 min-w-0 flex flex-col'>
            <AdminTopBar
              title={t('adminDashboard.pomodoroAssetsTitle')}
              subtitle={t('adminDashboard.pomodoroSubtitle')}
            />
            <div className='p-6 md:px-10 md:py-7'>
              <PomodoroAssetsSection />
            </div>
          </div>
        )}

        {(section === 'logs' || section === 'settings') && (
          <div className='flex-1 min-w-0 flex flex-col'>
            <AdminTopBar
              title={
                section === 'logs'
                  ? t('adminDashboard.sidebarAuditLog')
                  : t('adminDashboard.sidebarSettings')
              }
            />
            <div className='flex-1 flex items-center justify-center'>
              <div className='text-center'>
                <div className='font-[family-name:var(--font-display)] text-[28px] text-muted-foreground'>
                  {t('adminDashboard.placeholderTitle')}
                </div>
                <div className='text-sm text-muted-foreground mt-2'>
                  {t('adminDashboard.placeholderSub')}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Dialogs */}
      <EditUserDialog
        open={dashboard.editRow != null}
        firstName={dashboard.editFirst}
        lastName={dashboard.editLast}
        accountType={dashboard.editAccountType}
        isSaving={dashboard.updateMutation.isPending}
        onFirstNameChange={dashboard.setEditFirst}
        onLastNameChange={dashboard.setEditLast}
        onAccountTypeChange={dashboard.setEditAccountType}
        onClose={() => dashboard.setEditRow(null)}
        onSave={dashboard.saveEdit}
      />

      <DeleteUserDialog
        target={dashboard.deleteTarget}
        isPending={dashboard.deleteMutation.isPending}
        onClose={() => dashboard.setDeleteTarget(null)}
        onConfirm={(id) => dashboard.deleteMutation.mutate(id)}
      />

      {dashboard.blockTarget && !dashboard.blockTarget.isBlocked && (
        <BlockUserDialog
          open={true}
          userName={dashboard.blockTarget.label}
          reason={dashboard.blockReason}
          isSaving={dashboard.blockMutation.isPending}
          onReasonChange={dashboard.setBlockReason}
          onClose={() => {
            dashboard.setBlockTarget(null);
            dashboard.setBlockReason('');
          }}
          onConfirm={() =>
            dashboard.blockMutation.mutate({
              userId: dashboard.blockTarget!.id,
              reason: dashboard.blockReason,
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
