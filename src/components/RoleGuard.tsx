import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/App';
import { PermissionCode, UserRole } from '@/types';
import { useAccess } from '@/features/access';

interface RoleGuardProps {
  allowedRole?: UserRole | UserRole[];
  redirectPath: string;
  requiredPermission?: PermissionCode;
  requiredPermissions?: PermissionCode[];
  permissionMode?: 'all' | 'any';
  children: React.ReactNode;
}

const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRole,
  redirectPath,
  requiredPermission,
  requiredPermissions,
  permissionMode = 'all',
  children,
}) => {
  const { user, isLoading } = useAuth();
  const { permissions } = useAccess();

  if (isLoading) return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  const allowedRoles = Array.isArray(allowedRole)
    ? allowedRole
    : allowedRole
      ? [allowedRole]
      : [];
  const roleAllowed = allowedRoles.length === 0 || allowedRoles.includes(user.role);

  const required = requiredPermissions?.length
    ? requiredPermissions
    : requiredPermission
      ? [requiredPermission]
      : [];

  const permissionAllowed =
    required.length === 0
      ? true
      : permissionMode === 'any'
        ? required.some((code) => permissions.includes(code))
        : required.every((code) => permissions.includes(code));

  if (!roleAllowed || !permissionAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
