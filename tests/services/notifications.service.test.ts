import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { notificationService } from '../../src/services/notifications';
import { mockStore } from '../../src/services/mockStore';
import { UserRole } from '../../src/types';

describe('NotificationService', () => {
  let snapshot: string;

  beforeEach(() => {
    snapshot = JSON.stringify(mockStore.store);
  });

  afterEach(() => {
    mockStore.store = JSON.parse(snapshot);
    mockStore.save();
  });

  it('creates notifications and updates unread counters', async () => {
    const clientUser = mockStore.store.users.find((user) => user.role === UserRole.CLIENT);
    expect(clientUser).toBeTruthy();

    await notificationService.createNotification({
      userId: clientUser!.id,
      type: 'message',
      title: 'New Message',
      message: 'You have a new message.',
    });

    const unreadBefore = await notificationService.getUnreadCount(clientUser!.id);
    expect(unreadBefore).toBeGreaterThan(0);

    const list = await notificationService.getNotifications(clientUser!.id, 5);
    expect(list.length).toBeGreaterThan(0);

    await notificationService.markAsRead(list[0].id);
    const unreadAfter = await notificationService.getUnreadCount(clientUser!.id);
    expect(unreadAfter).toBe(unreadBefore - 1);
  });

  it('marks all user notifications as read', async () => {
    const clientUser = mockStore.store.users.find((user) => user.role === UserRole.CLIENT);
    expect(clientUser).toBeTruthy();

    await notificationService.createNotification({
      userId: clientUser!.id,
      type: 'appointment',
      title: 'Appointment Updated',
      message: 'A provider updated your appointment.',
    });
    await notificationService.createNotification({
      userId: clientUser!.id,
      type: 'system',
      title: 'System Notice',
      message: 'Maintenance notice.',
    });

    await notificationService.markAllAsRead(clientUser!.id);
    const unread = await notificationService.getUnreadCount(clientUser!.id);
    expect(unread).toBe(0);
  });
});
