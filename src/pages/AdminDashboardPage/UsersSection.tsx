import { Pencil, Trash2, ChevronLeft, ChevronRight, Users, ShieldOff, ShieldCheck, Search, UserRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AdminUserDirectoryRow } from '@/services/types/adminUsers.types';
import { PAGE_SIZE } from './useAdminDashboard';

const ACCOUNT_TYPE_OPTIONS = ['', 'PRO', 'FREE'] as const;

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
  formatDate: (iso: string | null) => string | null;
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
  formatDate,
  onEdit,
  onDelete,
  onBlock,
  onViewDetail,
  onPrevPage,
  onNextPage,
}: UsersSectionProps) => {
  const { t } = useTranslation();
  const na = t('adminOnboarding.notAvailable');

  const displayOrDash = (v: string | null | undefined) =>
    v != null && v !== '' ? v : na;

  return (
    <section className='space-y-3'>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center'>
          <Users className='w-4 h-4 text-indigo-500' />
        </div>
        <div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
            MANAGEMENT
          </p>
          <h2 className='font-semibold leading-tight'>
            {t('adminDashboard.usersTitle')}
          </h2>
        </div>
      </div>

      <div className='flex flex-col sm:flex-row gap-2'>
        <div className='relative flex-1'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none' />
          <Input
            className='pl-8 h-8 text-sm'
            placeholder={t('adminDashboard.searchPlaceholder')}
            value={searchKeyword}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>
        <div className='flex gap-1.5'>
          {ACCOUNT_TYPE_OPTIONS.map(opt => (
            <button key={opt || 'all'} onClick={() => onAccountTypeChange(opt)}
              className={`text-[11px] px-3 py-1 rounded-full border font-medium transition-colors whitespace-nowrap ${
                accountTypeFilter === opt
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:border-foreground/40'
              }`}>
              {opt || t('adminDashboard.filterAll')}
            </button>
          ))}
        </div>
      </div>

      {isError && (
        <p className='text-sm text-destructive px-1'>
          {t('adminDashboard.usersLoadError')}
        </p>
      )}

      <div className='rounded-2xl border border-border bg-[var(--pl-bg)] overflow-hidden'>
        {isLoading ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>
            {t('onboarding.loading')}
          </div>
        ) : rows.length === 0 ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>
            {t('adminDashboard.emptyUsers')}
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow className='border-border'>
                  <TableHead className='whitespace-nowrap text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colId')}
                  </TableHead>
                  <TableHead className='text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colName')}
                  </TableHead>
                  <TableHead className='min-w-[180px] text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colEmail')}
                  </TableHead>
                  <TableHead className='hidden lg:table-cell text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colRoles')}
                  </TableHead>
                  <TableHead className='hidden md:table-cell text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colLanguage')}
                  </TableHead>
                  <TableHead className='hidden xl:table-cell text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colEducation')}
                  </TableHead>
                  <TableHead className='hidden xl:table-cell text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colHearAppFrom')}
                  </TableHead>
                  <TableHead className='hidden md:table-cell text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colAccountType')}
                  </TableHead>
                  <TableHead className='hidden lg:table-cell whitespace-nowrap text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colOnboardingAt')}
                  </TableHead>
                  <TableHead className='w-[100px] text-right text-[11px] tracking-[0.12em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                    {t('adminDashboard.colActions')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const u = row.user;
                  const submitted = formatDate(row.onboardingSubmittedAt) ?? na;
                  return (
                    <TableRow key={u.id} className='border-border hover:bg-muted/30 transition-colors'>
                      <TableCell className='font-[family-name:var(--font-mono-pl)] text-sm text-muted-foreground'>
                        {u.id}
                      </TableCell>
                      <TableCell className='text-sm font-medium'>
                        <div className='flex items-center gap-2'>
                          {u.avatarUrl ? (
                            <img
                              src={u.avatarUrl}
                              alt=''
                              className='w-6 h-6 rounded-full object-cover shrink-0'
                            />
                          ) : (
                            <div className='w-6 h-6 rounded-full bg-[var(--pl-accent-soft)] grid place-items-center text-[10px] font-bold text-[var(--pl-accent-strong)] shrink-0'>
                              {[u.firstName?.[0], u.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U'}
                            </div>
                          )}
                          <span>{u.firstName} {u.lastName}</span>
                          {u.isBlocked && (
                            <span className='text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 font-medium'>
                              {t('adminDashboard.blocked')}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className='text-sm text-muted-foreground'>
                        {u.email}
                      </TableCell>
                      <TableCell className='hidden lg:table-cell text-xs text-muted-foreground max-w-[140px] truncate'>
                        {u.roles.join(', ')}
                      </TableCell>
                      <TableCell className='hidden md:table-cell text-sm'>
                        {displayOrDash(u.language)}
                      </TableCell>
                      <TableCell className='hidden xl:table-cell text-sm'>
                        {displayOrDash(u.education)}
                      </TableCell>
                      <TableCell className='hidden xl:table-cell text-sm'>
                        {displayOrDash(u.hearAppFrom)}
                      </TableCell>
                      <TableCell className='hidden md:table-cell'>
                        {u.accountType ? (
                          <span
                            className={`inline-flex text-[11px] px-2 py-0.5 rounded-full border ${
                              u.accountType === 'PRO'
                                ? 'border-purple-500/30 bg-purple-500/10 text-purple-500'
                                : 'border-border bg-muted/50 text-muted-foreground'
                            }`}
                          >
                            {u.accountType}
                          </span>
                        ) : (
                          <span className='text-sm text-muted-foreground'>{na}</span>
                        )}
                      </TableCell>
                      <TableCell className='hidden lg:table-cell text-xs whitespace-nowrap text-muted-foreground'>
                        {submitted}
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-1'>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => onViewDetail(row)}
                            aria-label={t('adminDashboard.viewDetail')}
                            title={t('adminDashboard.viewDetail')}
                          >
                            <UserRound className='w-3.5 h-3.5' />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8'
                            onClick={() => onEdit(row)}
                            aria-label={t('adminDashboard.editUser')}
                          >
                            <Pencil className='w-3.5 h-3.5' />
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className={`h-8 w-8 ${u.isBlocked ? 'text-green-600 hover:text-green-600' : 'text-amber-500 hover:text-amber-500'}`}
                            onClick={() =>
                              onBlock(
                                u.id,
                                `${u.firstName} ${u.lastName}`.trim(),
                                u.isBlocked,
                              )
                            }
                            aria-label={u.isBlocked ? t('adminDashboard.unblockUser') : t('adminDashboard.blockUser')}
                            title={u.isBlocked ? t('adminDashboard.unblockUser') : t('adminDashboard.blockUser')}
                          >
                            {u.isBlocked
                              ? <ShieldCheck className='w-3.5 h-3.5' />
                              : <ShieldOff className='w-3.5 h-3.5' />
                            }
                          </Button>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            className='h-8 w-8 text-destructive hover:text-destructive'
                            onClick={() =>
                              onDelete(
                                u.id,
                                `${u.firstName} ${u.lastName}`.trim(),
                              )
                            }
                            aria-label={t('adminDashboard.deleteUser')}
                          >
                            <Trash2 className='w-3.5 h-3.5' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className='flex items-center justify-between'>
        <p className='text-xs text-muted-foreground'>
          {t('adminDashboard.colId')} · page {page + 1}
        </p>
        <div className='flex gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={page <= 0 || isFetching}
            onClick={onPrevPage}
            className='gap-1.5'
          >
            <ChevronLeft className='w-3.5 h-3.5' />
            {t('adminDashboard.prevPage')}
          </Button>
          <Button
            variant='outline'
            size='sm'
            disabled={rows.length < PAGE_SIZE || isFetching}
            onClick={onNextPage}
            className='gap-1.5'
          >
            {t('adminDashboard.nextPage')}
            <ChevronRight className='w-3.5 h-3.5' />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UsersSection;
