import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { X, FileText, Layers, ClipboardList, Timer, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adminUsersAPI } from '@/services/endpoints/adminUsers';
import type { AdminDirectoryUser } from '@/services/types/adminUsers.types';

type UserDetailSheetProps = {
  user: AdminDirectoryUser;
  onClose: () => void;
};

const StatCard = ({ icon: Icon, label, value, color }: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color: string;
}) => (
  <div className='rounded-xl border border-border bg-muted/20 p-4 flex items-center gap-3'>
    <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center shrink-0`}>
      <Icon className='w-4 h-4' />
    </div>
    <div>
      <p className='text-[11px] text-muted-foreground'>{label}</p>
      <p className='text-lg font-semibold leading-tight'>{value}</p>
    </div>
  </div>
);

const UserDetailSheet = ({ user, onClose }: UserDetailSheetProps) => {
  const { t, i18n } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'users', user.id, 'stats'],
    queryFn: async () => {
      const res = await adminUsersAPI.getUserStats(user.id);
      return res.data.data;
    },
  });

  const formatDate = (iso: string | null | undefined) => {
    if (!iso) return '—';
    try {
      const locale = i18n.language.startsWith('vi') ? 'vi-VN' : 'en-US';
      return new Date(iso).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return iso; }
  };

  return (
    <div className='fixed inset-0 z-50 flex justify-end'>
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />
      <div className='relative w-full max-w-sm bg-[var(--pl-bg)] border-l border-border h-full flex flex-col shadow-2xl'>
        <div className='flex items-center justify-between p-5 border-b border-border shrink-0'>
          <h2 className='font-semibold text-sm'>{t('adminDashboard.userDetailTitle')}</h2>
          <Button variant='ghost' size='icon' className='h-7 w-7' onClick={onClose}>
            <X className='w-4 h-4' />
          </Button>
        </div>

        <div className='flex-1 overflow-y-auto p-5 space-y-5'>
          <div className='flex items-center gap-3'>
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt='' className='w-12 h-12 rounded-full object-cover' />
            ) : (
              <div className='w-12 h-12 rounded-full bg-[var(--pl-accent-soft)] grid place-items-center text-sm font-bold text-[var(--pl-accent-strong)]'>
                {[user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <p className='font-semibold'>{user.firstName} {user.lastName}</p>
              <p className='text-xs text-muted-foreground'>{user.email}</p>
              <div className='flex gap-1.5 mt-1 flex-wrap'>
                {user.accountType && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    user.accountType === 'PRO'
                      ? 'border-purple-500/30 bg-purple-500/10 text-purple-500'
                      : 'border-border bg-muted/50 text-muted-foreground'
                  }`}>{user.accountType}</span>
                )}
                {user.isBlocked && (
                  <span className='text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30'>
                    {t('adminDashboard.blocked')}
                  </span>
                )}
                {user.roles.map(r => (
                  <span key={r} className='text-[10px] px-2 py-0.5 rounded-full border border-border bg-muted/30 text-muted-foreground'>{r}</span>
                ))}
              </div>
            </div>
          </div>

          <div className='space-y-1.5'>
            <p className='text-[11px] tracking-[0.15em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
              ACTIVITY STATS
            </p>
            {isLoading ? (
              <div className='text-sm text-muted-foreground py-4 text-center'>{t('onboarding.loading')}</div>
            ) : (
              <div className='grid grid-cols-2 gap-2'>
                <StatCard icon={FileText} label={t('adminDashboard.statNotes')} value={stats?.noteCount ?? 0} color='bg-blue-500/10 text-blue-500' />
                <StatCard icon={Layers} label={t('adminDashboard.statFlashcards')} value={stats?.flashcardCount ?? 0} color='bg-green-500/10 text-green-500' />
                <StatCard icon={ClipboardList} label={t('adminDashboard.statExams')} value={stats?.examCount ?? 0} color='bg-amber-500/10 text-amber-500' />
                <StatCard icon={Timer} label={t('adminDashboard.statPomodoro')} value={stats?.pomodoroSessionCount ?? 0} color='bg-red-500/10 text-red-500' />
              </div>
            )}
          </div>

          <div className='space-y-2 text-sm'>
            <p className='text-[11px] tracking-[0.15em] text-muted-foreground font-[family-name:var(--font-mono-pl)]'>
              ACCOUNT INFO
            </p>
            <div className='space-y-1.5'>
              {[
                { label: t('adminDashboard.colId'), value: `#${user.id}` },
                { label: t('adminDashboard.colLanguage'), value: user.language ?? '—' },
                { label: t('adminDashboard.colEducation'), value: user.education ?? '—' },
                { label: t('adminDashboard.colHearAppFrom'), value: user.hearAppFrom ?? '—' },
                { label: t('adminDashboard.detailRegistered'), value: formatDate(stats?.registeredAt) },
              ].map(({ label, value }) => (
                <div key={label} className='flex justify-between gap-2 text-xs'>
                  <span className='text-muted-foreground'>{label}</span>
                  <span className='font-medium text-right'>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {user.blockReason && (
            <div className='rounded-xl border border-red-500/30 bg-red-500/5 p-3 text-xs'>
              <p className='text-muted-foreground mb-1'>{t('adminDashboard.blockReason')}</p>
              <p className='text-red-500'>{user.blockReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailSheet;
