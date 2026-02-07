import { UserRole } from '../../data/types/enums';

export type StaffRole =
  | 'SUPER_ADMIN'
  | 'OPS_ADMIN'
  | 'PEOPLE_OPS'
  | 'PROVIDER_OPS'
  | 'CONTENT_LEAD'
  | 'SUPPORT_LEAD'
  | 'FINANCE_COMPLIANCE';

export type PermissionCode =
  | 'dashboard.overview.read'
  | 'people.users.read'
  | 'people.users.write'
  | 'people.users.delete'
  | 'people.providers.read'
  | 'people.providers.moderate'
  | 'people.clients.read'
  | 'cms.posts.read'
  | 'cms.posts.write'
  | 'cms.posts.submit'
  | 'cms.posts.approve'
  | 'cms.posts.publish'
  | 'cms.media.manage'
  | 'exchange.resources.read'
  | 'exchange.resources.write'
  | 'exchange.resources.moderate'
  | 'support.messages.read'
  | 'support.messages.reply'
  | 'support.tickets.read'
  | 'support.tickets.manage'
  | 'compliance.audit.read'
  | 'compliance.reports.read'
  | 'platform.config.read'
  | 'platform.config.write'
  | 'platform.roles.assign'
  | 'platform.permissions.override';

export type AccessSubjectType = UserRole | StaffRole;

export interface RoleTemplate {
  role: StaffRole;
  description: string;
  permissions: PermissionCode[];
}

export interface PermissionOverride {
  userId: string;
  permissionCode: PermissionCode;
  allowed: boolean;
  updatedAt: string;
  updatedBy?: string;
}

export interface UserRoleAssignment {
  userId: string;
  role: StaffRole;
  assignedAt: string;
  assignedBy?: string;
}

export interface StaffAccessProfile {
  staffRole?: StaffRole;
  permissions: PermissionCode[];
  overrides: PermissionOverride[];
}
