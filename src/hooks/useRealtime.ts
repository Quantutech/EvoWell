import { useEffect, useState, useCallback } from 'react';
import { supabase, isConfigured } from '@/services/supabase';
import { Message, Notification } from '@/types';
import { api } from '@/services/api';
import { notificationService } from '@/services/notifications';
import { realtimeHub } from '@/services/realtime/hub';

export const useRealtimeMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await api.getMessages(conversationId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages', error);
      setMessages([]);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!conversationId) return;

    if (isConfigured) {
      const channel = supabase
        .channel(`chat:${conversationId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`,
          },
          () => {
            fetchMessages();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    const unsubscribe = realtimeHub.subscribe('messages', (event) => {
      const payload = event.payload as { conversationId?: string };
      if (payload?.conversationId === conversationId) {
        fetchMessages();
      }
    });

    const poll = setInterval(fetchMessages, 12000);

    return () => {
      unsubscribe();
      clearInterval(poll);
    };
  }, [conversationId, fetchMessages]);

  return { messages, isLoading };
};

export const useRealtimeNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchState = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const [list, count] = await Promise.all([
      notificationService.getNotifications(userId, 10),
      notificationService.getUnreadCount(userId),
    ]);

    setNotifications(list);
    setUnreadCount(count);
  }, [userId]);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    if (!userId) return;

    if (isConfigured) {
      const channel = supabase
        .channel(`notifications:${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          () => {
            fetchState();
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    const unsubscribe = realtimeHub.subscribe('notifications', (event) => {
      const payload = event.payload as {
        notification?: Notification;
        userId?: string;
      };

      if (payload?.notification?.user_id === userId || payload?.userId === userId) {
        fetchState();
        return;
      }

      if (!payload?.notification && !payload?.userId) {
        fetchState();
      }
    });

    const poll = setInterval(fetchState, 15000);

    return () => {
      unsubscribe();
      clearInterval(poll);
    };
  }, [userId, fetchState]);

  return {
    notifications,
    unreadCount,
    refresh: fetchState,
    markAsRead: async (id: string) => {
      await notificationService.markAsRead(id);
      fetchState();
    },
    markAllRead: async () => {
      if (!userId) return;
      await notificationService.markAllAsRead(userId);
      fetchState();
    },
  };
};
