import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { User } from '@/hooks/useAuth';
import ProfileSection from './ProfileSection';

interface ProfileBillingProps {
  user: User | null | undefined;
}

export default function ProfileBilling({ user }: ProfileBillingProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const billingFeatures = [
    t('profile.billing.features.unlimited'),
    t('profile.billing.features.ai'),
    t('profile.billing.features.sr'),
    t('profile.billing.features.export'),
    t('profile.billing.features.support'),
  ];

  const accountType = user?.accountType ?? 'FREE';
  const isFree = accountType === 'FREE';

  return (
    <ProfileSection
      title={t('profile.billing.title')}
      sub={t('profile.billing.sub', { plan: accountType })}
    >
      <div className='rounded-[14px] mb-6 flex justify-between items-start p-6 bg-[linear-gradient(135deg,_var(--pl-accent-soft),_color-mix(in_oklch,_var(--pl-accent)_6%,_transparent))] border border-[var(--pl-accent-border)]'>
        <div>
          <div className='text-[11px] tracking-[0.18em] uppercase mb-2 text-[var(--pl-accent-strong)]'>
            {accountType} Plan
          </div>
          <div
            className='text-[44px] font-normal tracking-tight leading-none mb-1.5 text-[var(--pl-text)]'
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {isFree
              ? t('profile.billing.planFree')
              : t('profile.billing.planPro')}
          </div>
          <div className='text-[13px] text-[var(--pl-text-muted)]'>
            {isFree
              ? t('profile.billing.freeDesc')
              : t('profile.billing.proDesc')}
          </div>
        </div>
        {isFree && (
          <Button
            onClick={() => navigate('/upgrade')}
            className='rounded-full text-[12.5px] font-medium'
          >
            {t('profile.billing.upgrade')}
          </Button>
        )}
      </div>

      <ul className='m-0 p-0 list-none flex flex-col gap-2.5'>
        {billingFeatures.map((f) => (
          <li
            key={f}
            className='flex items-center gap-2.5 text-[14px] text-[var(--pl-text)]'
          >
            <Check
              className='w-3.5 h-3.5 shrink-0'
              style={{ color: 'oklch(0.72 0.15 155)' }}
              strokeWidth={2.4}
            />
            {f}
          </li>
        ))}
      </ul>
    </ProfileSection>
  );
}
