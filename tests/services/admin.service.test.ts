import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { adminService } from '../../src/services/admin';
import { mockStore } from '../../src/services/mockStore';
import { ModerationStatus, UserRole } from '../../src/types';

describe('AdminService', () => {
  let snapshot: string;

  beforeEach(() => {
    snapshot = JSON.stringify(mockStore.store);
  });

  afterEach(() => {
    mockStore.store = JSON.parse(snapshot);
    mockStore.save();
  });

  it('getUsers applies role/search/includeDeleted filters', async () => {
    mockStore.store.users.push(
      {
        id: 'test-admin-users-active',
        email: 'people.active@example.com',
        firstName: 'People',
        lastName: 'Active',
        role: UserRole.PROVIDER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: false,
      },
      {
        id: 'test-admin-users-suspended',
        email: 'people.suspended@example.com',
        firstName: 'People',
        lastName: 'Suspended',
        role: UserRole.PROVIDER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDeleted: true,
      },
    );

    const result = await adminService.getUsers({
      page: 1,
      pageSize: 50,
      search: 'people',
      role: UserRole.PROVIDER,
      includeDeleted: false,
    });

    expect(result.data.some((user) => user.id === 'test-admin-users-active')).toBe(true);
    expect(result.data.some((user) => user.id === 'test-admin-users-suspended')).toBe(false);
    expect(result.data.every((user) => user.role === UserRole.PROVIDER)).toBe(true);
  });

  it('getProviders applies moderation status filter', async () => {
    const baseProvider = mockStore.store.providers[0];
    const now = new Date().toISOString();

    mockStore.store.users.push(
      {
        id: 'test-provider-user-pending',
        email: 'pending.provider@example.com',
        firstName: 'Pending',
        lastName: 'Provider',
        role: UserRole.PROVIDER,
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      },
      {
        id: 'test-provider-user-approved',
        email: 'approved.provider@example.com',
        firstName: 'Approved',
        lastName: 'Provider',
        role: UserRole.PROVIDER,
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
      },
    );

    mockStore.store.providers.push(
      {
        ...baseProvider,
        id: 'test-provider-pending',
        userId: 'test-provider-user-pending',
        moderationStatus: ModerationStatus.PENDING,
        audit: { createdAt: now, updatedAt: now },
      },
      {
        ...baseProvider,
        id: 'test-provider-approved',
        userId: 'test-provider-user-approved',
        moderationStatus: ModerationStatus.APPROVED,
        audit: { createdAt: now, updatedAt: now },
      },
    );

    const pending = await adminService.getProviders({
      page: 1,
      pageSize: 50,
      status: ModerationStatus.PENDING,
    });

    expect(pending.data.length).toBeGreaterThan(0);
    expect(pending.data.every((provider) => provider.moderationStatus === ModerationStatus.PENDING)).toBe(true);
  });

  it('setUserSuspended toggles isDeleted', async () => {
    mockStore.store.users.push({
      id: 'test-user-suspend-toggle',
      email: 'toggle@example.com',
      firstName: 'Toggle',
      lastName: 'User',
      role: UserRole.CLIENT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
    });

    await adminService.setUserSuspended('test-user-suspend-toggle', true);

    const suspended = mockStore.store.users.find((user) => user.id === 'test-user-suspend-toggle');
    expect(suspended?.isDeleted).toBe(true);

    await adminService.setUserSuspended('test-user-suspend-toggle', false);

    const reactivated = mockStore.store.users.find((user) => user.id === 'test-user-suspend-toggle');
    expect(reactivated?.isDeleted).toBe(false);
  });
});
