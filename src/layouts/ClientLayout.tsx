import React from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/App';
import ClientDashboardLayout from '@/components/dashboard/ClientDashboardLayout';
import { UserRole } from '@/types';

const ClientLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== UserRole.CLIENT) return <Navigate to="/console" replace />;

  // Extract active tab from URL: /portal/sessions -> sessions. Default to 'home'.
  const pathParts = location.pathname.split('/');
  // /portal -> parts=['', 'portal'] -> activeTab undefined -> 'home'
  // /portal/sessions -> parts=['', 'portal', 'sessions'] -> activeTab 'sessions'
  const activeTab = pathParts[2] || 'home';

  return (
    <ClientDashboardLayout
      user={user}
      activeTab={activeTab}
      onTabChange={(tab) => navigate(`/portal/${tab}`)}
    >
      <Outlet />
    </ClientDashboardLayout>
  );
};

export default ClientLayout;
