import { PermissionCode, RoleTemplate, StaffRole } from '@/types';

export const ALL_PERMISSION_CODES: PermissionCode[] = [
  'dashboard.overview.read',
  'people.users.read',
  'people.users.write',
  'people.users.delete',
  'people.providers.read',
  'people.providers.moderate',
  'people.clients.read',
  'cms.posts.read',
  'cms.posts.write',
  'cms.posts.submit',
  'cms.posts.approve',
  'cms.posts.publish',
  'cms.media.manage',
  'exchange.resources.read',
  'exchange.resources.write',
  'exchange.resources.moderate',
  'support.messages.read',
  'support.messages.reply',
  'support.tickets.read',
  'support.tickets.manage',
  'compliance.audit.read',
  'compliance.reports.read',
  'platform.config.read',
  'platform.config.write',
  'platform.roles.assign',
  'platform.permissions.override',
];

export const STAFF_ROLE_TEMPLATES: Record<StaffRole, RoleTemplate> = {
  SUPER_ADMIN: {
    role: 'SUPER_ADMIN',
    description: 'Full platform control and governance.',
    permissions: ALL_PERMISSION_CODES,
  },
  OPS_ADMIN: {
    role: 'OPS_ADMIN',
    description: 'Cross-functional operations management.',
    permissions: [
      'dashboard.overview.read',
      'people.users.read',
      'people.users.write',
      'people.providers.read',
      'people.providers.moderate',
      'people.clients.read',
      'support.messages.read',
      'support.messages.reply',
      'support.tickets.read',
      'support.tickets.manage',
      'platform.config.read',
    ],
  },
  PEOPLE_OPS: {
    role: 'PEOPLE_OPS',
    description: 'Manages user and client lifecycle operations.',
    permissions: [
      'dashboard.overview.read',
      'people.users.read',
      'people.users.write',
      'people.clients.read',
      'support.messages.read',
      'support.messages.reply',
    ],
  },
  PROVIDER_OPS: {
    role: 'PROVIDER_OPS',
    description: 'Manages provider onboarding and moderation.',
    permissions: [
      'dashboard.overview.read',
      'people.providers.read',
      'people.providers.moderate',
      'support.messages.read',
      'support.messages.reply',
      'support.tickets.read',
    ],
  },
  CONTENT_LEAD: {
    role: 'CONTENT_LEAD',
    description: 'Owns editorial quality, approvals, and publishing workflows.',
    permissions: [
      'dashboard.overview.read',
      'cms.posts.read',
      'cms.posts.write',
      'cms.posts.approve',
      'cms.posts.publish',
      'cms.media.manage',
      'exchange.resources.read',
      'exchange.resources.moderate',
    ],
  },
  SUPPORT_LEAD: {
    role: 'SUPPORT_LEAD',
    description: 'Manages inbound support and escalation workflows.',
    permissions: [
      'dashboard.overview.read',
      'support.messages.read',
      'support.messages.reply',
      'support.tickets.read',
      'support.tickets.manage',
      'people.users.read',
      'people.providers.read',
      'people.clients.read',
    ],
  },
  FINANCE_COMPLIANCE: {
    role: 'FINANCE_COMPLIANCE',
    description: 'Reviews audits, reporting, and compliance operations.',
    permissions: [
      'dashboard.overview.read',
      'compliance.audit.read',
      'compliance.reports.read',
      'platform.config.read',
      'exchange.resources.read',
      'support.tickets.read',
    ],
  },
};

export function listRoleTemplates(): RoleTemplate[] {
  return Object.values(STAFF_ROLE_TEMPLATES);
}
