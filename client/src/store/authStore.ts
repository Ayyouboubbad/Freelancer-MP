import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { authAPI } from '../api';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user }),

      fetchMe: async () => {
        set({ loading: true });
        try {
          const { data } = await authAPI.getMe();
          set({ user: data.user, initialized: true });
        } catch {
          set({ user: null, initialized: true });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        try { await authAPI.logout(); } catch { /* ignore */ }
        set({ user: null });
        window.location.href = '/login';
      },
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({ user: s.user }),
    }
  )
);
