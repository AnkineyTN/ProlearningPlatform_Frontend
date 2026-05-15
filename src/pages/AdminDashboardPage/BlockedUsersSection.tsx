import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { ShieldCheck, ShieldOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  adminUsersAPI,
  extractAdminUsersList,
} from '@/services/endpoints/adminUsers';

const BlockedUsersSection = () => {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'users', 'blocked'],
    queryFn: async () => {
      const res = await adminUsersAPI.listBlocked({ page: 0, size: 100 });
      return extractAdminUsersList(res.data.data);
    },
  });

  const unblockMutation = useMutation({
    mutationFn: (userId: number) => adminUsersAPI.unblockUser(userId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(t('adminDashboard.userUnblocked'));
    },
    onError: () => toast.error(t('adminDashboard.unblockError')),
  });

  return (
    <section className='space-y-3'>
      <div className='flex items-center gap-3'>
        <div className='w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center'>
          <ShieldOff className='w-4 h-4 text-red-500' />
        </div>
        <div>
          <p className='text-[11px] tracking-[0.2em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
            MANAGEMENT
          </p>
          <h2 className='font-semibold leading-tight'>
            {t('adminDashboard.blockedTitle')}
          </h2>
        </div>
      </div>

      <div className='rounded-2xl border border-border bg-[var(--pl-bg)] overflow-hidden'>
        {isLoading ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>
            {t('onboarding.loading')}
          </div>
        ) : isError ? (
          <div className='p-16 text-center text-destructive text-sm'>
            {t('adminDashboard.usersLoadError')}
          </div>
        ) : !data || data.length === 0 ? (
          <div className='p-16 text-center text-muted-foreground text-sm'>
            {t('adminDashboard.blockedEmpty')}
          </div>
        ) : (
          <div className='divide-y divide-border'>
            {data.map(({ user }) => (
              <div
                key={user.id}
                className='p-4 flex items-center gap-3 hover:bg-[var(--pl-bg-hover)] transition-colors'
              >
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=''
                    className='w-8 h-8 rounded-full object-cover shrink-0'
                  />
                ) : (
                  <div className='w-8 h-8 rounded-full bg-[var(--pl-accent-soft)] grid place-items-center text-[11px] font-bold text-[var(--pl-accent-strong)] shrink-0'>
                    {[user.firstName?.[0], user.lastName?.[0]]
                      .filter(Boolean)
                      .join('')
                      .toUpperCase() || 'U'}
                  </div>
                )}

                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium truncate'>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className='text-xs text-muted-foreground truncate'>
                    {user.email}
                  </p>
                  {user.blockReason && (
                    <p className='text-xs text-muted-foreground/70 italic mt-0.5 truncate'>
                      {t('adminDashboard.blockReason')}: {user.blockReason}
                    </p>
                  )}
                </div>

                <span className='text-[11px] font-[family-name:var(--font-mono-pl)] text-muted-foreground hidden sm:block shrink-0'>
                  #{user.id}
                </span>

                <Button
                  size='sm'
                  variant='outline'
                  className='gap-1.5 text-green-600 border-green-500/40 hover:bg-green-500/10 shrink-0'
                  disabled={unblockMutation.isPending}
                  onClick={() => unblockMutation.mutate(user.id)}
                >
                  <ShieldCheck className='w-3.5 h-3.5' />
                  {t('adminDashboard.unblockUser')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlockedUsersSection;
