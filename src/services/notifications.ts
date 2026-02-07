import { supabase, isConfigured } from '@/services/supabase';
import { Notification } from '@/types';
import { mockStore } from './mockStore';
import { realtimeHub } from './realtime/hub';

interface CreateNotificationInput {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  link?: string;
}

class NotificationService {
  private ensureMockCollections() {
    const store = mockStore.store as any;
    if (!Array.isArray(store.notifications)) {
      store.notifications = [];
    }
  }

  async getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    if (!isConfigured) {
      this.ensureMockCollections();
      return [...mockStore.store.notifications]
        .filter((notification) => notification.user_id === userId)
        .sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        )
        .slice(0, limit);
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return (data as Notification[]) || [];
  }

  async getUnreadCount(userId: string): Promise<number> {
    if (!isConfigured) {
      this.ensureMockCollections();
      return mockStore.store.notifications.filter(
        (notification) => notification.user_id === userId && !notification.is_read,
      ).length;
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  }

  async createNotification(input: CreateNotificationInput): Promise<Notification> {
    if (!isConfigured) {
      this.ensureMockCollections();
      const notification: Notification = {
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        user_id: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link,
        is_read: false,
        created_at: new Date().toISOString(),
      };

      mockStore.store.notifications.push(notification);
      mockStore.save();

      realtimeHub.publish('notifications', {
        action: 'created',
        notification,
      });

      return notification;
    }

    const { data, error } = await (supabase.from('notifications') as any)
      .insert({
        user_id: input.userId,
        type: input.type,
        title: input.title,
        message: input.message,
        link: input.link || null,
        is_read: false,
      })
      .select('*')
      .single();

    if (error) throw error;
    return data as Notification;
  }

  async markAsRead(notificationId: string): Promise<void> {
    if (!isConfigured) {
      this.ensureMockCollections();
      let changed = false;
      mockStore.store.notifications = mockStore.store.notifications.map((notification) => {
        if (notification.id !== notificationId || notification.is_read) return notification;
        changed = true;
        return { ...notification, is_read: true };
      });
      if (changed) {
        mockStore.save();
        realtimeHub.publish('notifications', {
          action: 'updated',
          notificationId,
        });
      }
      return;
    }

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    if (!isConfigured) {
      this.ensureMockCollections();
      let changed = false;
      mockStore.store.notifications = mockStore.store.notifications.map((notification) => {
        if (notification.user_id !== userId || notification.is_read) return notification;
        changed = true;
        return { ...notification, is_read: true };
      });
      if (changed) {
        mockStore.save();
        realtimeHub.publish('notifications', {
          action: 'mark-all-read',
          userId,
        });
      }
      return;
    }

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  }

  async deleteNotification(id: string): Promise<void> {
    if (!isConfigured) {
      this.ensureMockCollections();
      const before = mockStore.store.notifications.length;
      mockStore.store.notifications = mockStore.store.notifications.filter(
        (notification) => notification.id !== id,
      );
      if (mockStore.store.notifications.length !== before) {
        mockStore.save();
        realtimeHub.publish('notifications', {
          action: 'deleted',
          notificationId: id,
        });
      }
      return;
    }

    await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
  }
}

export const notificationService = new NotificationService();
