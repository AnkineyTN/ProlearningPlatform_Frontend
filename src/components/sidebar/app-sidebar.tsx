import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  LayoutList,
  CheckCheck,
  Hourglass,
  Inbox,
  LogOut,
  User,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Bell,
  Map as MapIcon,
  Library,
  Globe,
  Menu,
  X,
} from 'lucide-react';

import { useAuth, useLogout } from '@/hooks/useAuth';
import { useReviewBundles } from '@/hooks/useReviewBundles';
import { useUnreadNotificationCount } from '@/hooks/useNotifications';
import { useIsMobile } from '@/hooks/use-mobile';
import ColorThemeSwitcher from '@/components/theme/color-theme-switcher';
import ModeToggle from '@/components/theme/mode-toggle';
import LanguageToggle from '@/components/language/language-toggle';
import NotificationDrawer from '@/components/notifications/NotificationDrawer';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'pl-sidebar-collapsed';

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(STORAGE_KEY) === 'true',
  );
  const [notifOpen, setNotifOpen] = useState(false);
  const isMobile = useIsMobile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const effectiveCollapsed = isMobile ? false : collapsed;

  const toggle = () => {
    setCollapsed((v) => {
      localStorage.setItem(STORAGE_KEY, String(!v));
      return !v;
    });
  };

  const closeMobile = () => {
    if (isMobile) setMobileOpen(false);
  };

  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { data: reviewBundlesData } = useReviewBundles();
  const bundleCount = reviewBundlesData?.data?.length ?? 0;
  const { data: unreadCount = 0 } = useUnreadNotificationCount();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  type MenuItem = {
    title: string;
    icon: typeof LayoutDashboard;
    url?: string;
    onClick?: () => void;
    badge?: number | string;
  };

  const menuItems: MenuItem[] = [
    { title: t('sidebar.dashboard'), icon: LayoutDashboard, url: '/dashboard' },
    { title: t('sidebar.setList'), icon: LayoutList, url: '/sets' },
    { title: t('sidebar.roadmaps'), icon: MapIcon, url: '/roadmaps' },
    { title: t('sidebar.todo'), icon: CheckCheck, url: '/todo' },
    { title: t('sidebar.pomodoro'), icon: Hourglass, url: '/pomodoro' },
    {
      title: t('sidebar.review.bundles'),
      icon: Inbox,
      url: '/review-bundles',
      badge: bundleCount > 0 ? bundleCount : undefined,
    },
    { title: t('sidebar.collection'), icon: Library, url: '/collection' },
    {
      title: t('sidebar.notifications'),
      icon: Bell,
      onClick: () => setNotifOpen(true),
      badge:
        unreadCount > 0 ? (unreadCount > 99 ? '99+' : unreadCount) : undefined,
    },
    {
      title: t('sidebar.socials'),
      icon: Globe,
      url: '/social',
    },
  ];

  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || 'U';

  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    'Unknown User';

  const sidebarBody = (
    <>
      {/* ── Logo ── */}
      <div
        className={cn(
          'h-[68px] flex items-center border-b border-b-[var(--pl-border)] shrink-0',
          effectiveCollapsed ? 'justify-center px-0' : 'justify-between px-4',
        )}
      >
        {effectiveCollapsed ? (
          <button
            onClick={toggle}
            title='Expand sidebar'
            className='w-[34px] h-[34px] rounded-[9px] bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] grid place-items-center font-bold text-[16px] border-0 cursor-pointer'
          >
            <PanelLeftOpen size={16} />
          </button>
        ) : (
          <>
            <Link
              to='/dashboard'
              onClick={closeMobile}
              className='flex items-center gap-[10px] no-underline'
            >
              <div className='w-8 h-8 rounded-[9px] bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] grid place-items-center font-bold text-[18px] tracking-[-0.02em] shrink-0'>
                P
              </div>
              <div>
                <div className='text-[15px] font-bold tracking-[-0.02em] leading-none text-[var(--pl-text)] whitespace-nowrap'>
                  ProLearning
                </div>
                <div className='text-[9px] text-[var(--pl-text-faint)] tracking-[0.14em] uppercase mt-0.5'>
                  Platform
                </div>
              </div>
            </Link>
            <button
              onClick={isMobile ? closeMobile : toggle}
              title={isMobile ? 'Close menu' : 'Collapse sidebar'}
              className='text-[var(--pl-text-faint)] bg-transparent border-0 cursor-pointer grid place-items-center rounded-[6px] p-1 hover:text-[var(--pl-text)]'
            >
              {isMobile ? <X size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </>
        )}
      </div>

      {/* ── Nav ── */}
      <nav
        className={cn(
          'flex-1 flex flex-col gap-0.5 overflow-y-auto',
          effectiveCollapsed ? 'px-2 py-[10px]' : 'px-[10px] py-[6px]',
        )}
      >
        {menuItems.map((item) => {
          const active = item.url
            ? item.url === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.url)
            : false;

          const className = cn(
            'flex items-center rounded-[7px] text-[13px] no-underline transition-[background,color] duration-150 relative w-full bg-transparent border-0 cursor-pointer',
            effectiveCollapsed
              ? 'justify-center gap-0 py-[10px] px-0'
              : 'justify-start gap-[11px] px-[10px] py-2',
            active
              ? 'text-[var(--pl-accent-strong)] bg-[var(--pl-accent-soft)] font-semibold'
              : 'text-[var(--pl-text-muted)] font-normal hover:bg-[var(--pl-bg-hover)]',
          );

          const inner = (
            <>
              <item.icon size={16} className='shrink-0' />
              {!effectiveCollapsed && (
                <span className='flex-1 text-left'>{item.title}</span>
              )}
              {!effectiveCollapsed && item.badge !== undefined && (
                <span className='text-[10px] font-bold min-w-[18px] h-[18px] rounded-full bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] flex items-center justify-center px-[5px] shrink-0'>
                  {item.badge}
                </span>
              )}
              {effectiveCollapsed && item.badge !== undefined && (
                <span className='absolute top-1 right-1 w-2 h-2 rounded-full bg-[var(--pl-accent)]' />
              )}
            </>
          );

          if (item.onClick) {
            return (
              <button
                key={item.title}
                type='button'
                onClick={() => {
                  item.onClick?.();
                  closeMobile();
                }}
                title={effectiveCollapsed ? item.title : undefined}
                className={className}
              >
                {inner}
              </button>
            );
          }

          return (
            <Link
              key={item.url}
              to={item.url!}
              onClick={closeMobile}
              title={effectiveCollapsed ? item.title : undefined}
              className={className}
            >
              {inner}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className='border-t border-t-[var(--pl-border)] shrink-0'>
        {/* Theme controls */}
        <div
          className={cn(
            'flex items-center gap-2',
            effectiveCollapsed
              ? 'justify-center py-[10px] px-0 flex-col transition-all duration-300'
              : 'justify-between py-[10px] px-[14px]',
          )}
        >
          <ColorThemeSwitcher collapsed={effectiveCollapsed} />
          <div className={cn('flex gap-2', effectiveCollapsed ? 'flex-col' : '')}>
            <ModeToggle />
            <LanguageToggle />
          </div>
        </div>

        {/* User card */}
        <div className='border-t border-t-[var(--pl-border)]'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'w-full flex items-center bg-transparent border-0 cursor-pointer transition-[background] duration-150 hover:bg-[var(--pl-bg-hover)]',
                  effectiveCollapsed
                    ? 'justify-center gap-0 py-3 px-0'
                    : 'justify-start gap-[10px] py-[10px] px-[14px]',
                )}
              >
                {/* Avatar */}
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt=''
                    className='w-8 h-8 rounded-[9px] shrink-0 object-cover'
                  />
                ) : (
                  <div
                    className='w-8 h-8 rounded-[9px] shrink-0 grid place-items-center text-white text-[12px] font-bold'
                    style={{
                      background:
                        'linear-gradient(135deg, var(--pl-accent), oklch(var(--pl-accent-l) calc(var(--pl-accent-c) * 0.8) calc(var(--pl-accent-h) + 40)))',
                    }}
                  >
                    {initials}
                  </div>
                )}

                {!effectiveCollapsed && (
                  <>
                    <div className='flex-1 min-w-0 text-left'>
                      <div className='text-[12.5px] font-semibold text-[var(--pl-text)] overflow-hidden text-ellipsis whitespace-nowrap'>
                        {fullName}
                      </div>
                      <div className='text-[10.5px] text-[var(--pl-text-faint)] overflow-hidden text-ellipsis whitespace-nowrap'>
                        {user?.email || '—'}
                      </div>
                    </div>
                    <ChevronRight
                      size={13}
                      className='text-[var(--pl-text-faint)] shrink-0'
                    />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side='right'
              align='end'
              sideOffset={8}
              className='w-full bg-[var(--pl-bg)] mb-2 border border-[var(--pl-border)] rounded-[10px]'
            >
              {[
                {
                  label: t('sidebar.profile'),
                  icon: User,
                  onClick: () => navigate('/profile'),
                  danger: false,
                },
                {
                  label: t('sidebar.logout'),
                  icon: LogOut,
                  onClick: handleLogout,
                  danger: true,
                },
              ].map(({ label, icon: Icon, onClick, danger }) => (
                <DropdownMenuItem
                  key={label}
                  onClick={() => {
                    onClick();
                    closeMobile();
                  }}
                  className={cn(
                    'flex items-center gap-2 px-[10px] py-2 cursor-pointer ',
                    danger
                      ? 'text-[oklch(0.65_0.2_25)] focus:text-destructive'
                      : 'text-[var(--pl-text)]',
                  )}
                >
                  <Icon
                    size={14}
                    className={
                      danger
                        ? 'text-destructive focus:text-destructive'
                        : 'text-[var(--pl-text)]'
                    }
                  />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {/* ── Mobile top bar ── */}
        <div className='md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 border-b border-[var(--pl-border)] bg-[var(--pl-bg-sunken)] shrink-0'>
          <button
            onClick={() => setMobileOpen(true)}
            aria-label='Open menu'
            className='text-[var(--pl-text-muted)] bg-transparent border-0 cursor-pointer grid place-items-center rounded-[6px] p-1 hover:text-[var(--pl-text)]'
          >
            <Menu size={20} />
          </button>
          <Link to='/dashboard' className='flex items-center gap-2 no-underline'>
            <div className='w-7 h-7 rounded-[8px] bg-[var(--pl-accent)] text-[var(--pl-accent-fg)] grid place-items-center font-bold text-[14px] shrink-0'>
              P
            </div>
            <span className='text-[14px] font-bold text-[var(--pl-text)]'>
              ProLearning
            </span>
          </Link>
        </div>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side='left'
            className='p-0 w-[260px] max-w-[80vw] [&>button]:hidden bg-[var(--pl-bg-sunken)] border-r border-[var(--pl-border)] flex flex-col gap-0'
          >
            <SheetHeader className='sr-only'>
              <SheetTitle>ProLearning</SheetTitle>
              <SheetDescription>Navigation menu</SheetDescription>
            </SheetHeader>
            {sidebarBody}
          </SheetContent>
        </Sheet>

        <NotificationDrawer open={notifOpen} onOpenChange={setNotifOpen} />
      </>
    );
  }

  return (
    <aside
      className='hidden md:flex bg-[var(--pl-bg-sunken)] border-r border-r-[var(--pl-border)] flex-col h-screen sticky top-0 shrink-0 z-20 overflow-hidden transition-[width] duration-[280ms] ease-[cubic-bezier(0.4,0,0.2,1)]'
      style={{ width: collapsed ? 68 : 232 }}
    >
      {sidebarBody}
      <NotificationDrawer open={notifOpen} onOpenChange={setNotifOpen} />
    </aside>
  );
};

export default AppSidebar;
