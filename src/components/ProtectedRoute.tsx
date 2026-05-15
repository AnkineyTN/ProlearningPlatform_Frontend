import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: Props) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to='/' replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
