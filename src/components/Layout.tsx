import React, { useEffect } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "./sidebar/app-sidebar.tsx";
import { authAPI } from "@/services/endpoints/auth";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      authAPI.getMe().catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login";
      });
    }
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className='flex-1 flex flex-col'>
          <div className='flex-1 overflow-auto p-4'>{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Layout;
