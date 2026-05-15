import { Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LayoutNoSidebar from './LayoutNoSidebar';

export default function ProtectedLayout() {
  return (
    <ProtectedRoute>
      <LayoutNoSidebar>
        <Outlet />
      </LayoutNoSidebar>
    </ProtectedRoute>
  );
}
