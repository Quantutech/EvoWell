import { persistence } from './persistence';
import { supabase, isConfigured } from './supabase';
import { mockStore } from './mockStore';
import {
  PermissionCode,
  PermissionOverride,
  RoleTemplate,
  StaffAccessProfile,
  StaffRole,
  User,
  UserRole,
  UserRoleAssignment,
} from '@/types';
import { ALL_PERMISSION_CODES, listRoleTemplates, STAFF_ROLE_TEMPLATES } from '@/features/access';
import { derivePermissionsForUser } from '@/features/access/evaluator';

function resolveMockUser(userId: string): User | null {
  const user = mockStore.store.users.find((item) => item.id === userId);
  if (user) return user;
  return null;
}

function resolveCurrentUserId(): string | null {
  const { userId } = persistence.getSession();
  return userId;
}

function updateUserStaffAccess(userId: string) {
  const userIndex = mockStore.store.users.findIndex((user) => user.id === userId);
  if (userIndex === -1) return;

  const roleAssignment = mockStore.store.userRoleAssignments
    .filter((item) => item.userId === userId)
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())[0];

  const overrides = mockStore.store.userPermissionOverrides.filter((item) => item.userId === userId);

  const templatePermissions = roleAssignment
    ? STAFF_ROLE_TEMPLATES[roleAssignment.role]?.permissions || []
    : [];

  mockStore.store.users[userIndex] = {
    ...mockStore.store.users[userIndex],
    staffAccess: {
      staffRole: roleAssignment?.role,
      permissions: templatePermissions,
      overrides,
    },
  };
}

export interface IAccessService {
  getMyPermissions(userId?: string): Promise<PermissionCode[]>;
  hasPermission(code: PermissionCode, userId?: string): Promise<boolean>;
  listRoleTemplates(): Promise<RoleTemplate[]>;
  assignStaffRole(userId: string, role: StaffRole, assignedBy?: string): Promise<void>;
  setPermissionOverride(
    userId: string,
    code: PermissionCode,
    allowed: boolean,
    updatedBy?: string,
  ): Promise<void>;
  getUserStaffAccess(userId: string): Promise<StaffAccessProfile>;
}

class MockAccessService implements IAccessService {
  async getMyPermissions(userId?: string): Promise<PermissionCode[]> {
    const targetUserId = userId || resolveCurrentUserId();
    if (!targetUserId) return [];

    const user = resolveMockUser(targetUserId);
    if (!user) return [];

    const resolved = derivePermissionsForUser(user);
    if (user.staffAccess?.staffRole === 'SUPER_ADMIN') return ALL_PERMISSION_CODES;

    return resolved;
  }

  async hasPermission(code: PermissionCode, userId?: string): Promise<boolean> {
    const permissions = await this.getMyPermissions(userId);
    return permissions.includes(code);
  }

  async listRoleTemplates(): Promise<RoleTemplate[]> {
    return listRoleTemplates();
  }

  async assignStaffRole(userId: string, role: StaffRole, assignedBy?: string): Promise<void> {
    const user = resolveMockUser(userId);
    if (!user) throw new Error('User not found');
    if (user.role !== UserRole.ADMIN) throw new Error('Staff roles can only be assigned to ADMIN users');

    const assignment: UserRoleAssignment = {
      userId,
      role,
      assignedAt: new Date().toISOString(),
      assignedBy,
    };

    mockStore.store.userRoleAssignments = [
      ...mockStore.store.userRoleAssignments.filter((item) => item.userId !== userId),
      assignment,
    ];

    updateUserStaffAccess(userId);
    mockStore.save();
  }

