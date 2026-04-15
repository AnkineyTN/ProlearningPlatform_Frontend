import React from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  LayoutList,
  CheckCheck,
  Hourglass,
  LogOut,
  User,
  ChevronUp,
  Book,
  Heart,
  Settings,
  Inbox,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/store/authSlice.ts";
import { useNavigate } from "react-router-dom";
import LogoFG from "@/assets/logo_fg";
import { useTranslation } from "react-i18next";
import { useReviewBundles } from "@/hooks/useReviewBundles";

const AppSidebar = ({ ...props }: React.ComponentProps<typeof Sidebar>) => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: reviewBundlesData } = useReviewBundles();
  const bundleCount = reviewBundlesData?.data?.length ?? 0;

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };
  const menuItems = [
    {
      title: t("sidebar.dashboard"),
      icon: LayoutDashboard,
      url: "/dashboard",
    },
    {
      title: t("sidebar.setList"),
      icon: LayoutList,
      url: "/sets",
    },
    {
      title: t("sidebar.todo"),
      icon: CheckCheck,
      url: "/todo",
    },
    {
      title: t("sidebar.pomodoro"),
      icon: Hourglass,
      url: "/pomodoro",
    },
    {
      title: t("sidebar.blog"),
      icon: Book,
      url: "/blog",
    },
    {
      title: t("sidebar.socials"),
      icon: Heart,
      url: "/socials",
    },
    {
      title: t("sidebar.settings"),
      icon: Settings,
      url: "/settings",
    },
  ];

  const reviewBundlesItem = {
    title: "Review Bundles",
    icon: Inbox,
    url: "/review-bundles",
    badge: bundleCount > 0 ? bundleCount : undefined,
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SidebarMenu className='border-b border-sidebar-border py-2'>
          <SidebarMenuItem className='flex items-center'>
            <SidebarMenuButton size='lg' asChild>
              <a href='/dashboard'>
                <div className='flex size-6 items-center justify-center rounded-lg text-sidebar-primary-foreground'>
                  <LogoFG />
                </div>
                <span className='font-semibold text-lg ml-1'>ProLearning</span>
              </a>
            </SidebarMenuButton>
            <SidebarTrigger size='lg' />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon className='size-4' />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            {/* Review Bundles — action-required item */}
            <SidebarMenuItem key={reviewBundlesItem.title}>
              <SidebarMenuButton asChild>
                <a href={reviewBundlesItem.url} className='relative flex items-center gap-2'>
                  <reviewBundlesItem.icon className='size-4' />
                  <span>{reviewBundlesItem.title}</span>
                  {reviewBundlesItem.badge !== undefined && (
                    <span className='ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full bg-pink-500 px-1.5 text-[10px] font-bold text-white'>
                      {reviewBundlesItem.badge}
                    </span>
                  )}
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size='lg'
                  className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
                >
                  <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white'>
                    <User className='size-4' />
                  </div>
                  <div className='grid flex-1 text-left text-sm leading-tight'>
                    <span className='truncate font-semibold'>
                      {user?.firstName || "Unknown User"} {user?.lastName || ""}
                    </span>
                    <span className='truncate text-xs text-sidebar-foreground/70'>
                      {user?.email || "no-email@example.com"}
                    </span>
                  </div>
                  <ChevronUp className='ml-auto size-4' />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
                side='bottom'
                align='end'
                sideOffset={4}
              >
                <DropdownMenuItem
                  className='cursor-pointer hover:bg-card-secondary'
                  onClick={handleProfile}
                >
                  <User className='mr-2 size-4' />
                  <span>{t("sidebar.profile")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer hover:bg-card-secondary'>
                  <Settings className='mr-2 size-4' />
                  <span>{t("sidebar.settings")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='cursor-pointer hover:bg-card-secondary'
                  onClick={handleLogout}
                >
                  <LogOut className='mr-2 size-4' />
                  <span>{t("sidebar.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
