import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  setUser: (user: User | null, token: string | null) => void;
  setLoading: (loading: boolean) => void;
  updateBalance: (newBalance: number) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: true,
      
      setUser: (user, token) => {
        set({ user, token });
      },
      
      setLoading: (loading) => {
        set({ loading });
      },
      
      updateBalance: (newBalance) => {
        const { user } = get();
        if (user) {
          set({
            user: {
              ...user,
              balance: newBalance,
            },
          });
        }
      },
      
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);