  async setPermissionOverride(
    userId: string,
    code: PermissionCode,
    allowed: boolean,
    updatedBy?: string,
  ): Promise<void> {
    const user = resolveMockUser(userId);
    if (!user) throw new Error('User not found');
    if (user.role !== UserRole.ADMIN) throw new Error('Permission overrides can only be applied to ADMIN users');

    const override: PermissionOverride = {
      userId,
      permissionCode: code,
      allowed,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    mockStore.store.userPermissionOverrides = [
      ...mockStore.store.userPermissionOverrides.filter(
        (item) => item.userId !== userId || item.permissionCode !== code,
      ),
      override,
    ];

    updateUserStaffAccess(userId);
    mockStore.save();
  }

  async getUserStaffAccess(userId: string): Promise<StaffAccessProfile> {
    const user = resolveMockUser(userId);
    if (!user || user.role !== UserRole.ADMIN) {
      return {
        permissions: [],
        overrides: [],
      };
    }

    updateUserStaffAccess(userId);
    const refreshed = resolveMockUser(userId);
    return refreshed?.staffAccess || { permissions: [], overrides: [] };
  }
}

class SupabaseAccessService implements IAccessService {
  private fallback = new MockAccessService();

  async getMyPermissions(userId?: string): Promise<PermissionCode[]> {
    const targetUserId = userId || resolveCurrentUserId();
    if (!targetUserId || !supabase) return [];

    try {
      const { data, error } = await (supabase.rpc as any)('has_permission_list', {
        target_user_id: targetUserId,
      });

      if (error || !Array.isArray(data)) {
        return this.fallback.getMyPermissions(targetUserId);
      }

      return data.filter((item: unknown): item is PermissionCode => typeof item === 'string');
    } catch {
      return this.fallback.getMyPermissions(targetUserId);
    }
  }

  async hasPermission(code: PermissionCode, userId?: string): Promise<boolean> {
    const targetUserId = userId || resolveCurrentUserId();
    if (!targetUserId || !supabase) return false;

    try {
      const { data, error } = await (supabase.rpc as any)('has_permission', {
        target_user_id: targetUserId,
        permission_code: code,
      });
      if (error) return this.fallback.hasPermission(code, targetUserId);
      return Boolean(data);
    } catch {
      return this.fallback.hasPermission(code, targetUserId);
    }
  }

  async listRoleTemplates(): Promise<RoleTemplate[]> {
    return listRoleTemplates();
  }

  async assignStaffRole(userId: string, role: StaffRole, assignedBy?: string): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await (supabase.from('user_role_assignments') as any)
        .upsert({
          user_id: userId,
          staff_role: role,
          assigned_by: assignedBy || null,
          assigned_at: new Date().toISOString(),
        });

      if (error) throw error;
    } catch {
      await this.fallback.assignStaffRole(userId, role, assignedBy);
    }
  }

  async setPermissionOverride(
    userId: string,
    code: PermissionCode,
    allowed: boolean,
    updatedBy?: string,
  ): Promise<void> {
    if (!supabase) return;

    try {
      const { error } = await (supabase.from('user_permission_overrides') as any).upsert({
        user_id: userId,
        permission_code: code,
        allowed,
        updated_by: updatedBy || null,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch {
      await this.fallback.setPermissionOverride(userId, code, allowed, updatedBy);
    }
  }

  async getUserStaffAccess(userId: string): Promise<StaffAccessProfile> {
    if (!supabase) return this.fallback.getUserStaffAccess(userId);

    try {
      const [{ data: assignments }, { data: overrides }] = await Promise.all([
        (supabase.from('user_role_assignments') as any)
          .select('*')
          .eq('user_id', userId)
          .order('assigned_at', { ascending: false })
          .limit(1),
        (supabase.from('user_permission_overrides') as any)
          .select('*')
          .eq('user_id', userId),
      ]);

      const role = assignments?.[0]?.staff_role as StaffRole | undefined;
      const permissions = role ? STAFF_ROLE_TEMPLATES[role]?.permissions || [] : [];

      const mappedOverrides: PermissionOverride[] = (overrides || []).map((item: any) => ({
        userId,
        permissionCode: item.permission_code,
        allowed: Boolean(item.allowed),
        updatedAt: item.updated_at || new Date().toISOString(),
        updatedBy: item.updated_by || undefined,
      }));

      return {
        staffRole: role,
        permissions,
        overrides: mappedOverrides,
      };
    } catch {
      return this.fallback.getUserStaffAccess(userId);
    }
  }
}

export const accessService: IAccessService =
  isConfigured && supabase ? new SupabaseAccessService() : new MockAccessService();
