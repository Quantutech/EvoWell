
import { useEffect, useState, useRef } from 'react';
import { supabase, isConfigured } from '../services/supabase';
import { Message, Notification } from '../types';
import { api } from '../services/api';
import { notificationService } from '../services/notifications';

/**
 * Hook to subscribe to messages in a specific conversation.
 * Handles initial fetch and subsequent updates.
 */
export const useRealtimeMessages = (conversationId: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    if (!conversationId || !isConfigured) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const fetchInitial = async () => {
      setIsLoading(true);
      try {
        const data = await api.getMessages(conversationId);
        setMessages(data);
      } catch (e) {
        console.error("Failed to load messages", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitial();
  }, [conversationId]);

  // Realtime Subscription
  useEffect(() => {
    if (!conversationId || !isConfigured) return;

    const channel = supabase
      .channel(`chat:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return { messages, isLoading };
};

/**
 * Hook to subscribe to user notifications.
 * Manages unread count and latest list.
 */
export const useRealtimeNotifications = (userId: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const fetchState = async () => {
    if (!userId) return;
    const [list, count] = await Promise.all([
      notificationService.getNotifications(userId, 10),
      notificationService.getUnreadCount(userId)
    ]);
    setNotifications(list);
    setUnreadCount(count);
  };

  useEffect(() => {
    if (!userId || !isConfigured) return;

    fetchState();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for INSERT (new) and UPDATE (read status)
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        () => {
          // On any change, re-fetch list and count to ensure consistency
          // (Simpler than merging state for updates/deletes)
          fetchState();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { 
    notifications, 
    unreadCount, 
    refresh: fetchState,
    markAsRead: async (id: string) => {
        await notificationService.markAsRead(id);
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    },
    markAllRead: async () => {
        if(!userId) return;
        await notificationService.markAllAsRead(userId);
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
    }
  };
};
