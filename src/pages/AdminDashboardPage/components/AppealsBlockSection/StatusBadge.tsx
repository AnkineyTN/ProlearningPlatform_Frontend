import type { AppealStatus } from '@/services/endpoints/appeals';

const STATUS_MAP: Record<
  AppealStatus,
  { bg: string; fg: string; bd: string; label: string }
> = {
  PENDING: {
    bg: 'oklch(0.78 0.15 75 / 0.14)',
    fg: 'oklch(0.78 0.15 75)',
    bd: 'oklch(0.78 0.15 75 / 0.4)',
    label: 'Pending review',
  },
  ACCEPTED: {
    bg: 'oklch(0.72 0.15 155 / 0.15)',
    fg: 'oklch(0.72 0.15 155)',
    bd: 'oklch(0.72 0.15 155 / 0.35)',
    label: 'Approved',
  },
  REJECTED: {
    bg: 'oklch(0.65 0.2 25 / 0.14)',
    fg: 'oklch(0.65 0.2 25)',
    bd: 'oklch(0.65 0.2 25 / 0.4)',
    label: 'Rejected',
  },
};

type Props = { status: AppealStatus; small?: boolean };

const StatusBadge = ({ status, small }: Props) => {
  const c = STATUS_MAP[status];
  return (
    <span
      className='inline-flex items-center rounded-full font-[family-name:var(--font-mono-pl)] tracking-[0.04em]'
      style={{
        padding: small ? '1px 7px' : '3px 9px',
        fontSize: small ? 9 : 11,
        background: c.bg,
        color: c.fg,
        border: `1px solid ${c.bd}`,
      }}
    >
      {small ? status : c.label}
    </span>
  );
};

export default StatusBadge;
