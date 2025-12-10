import { create } from 'zustand';
import { authApi, User } from '../api/auth';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('authToken'),
  user: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.login(email, password);
      localStorage.setItem('authToken', token);
      set({ token, user, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Object && 'data' in error
          ? (error as { data?: { error?: string } }).data?.error || 'Login failed'
          : 'Login failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (email: string, password: string, confirmPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      const { token, user } = await authApi.register(email, password, confirmPassword);
      localStorage.setItem('authToken', token);
      set({ token, user, isLoading: false });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Object && 'data' in error
          ? (error as { data?: { error?: string } }).data?.error || 'Registration failed'
          : 'Registration failed';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('authToken');
      set({ token: null, user: null });
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      set({ token: null, user: null });
      return;
    }

    set({ isLoading: true });
    try {
      const { user } = await authApi.getMe();
      set({ token, user, isLoading: false });
    } catch (error) {
      console.error('Failed to verify token:', error);
      localStorage.removeItem('authToken');
      set({ token: null, user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
