import { UserRole } from '@/types';

export type Permission = 
  | 'USERS_VIEW' | 'USERS_EDIT' | 'USERS_DELETE'
  | 'CONTENT_VIEW' | 'CONTENT_EDIT' | 'CONTENT_PUBLISH'
  | 'SYSTEM_SETTINGS' | 'AUDIT_LOGS' | 'SUPPORT_TICKETS';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    'USERS_VIEW', 'USERS_EDIT', 'USERS_DELETE',
    'CONTENT_VIEW', 'CONTENT_EDIT', 'CONTENT_PUBLISH',
    'SYSTEM_SETTINGS', 'AUDIT_LOGS', 'SUPPORT_TICKETS'
  ],
  [UserRole.PROVIDER]: [
    'CONTENT_VIEW', 'CONTENT_EDIT', 'SUPPORT_TICKETS'
  ],
  [UserRole.CLIENT]: [],
};

export const hasPermission = (userRole: UserRole, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};
