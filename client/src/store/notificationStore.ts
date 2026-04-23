import { create } from 'zustand';
import type { Notification } from '../types';
import { notificationAPI } from '../api';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  fetch: () => Promise<void>;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  remove: (id: string) => Promise<void>;
  addLive: (n: Notification) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetch: async () => {
    set({ loading: true });
    try {
      const { data } = await notificationAPI.getNotifications({ limit: 30 });
      set({ notifications: data.notifications, unreadCount: data.unreadCount });
    } finally {
      set({ loading: false });
    }
  },

  markAllRead: async () => {
    await notificationAPI.markAllRead();
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  markRead: async (id) => {
    await notificationAPI.markRead(id);
    set((s) => ({
      notifications: s.notifications.map((n) => n._id === id ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }));
  },

  remove: async (id) => {
    await notificationAPI.deleteNotification(id);
    const prev = get().notifications.find((n) => n._id === id);
    set((s) => ({
      notifications: s.notifications.filter((n) => n._id !== id),
      unreadCount: prev && !prev.isRead ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
    }));
  },

  addLive: (n) => {
    set((s) => ({
      notifications: [n, ...s.notifications],
      unreadCount: s.unreadCount + 1,
    }));
  },
}));
