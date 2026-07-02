import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '@/lib/apiError';
import { Check, FileText } from 'lucide-react';
import {
  appealsAPI,
  type AppealDto,
  type AppealStatus,
} from '@/services/endpoints/appeals';
import {
  adminUsersAPI,
  extractAdminUsersList,
} from '@/services/endpoints/adminUsers';
import type { AdminUserDirectoryRow } from '@/services/types/adminUsers.types';
import AdminTopBar from '../TopBar';
import Avatar from './Avatar';
import StatusBadge from './StatusBadge';
import AppealDetail from './AppealDetail';
import BlockDetail from './BlockDetail';
import type { Tab, ListItem } from '../../types';

const AppealsBlocksSection = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>('queue');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reviewingId, setReviewingId] = useState<number | null>(null);

  const appealsQuery = useQuery({
    queryKey: ['admin', 'appeals', 'all-inbox'],
    queryFn: async () => {
      const res = await appealsAPI.adminList({ page: 0, size: 100 });
      const raw = res.data.data;
      return Array.isArray(raw)
        ? (raw as AppealDto[])
        : ((raw as { content?: AppealDto[] }).content ?? []);
    },
  });

  const blockedQuery = useQuery({
    queryKey: ['admin', 'users', 'blocked'],
    queryFn: async () => {
      const res = await adminUsersAPI.listBlocked({ page: 0, size: 100 });
      return extractAdminUsersList(res.data.data);
    },
  });

  const reviewMutation = useMutation({
    mutationFn: ({
      appealId,
      status,
    }: {
      appealId: number;
      status: AppealStatus;
    }) => appealsAPI.adminReview(appealId, { status }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'appeals'] });
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      setReviewingId(null);
      toast.success(t('adminDashboard.appealReviewed'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.appealReviewError'))),
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: number) => adminUsersAPI.unblockUser(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('adminDashboard.userUnblocked'));
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, t('adminDashboard.unblockError'))),
  });

  const appeals = appealsQuery.data ?? [];
  const blocked = blockedQuery.data ?? [];

  const queue = appeals.filter((a) => a.status === 'PENDING');
  const history = appeals.filter((a) => a.status !== 'PENDING');

  const toListItem = (a: AppealDto): ListItem => ({
    id: `appeal-${a.id}`,
    name: a.email.split('@')[0],
    email: a.email,
    userId: a.userId ?? undefined,
    reason: a.reason,
    date: new Date(a.createdAt).toLocaleDateString(),
    appealDate: new Date(a.createdAt).toLocaleDateString(),
    status: a.status,
    raw: a,
    kind: 'appeal',
  });

  const toBlockItem = (row: AdminUserDirectoryRow): ListItem => {
    const u = row.user;
    return {
      id: `block-${u.id}`,
      name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
      email: u.email,
      userId: u.id,
      reason: u.blockReason ?? t('adminDashboard.blocked'),
      date: '',
      raw: row,
      kind: 'block',
    };
  };

  const list: ListItem[] =
    tab === 'queue'
      ? queue.map(toListItem)
      : tab === 'history'
        ? history.map(toListItem)
        : blocked.map(toBlockItem);

  useEffect(() => {
    if (
      list.length > 0 &&
      (!selectedId || !list.find((x) => x.id === selectedId))
    ) {
      setSelectedId(list[0].id);
    }
  }, [tab, list, selectedId]);

  const current = list.find((x) => x.id === selectedId) ?? list[0] ?? null;

  const tabs: { id: Tab; label: string; count: number; urgent?: boolean }[] = [
    {
      id: 'queue',
      label: t('adminDashboard.appealQueue'),
      count: queue.length,
      urgent: true,
    },
    {
      id: 'blocks',
      label: t('adminDashboard.blockList'),
      count: blocked.length,
    },
    {
      id: 'history',
      label: t('adminDashboard.history'),
      count: history.length,
    },
  ];

  return (
    <div className='flex-1 min-w-0 flex flex-col min-h-0'>
      <AdminTopBar
        kicker={`${queue.length} ${t('adminDashboard.appealsKicker')} · ${blocked.length} ${t('adminDashboard.blocked').toLowerCase()}`}
        title={t('adminDashboard.sidebarAppeals')}
        subtitle={t('adminDashboard.appealsSubtitle')}
      />

      <div className='flex gap-1 px-6 md:px-10 pt-3.5 border-b border-border'>
        {tabs.map((tb) => {
          const active = tab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => {
                setTab(tb.id);
                setSelectedId(null);
              }}
              className={`px-[18px] py-2.5 text-[13px] -mb-px inline-flex items-center gap-2 transition-colors ${
                active
                  ? 'text-foreground font-medium border-b-2 border-[var(--pl-accent)]'
                  : 'text-muted-foreground border-b-2 border-transparent'
              }`}
            >
              {tb.label}
              <span
                className={`font-[family-name:var(--font-mono-pl)] text-[10.5px] px-[7px] py-[2px] rounded-full ${
                  tb.urgent && tb.count > 0
                    ? 'bg-[var(--pl-danger-soft)] text-[var(--pl-danger)]'
                    : 'bg-[var(--pl-bg-hover)] text-muted-foreground'
                }`}
              >
                {tb.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className='flex-1 min-h-0 grid grid-cols-[360px_1fr]'>
        {/* List */}
        <div className='border-r border-border overflow-auto bg-[var(--pl-bg-sunken)]'>
          {list.length === 0 ? (
            <div className='p-10 text-center text-muted-foreground'>
              <Check className='w-5 h-5 mx-auto mb-2.5 text-[var(--pl-success)]' />
              <div className='text-[13px]'>
                {tab === 'blocks'
                  ? t('adminDashboard.blockedEmpty')
                  : t('adminDashboard.appealsEmpty')}
              </div>
            </div>
          ) : (
            list.map((item) => {
              const isSel = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full p-[14px_18px] text-left border-b border-border flex flex-col gap-1.5 transition-colors ${
                    isSel
                      ? 'bg-[var(--pl-bg-elev)] border-l-2 border-l-[var(--pl-accent)]'
                      : 'border-l-2 border-l-transparent hover:bg-[var(--pl-bg-hover)]'
                  }`}
                >
                  <div className='flex items-center gap-2.5'>
                    <Avatar name={item.name} size={28} />
                    <div className='flex-1 min-w-0'>
                      <div className='text-[13px] font-medium truncate'>
                        {item.name}
                      </div>
                      <div className='text-[10.5px] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
                        {item.userId ? `#${item.userId}` : item.email}
                      </div>
                    </div>
                    {item.status && <StatusBadge status={item.status} small />}
                  </div>
                  <div className='text-xs text-muted-foreground line-clamp-2'>
                    {item.reason}
                  </div>
                  <div className='text-[10.5px] text-muted-foreground font-[family-name:var(--font-mono-pl)] flex justify-between'>
                    {item.date && <span>{item.date}</span>}
                    {item.appealDate && <span>appeal · {item.appealDate}</span>}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Detail */}
        <div className='overflow-auto p-6 md:px-10 md:py-6'>
          {!current ? (
            <div className='text-center text-muted-foreground mt-20'>
              <FileText className='w-7 h-7 mx-auto mb-3 opacity-40' />
              <div className='text-sm'>Select an item from the list.</div>
            </div>
          ) : current.kind === 'appeal' ? (
            <AppealDetail
              appeal={current.raw as AppealDto}
              isReviewing={
                reviewMutation.isPending &&
                reviewingId === (current.raw as AppealDto).id
              }
              onAccept={() => {
                const a = current.raw as AppealDto;
                setReviewingId(a.id);
                reviewMutation.mutate({ appealId: a.id, status: 'ACCEPTED' });
              }}
              onReject={() => {
                const a = current.raw as AppealDto;
                setReviewingId(a.id);
                reviewMutation.mutate({ appealId: a.id, status: 'REJECTED' });
              }}
            />
          ) : (
            <BlockDetail
              row={current.raw as AdminUserDirectoryRow}
              isUnblocking={unblockMutation.isPending}
              onUnblock={() => {
                const u = (current.raw as AdminUserDirectoryRow).user;
                unblockMutation.mutate(u.id);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AppealsBlocksSection;
