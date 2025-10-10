import React, { useEffect } from 'react';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from './sidebar/app-sidebar.tsx';
import { Separator } from "@/components/ui/separator"
import { authAPI } from "@/services/api.ts";
import { ModeToggle } from "@/components/theme/mode-toggle.tsx";
import { Bell, User } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    useEffect(() => {
        const token = localStorage.getItem('token')
        if (token) {
            authAPI.getMe().catch(() => {
                localStorage.removeItem('token')
                window.location.href = '/login'
            })
        }
    }, [])

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <main className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-auto p-4">
                        {children}
                    </div>
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Layout;