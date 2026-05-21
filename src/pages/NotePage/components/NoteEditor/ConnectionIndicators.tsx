import { Wifi, WifiOff } from 'lucide-react';
import type { ConnectionStatus } from './types';

interface ConnectionIndicatorsProps {
  status: ConnectionStatus;
  collabActive: boolean;
  lastSavedAt: Date | null;
}

function formatSavedLabel(date: Date | null) {
  if (!date) return null;
  return `Auto-saved at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

export default function ConnectionIndicators({
  status,
  collabActive,
  lastSavedAt,
}: ConnectionIndicatorsProps) {
  const savedLabel = formatSavedLabel(lastSavedAt);

  if (collabActive && status === 'disconnected') {
    return (
      <div className='flex items-center gap-1.5 px-6 py-1.5 text-xs font-medium border-b border-[var(--bg-warning)] bg-[var(--bg-warning)] text-[var(--text-warning)]'>
        <WifiOff className='size-3.5' />
        Lost connection — reconnecting…
      </div>
    );
  }

  if (collabActive && status === 'connected') {
    return (
      <div className='flex items-center gap-3 px-6 py-1 text-[10px] tracking-[0.18em] uppercase text-[var(--pl-accent)]'>
        <span className='flex items-center gap-1.5'>
          <Wifi className='size-3' />
          Synced
        </span>
        {savedLabel && (
          <span className='text-[var(--pl-text-faint)]'>{savedLabel}</span>
        )}
      </div>
    );
  }

  if (!collabActive && savedLabel) {
    return (
      <div className='flex items-center gap-1.5 px-6 py-1 text-[10px] tracking-[0.18em] uppercase text-[var(--pl-text-faint)]'>
        {savedLabel}
      </div>
    );
  }

  return null;
}
