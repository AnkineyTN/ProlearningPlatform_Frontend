import React, { useEffect } from 'react';
import { authAPI } from "@/services/api.ts";

interface LayoutProps {
    children: React.ReactNode;
}

const LayoutNoSidebar: React.FC<LayoutProps> = ({ children }) => {
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
        <main className="flex-1 flex flex-col bg-card">
            <div className="flex-1 overflow-auto p-4">
                {children}
            </div>
        </main>
    );
};

export default LayoutNoSidebar;