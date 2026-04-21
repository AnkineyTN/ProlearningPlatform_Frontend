import React, { useEffect } from 'react';
import AppSidebar from './sidebar/app-sidebar.tsx';
import { authAPI } from '@/services/endpoints/auth';

type Props = { children: React.ReactNode };

const Layout = ({ children }: Props) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe().catch(() => {
        localStorage.removeItem('token');
        window.location.href = '/login';
      });
    }
  }, []);

  return (
    <div className='flex min-h-screen bg-[var(--pl-bg)] transition-[background] duration-300'>
      <AppSidebar />
      <main className='flex-1 min-w-0 flex flex-col overflow-auto'>
        {children}
      </main>
    </div>
  );
};

export default Layout;
