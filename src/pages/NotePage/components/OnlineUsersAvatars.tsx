import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface OnlineUsersAvatarsProps {
  users: { name: string; color: string }[];
}

export function OnlineUsersAvatars({ users }: OnlineUsersAvatarsProps) {
  if (users.length === 0) return null;

  return (
    <div className='flex items-center gap-1.5 mr-1'>
      <div className='flex items-center -space-x-1.5'>
        {users.slice(0, 8).map((u, i) => (
          <Avatar
            key={i}
            className='size-6 border-2 ring-2 ring-[var(--pl-bg)]'
            style={{ borderColor: u.color }}
          >
            <AvatarFallback
              className='text-[10px] font-medium'
              style={{ backgroundColor: u.color, color: '#fff' }}
            >
              {u.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      {users.length > 8 && (
        <span className='text-xs text-[var(--pl-text-muted)] font-[family-name:var(--font-mono-pl)]'>
          +{users.length - 8}
        </span>
      )}
    </div>
  );
}
