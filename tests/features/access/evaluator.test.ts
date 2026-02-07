import { describe, expect, it } from 'vitest';
import { derivePermissionsForUser } from '../../../src/features/access/evaluator';
import { ALL_PERMISSION_CODES } from '../../../src/features/access/constants';
import { UserRole } from '../../../src/types';

describe('access evaluator', () => {
  it('grants legacy admins full permissions when no staff metadata exists', () => {
    const permissions = derivePermissionsForUser({
      id: 'admin-legacy-1',
      email: 'legacy-admin@evowell.com',
      firstName: 'Legacy',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    });

    expect(permissions.length).toBe(ALL_PERMISSION_CODES.length);
    expect(permissions).toContain('platform.config.write');
    expect(permissions).toContain('people.providers.moderate');
  });

  it('applies role templates with deny overrides', () => {
    const permissions = derivePermissionsForUser({
      id: 'support-1',
      email: 'support@evowell.com',
      firstName: 'Support',
      lastName: 'Lead',
      role: UserRole.ADMIN,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      staffAccess: {
        staffRole: 'SUPPORT_LEAD',
        permissions: [],
        overrides: [
          {
            userId: 'support-1',
            permissionCode: 'support.messages.reply',
            allowed: false,
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    });

    expect(permissions).toContain('support.messages.read');
    expect(permissions).not.toContain('support.messages.reply');
  });
});
