
import { supabase, isConfigured } from './supabase';
import { Notification } from '../types';

class NotificationService {
  /**
   * Fetch latest notifications for a user
   */
  async getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    if (!isConfigured) return [];

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

    return data as Notification[];
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<number> {
    if (!isConfigured) return 0;

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) return 0;
    return count || 0;
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    if (!isConfigured) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    if (!isConfigured) return;

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string): Promise<void> {
    if (!isConfigured) return;

    await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
  }
}

export const notificationService = new NotificationService();
