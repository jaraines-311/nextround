'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'USER' | 'ADMIN';
  billingOverride: 'NONE' | 'FREE_FOREVER';
  targetIndustry: string;
  subscription?: { plan: string; status: string };
  creditBalance?: { subscriptionCredits: number; purchasedCredits: number; total: number };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isHydrated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isHydrated: false,

      login: (token, user) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('nextround_token', token);
        }
        set({ token, user });
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('nextround_token');
        }
        set({ token: null, user: null });
      },

      refreshUser: async () => {
        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({ user });
        } catch {
          get().logout();
        } finally {
          set({ isLoading: false });
        }
      },

      setHydrated: (v) => set({ isHydrated: v }),
    }),
    {
      name: 'nextround-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    },
  ),
);
