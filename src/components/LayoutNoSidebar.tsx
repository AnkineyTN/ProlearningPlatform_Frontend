import React, { useEffect } from 'react';
import { authAPI } from '@/services/endpoints/auth';

type Props = {
  children: React.ReactNode;
};

const LayoutNoSidebar = ({ children }: Props) => {
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
    <main className='flex-1 flex flex-col bg-card'>
      <div className='flex-1 overflow-auto'>{children}</div>
    </main>
  );
};

export default LayoutNoSidebar;
