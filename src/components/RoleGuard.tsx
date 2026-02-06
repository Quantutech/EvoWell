import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/App';
import { UserRole } from '@/types';

interface RoleGuardProps {
  allowedRole: UserRole;
  redirectPath: string;
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRole, redirectPath, children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role !== allowedRole) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
