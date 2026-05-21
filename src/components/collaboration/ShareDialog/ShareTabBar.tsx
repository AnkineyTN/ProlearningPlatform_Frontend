import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export type ShareTab = 'invite' | 'members';

const triggerCls =
  'flex-1 h-auto rounded-full px-3 py-1.5 text-sm font-medium border-0 bg-transparent shadow-none ' +
  'data-[state=active]:bg-[var(--pl-accent-border)] data-[state=active]:text-primary data-[state=active]:shadow-none ' +
  'data-[state=inactive]:text-muted-foreground hover:data-[state=inactive]:text-foreground';

export default function ShareTabBar() {
  return (
    <TabsList className='w-full h-auto gap-1 rounded-full bg-[var(--pl-bg-sunken)] p-1'>
      <TabsTrigger value='invite' className={triggerCls}>
        Invite
      </TabsTrigger>
      <TabsTrigger value='members' className={triggerCls}>
        Members
      </TabsTrigger>
    </TabsList>
  );
}
