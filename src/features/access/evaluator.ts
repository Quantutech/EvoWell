import { PermissionCode, PermissionOverride, StaffRole, User, UserRole } from '@/types';
import { ALL_PERMISSION_CODES, STAFF_ROLE_TEMPLATES } from './constants';

function baselineRolePermissions(userRole: UserRole): PermissionCode[] {
  if (userRole === UserRole.ADMIN) {
    return ['dashboard.overview.read'];
  }

  if (userRole === UserRole.PROVIDER) {
    return ['dashboard.overview.read', 'cms.posts.read', 'cms.posts.write', 'cms.posts.submit'];
  }

  return [];
}

export function derivePermissionsForUser(user: User | null | undefined): PermissionCode[] {
  if (!user) return [];

  // Backward-compatible default: legacy ADMIN accounts without staff metadata
  // keep full access until explicit staff role/overrides are assigned.
  if (
    user.role === UserRole.ADMIN &&
    !user.staffAccess?.staffRole &&
    (user.staffAccess?.permissions?.length || 0) === 0 &&
    (user.staffAccess?.overrides?.length || 0) === 0
  ) {
    return [...ALL_PERMISSION_CODES];
  }

  const base = new Set<PermissionCode>(baselineRolePermissions(user.role));

  if (user.role === UserRole.ADMIN) {
    const role = user.staffAccess?.staffRole as StaffRole | undefined;
    if (role && STAFF_ROLE_TEMPLATES[role]) {
      for (const permission of STAFF_ROLE_TEMPLATES[role].permissions) {
        base.add(permission);
      }
    }

    for (const permission of user.staffAccess?.permissions || []) {
      base.add(permission);
    }

    applyOverrides(base, user.staffAccess?.overrides || []);
  }

  return Array.from(base);
}

export function applyOverrides(base: Set<PermissionCode>, overrides: PermissionOverride[]) {
  for (const override of overrides) {
    if (override.allowed) {
      base.add(override.permissionCode);
      continue;
    }

    base.delete(override.permissionCode);
  }
}

export function hasPermission(
  permissions: PermissionCode[] | Set<PermissionCode>,
  permission: PermissionCode,
): boolean {
  if (permissions instanceof Set) return permissions.has(permission);
  return permissions.includes(permission);
}

export function isSuperAdmin(user: User | null | undefined): boolean {
  return user?.role === UserRole.ADMIN && user.staffAccess?.staffRole === 'SUPER_ADMIN';
}

export function resolveEffectivePermissionSet(user: User | null | undefined): Set<PermissionCode> {
  if (!user) return new Set();
  if (isSuperAdmin(user)) return new Set(ALL_PERMISSION_CODES);

  return new Set(derivePermissionsForUser(user));
}
