import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginUser, registerUser, fetchCurrentUser, updateCurrentUser } from '../services/auth';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (payload: Partial<Pick<User, 'displayName' | 'currency'>>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { token, user } = await loginUser({ email, password });
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false, token: null, user: null });
          throw error;
        }
      },

      register: async (email: string, password: string, displayName?: string) => {
        set({ isLoading: true });
        try {
          const { token, user } = await registerUser({ email, password, displayName });
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false, isAuthenticated: false });
          throw error;
        }
      },

      logout: async () => {
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateProfile: async (payload) => {
        const { token } = useAuthStore.getState();
        if (!token) throw new Error('Not authenticated');
        const updatedUser = await updateCurrentUser(token, payload);
        set((state) => ({ ...state, user: updatedUser }));
      },

      checkAuth: async () => {
        const { token } = useAuthStore.getState();
        if (!token) {
          set({ isAuthenticated: false, isLoading: false, user: null });
          return;
        }
        try {
          const user = await fetchCurrentUser(token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error('checkAuth failed', error);
          set({ user: null, token: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'mochamoney-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth();
}

