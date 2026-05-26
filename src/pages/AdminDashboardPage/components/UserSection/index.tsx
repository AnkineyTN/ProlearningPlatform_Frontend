import {
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  MoreHorizontal,
  Eye,
  ShieldOff,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import AdminTopBar from '../TopBar';
import type { AdminUserDirectoryRow } from '@/services/types/adminUsers.types';
import { PAGE_SIZE } from '../../useAdminDashboard';

const ACCOUNT_TYPE_OPTIONS = ['', 'FREE', 'PRO', 'BLOCKED'] as const;

type UsersSectionProps = {
  rows: AdminUserDirectoryRow[];
  page: number;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  searchKeyword: string;
  accountTypeFilter: string;
  onSearchChange: (v: string) => void;
  onAccountTypeChange: (v: string) => void;
  onEdit: (row: AdminUserDirectoryRow) => void;
  onDelete: (id: number, label: string) => void;
  onBlock: (id: number, label: string, isBlocked: boolean) => void;
  onViewDetail: (row: AdminUserDirectoryRow) => void;
  onPrevPage: () => void;
  onNextPage: () => void;
};

const UsersSection = ({
  rows,
  page,
  isLoading,
  isFetching,
  isError,
  searchKeyword,
  accountTypeFilter,
  onSearchChange,
  onAccountTypeChange,
  onEdit,
  onDelete,
  onBlock,
  onViewDetail,
  onPrevPage,
  onNextPage,
}: UsersSectionProps) => {
  const { t } = useTranslation();
  const na = t('adminOnboarding.notAvailable');
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const displayOrDash = (v: string | null | undefined) =>
    v != null && v !== '' ? v : na;

  const filterLabel = (opt: string) => {
    if (opt === '') return t('adminDashboard.filterAll');
    if (opt === 'BLOCKED') return t('adminDashboard.blocked');
    return opt;
  };

  return (
    <div className='flex-1 min-w-0'>
      <AdminTopBar
        kicker={`${rows.length} ${t('adminDashboard.usersKicker')}`}
        title={t('adminDashboard.usersTitle')}
        subtitle={t('adminDashboard.usersSubtitle')}
      />

      <div className='p-6 md:px-10 md:py-7'>
        {/* Toolbar */}
        <div className='flex items-center gap-3 mb-4 flex-wrap'>
          {/* Search */}
          <div className='flex items-center gap-2 px-3.5 py-[9px] bg-[var(--pl-bg-elev)] border border-border rounded-full min-w-[320px] flex-[0_1_360px]'>
            <Search className='w-3.5 h-3.5 text-muted-foreground shrink-0' />
            <input
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('adminDashboard.searchPlaceholder')}
              className='flex-1 text-[13px] text-foreground bg-transparent border-none outline-none'
            />
            {searchKeyword && (
              <button
                onClick={() => onSearchChange('')}
                className='text-muted-foreground hover:text-foreground'
              >
                <span className='text-xs'>×</span>
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className='flex gap-0 bg-[var(--pl-bg-elev)] border border-border rounded-full p-[3px]'>
            {ACCOUNT_TYPE_OPTIONS.map((f) => {
              const active = accountTypeFilter === f;
              return (
                <button
                  key={f || 'all'}
                  onClick={() => onAccountTypeChange(f)}
                  className={`inline-flex items-center gap-[7px] px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                    active
                      ? 'bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)] border border-[var(--pl-accent-border)] font-medium'
                      : 'border border-transparent text-muted-foreground'
                  }`}
                >
                  {filterLabel(f)}
                </button>
              );
            })}
          </div>

          <div className='flex-1' />

          <Button
            variant='outline'
            size='sm'
            onClick={() => onAccountTypeChange('')}
            className='gap-1.5'
          >
            <Filter className='w-[13px] h-[13px]' />
            {t('adminDashboard.resetSort')}
          </Button>
        </div>

        {isError && (
          <p className='text-sm text-destructive px-1 mb-3'>
            {t('adminDashboard.usersLoadError')}
          </p>
        )}

        {/* Table */}
        <div className='bg-[var(--pl-bg-elev)] border border-border rounded-[14px] overflow-hidden'>
          {isLoading ? (
            <div className='p-16 text-center text-muted-foreground text-sm'>
              {t('onboarding.loading')}
            </div>
          ) : rows.length === 0 ? (
            <div className='py-16 text-center'>
              <div className='font-[family-name:var(--font-display)] text-[22px] text-muted-foreground mb-1.5'>
                {t('adminDashboard.noMatches')}
              </div>
              <div className='text-[13px] text-muted-foreground'>
                {t('adminDashboard.noMatchesSub')}
              </div>
            </div>
          ) : (
            <div className='overflow-x-auto'>
              <div className='min-w-[1000px]'>
                {/* Header */}
                <div className='grid grid-cols-[1.8fr_2fr_100px_80px_1fr_1fr_100px_60px] border-b border-border bg-[var(--pl-bg-sunken)] items-center'>
                  {[
                    t('adminDashboard.colName'),
                    t('adminDashboard.colEmail'),
                    t('adminDashboard.colRoles'),
                    t('adminDashboard.colLanguage'),
                    t('adminDashboard.colEducation'),
                    t('adminDashboard.colHearAppFrom'),
                    t('adminDashboard.colAccountType'),
                    '',
                  ].map((label, i) => (
                    <div
                      key={i}
                      className='px-3.5 py-[11px] text-[10.5px] tracking-[0.14em] uppercase text-muted-foreground'
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Rows */}
                {rows.map((row) => {
                  const u = row.user;
                  const name =
                    `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim();
                  return (
                    <div
                      key={u.id}
                      className='grid grid-cols-[1.8fr_2fr_100px_80px_1fr_1fr_100px_60px] items-center border-b border-border last:border-b-0 hover:bg-[var(--pl-bg-hover)] transition-colors cursor-pointer'
                      style={{
                        background: u.isBlocked
                          ? 'oklch(0.65 0.2 25 / 0.04)'
                          : undefined,
                      }}
                      onClick={() => onViewDetail(row)}
                    >
                      {/* Name */}
                      <div className='px-3.5 py-3 flex items-center gap-2.5 min-w-0'>
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt=''
                            className='w-8 h-8 rounded-lg object-cover shrink-0'
                          />
                        ) : (
                          <div
                            className='w-8 h-8 rounded-lg shrink-0 grid place-items-center text-[11px] font-medium font-[family-name:var(--font-mono-pl)]'
                            style={{
                              background: `oklch(0.6 0.12 ${((name.charCodeAt(0) || 65) * 13 + name.length * 27) % 360} / 0.18)`,
                              border: `1px solid oklch(0.6 0.12 ${((name.charCodeAt(0) || 65) * 13 + name.length * 27) % 360} / 0.4)`,
                              color: `oklch(0.7 0.13 ${((name.charCodeAt(0) || 65) * 13 + name.length * 27) % 360})`,
                            }}
                          >
                            {[u.firstName?.[0], u.lastName?.[0]]
                              .filter(Boolean)
                              .join('')
                              .toUpperCase() || 'U'}
                          </div>
                        )}
                        <div className='min-w-0'>
                          <div className='text-[13px] font-medium truncate flex items-center gap-2'>
                            {name || 'Unknown'}
                            {u.isBlocked && (
                              <span className='text-[9px] px-[7px] py-[1px] rounded-full bg-red-500/10 text-red-500 border border-red-500/30 font-medium'>
                                {t('adminDashboard.blocked')}
                              </span>
                            )}
                          </div>
                          <div className='text-[10.5px] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                            #{u.id}
                          </div>
                        </div>
                      </div>
                      {/* Email */}
                      <div className='px-3.5 py-3 text-[12.5px] text-muted-foreground font-[family-name:var(--font-mono-pl)] truncate'>
                        {u.email}
                      </div>
                      {/* Role */}
                      <div className='px-3.5 py-3'>
                        {u.roles.length > 0 && (
                          <span
                            className={`inline-flex text-[11px] px-2 py-0.5 rounded-full border font-[family-name:var(--font-mono-pl)] tracking-[0.04em] ${
                              u.roles.some((r) => r.includes('ADMIN'))
                                ? 'border-[var(--pl-accent-border)] bg-[var(--pl-accent-soft)] text-[var(--pl-accent-strong)]'
                                : 'border-border bg-[var(--pl-bg-hover)] text-muted-foreground'
                            }`}
                          >
                            {u.roles
                              .map((r) => r.replace('ROLE_', ''))
                              .join(', ')}
                          </span>
                        )}
                      </div>
                      {/* Lang */}
                      <div className='px-3.5 py-3 text-[11.5px] font-[family-name:var(--font-mono-pl)] text-muted-foreground'>
                        {displayOrDash(u.language)}
                      </div>
                      {/* Education */}
                      <div className='px-3.5 py-3 text-[12.5px] text-muted-foreground'>
                        {displayOrDash(u.education)}
                      </div>
                      {/* From */}
                      <div className='px-3.5 py-3 text-[12.5px] text-muted-foreground'>
                        {displayOrDash(u.hearAppFrom)}
                      </div>
                      {/* Account */}
                      <div className='px-3.5 py-3'>
                        {u.accountType === 'PRO' ? (
                          <span className='inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-[family-name:var(--font-mono-pl)] tracking-[0.04em] border-[oklch(0.72_0.17_55_/_0.4)] bg-[oklch(0.72_0.17_55_/_0.15)] text-[oklch(0.72_0.17_55)]'>
                            PRO
                          </span>
                        ) : (
                          <span className='inline-flex text-[11px] px-2 py-0.5 rounded-full border border-border bg-[var(--pl-bg-hover)] text-muted-foreground font-[family-name:var(--font-mono-pl)] tracking-[0.04em]'>
                            {u.accountType || 'FREE'}
                          </span>
                        )}
                      </div>
                      {/* Actions */}
                      <div
                        className='px-3.5 py-3 relative flex justify-end'
                        ref={openMenu === u.id ? menuRef : undefined}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenu(openMenu === u.id ? null : u.id);
                          }}
                          className={`w-7 h-7 rounded-[7px] grid place-items-center text-muted-foreground transition-colors ${
                            openMenu === u.id
                              ? 'bg-[var(--pl-bg-hover)]'
                              : 'hover:bg-[var(--pl-bg-hover)]'
                          }`}
                        >
                          <MoreHorizontal className='w-3.5 h-3.5' />
                        </button>
                        {openMenu === u.id && (
                          <div
                            className='absolute top-full right-2 mt-1 bg-[var(--pl-bg-elev)] border border-border rounded-[10px] p-1 min-w-[168px] shadow-lg z-50'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ActionMenuItem
                              icon={Eye}
                              label={t('adminDashboard.viewDetail')}
                              onClick={() => {
                                onViewDetail(row);
                                setOpenMenu(null);
                              }}
                            />
                            <ActionMenuItem
                              icon={Pencil}
                              label={t('adminDashboard.editUser')}
                              onClick={() => {
                                onEdit(row);
                                setOpenMenu(null);
                              }}
                            />
                            <div className='h-px bg-border my-1' />
                            <ActionMenuItem
                              icon={u.isBlocked ? ShieldCheck : ShieldOff}
                              label={
                                u.isBlocked
                                  ? t('adminDashboard.unblockUser')
                                  : t('adminDashboard.blockUser')
                              }
                              kind={u.isBlocked ? 'success' : 'warning'}
                              onClick={() => {
                                onBlock(u.id, name, u.isBlocked);
                                setOpenMenu(null);
                              }}
                            />
                            <ActionMenuItem
                              icon={Trash2}
                              label={t('adminDashboard.deleteUser')}
                              kind='danger'
                              onClick={() => {
                                onDelete(u.id, name);
                                setOpenMenu(null);
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className='flex items-center justify-between px-[22px] py-3 border-t border-border text-xs text-muted-foreground'>
            <div>
              {t('adminDashboard.showingOf')}{' '}
              <span className='text-foreground font-[family-name:var(--font-mono-pl)]'>
                {rows.length}
              </span>
              {' · '}
              page {page + 1}
            </div>
            <div className='flex items-center gap-3'>
              <Button
                variant='outline'
                size='sm'
                disabled={page <= 0 || isFetching}
                onClick={onPrevPage}
                className='h-[26px] w-[26px] p-0'
              >
                <ChevronLeft className='w-3 h-3' />
              </Button>
              <Button
                variant='outline'
                size='sm'
                disabled={rows.length < PAGE_SIZE || isFetching}
                onClick={onNextPage}
                className='h-[26px] w-[26px] p-0'
              >
                <ChevronRight className='w-3 h-3' />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionMenuItem = ({
  icon: Icon,
  label,
  onClick,
  kind = 'default',
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  kind?: 'default' | 'danger' | 'warning' | 'success';
}) => {
  const colorMap = {
    default: 'text-foreground',
    danger: 'text-red-500',
    warning: 'text-amber-500',
    success: 'text-green-500',
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-[9px] px-2.5 py-[7px] rounded-md text-[12.5px] w-full text-left hover:bg-[var(--pl-bg-hover)] transition-colors ${colorMap[kind]}`}
    >
      <Icon className='w-[13px] h-[13px]' />
      {label}
    </button>
  );
};

export default UsersSection;
