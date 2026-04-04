import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../lib/api';

interface User {
  id: string;
  email: string;
  name?: string;
  role: 'freelancer' | 'business' | 'admin' | 'workspace-admin';
  [key: string]: any;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => Promise<void>;
  clearAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (token, user) => {
    try {
      const normalizedUser = { ...user, role: user.role?.toLowerCase() } as User;
      await SecureStore.setItemAsync('auth_token', token);
      await SecureStore.setItemAsync('user_data', JSON.stringify(normalizedUser));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ token, user: normalizedUser, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Error setting auth:', error);
    }
  },

  clearAuth: async () => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      await SecureStore.deleteItemAsync('user_data');
      delete api.defaults.headers.common['Authorization'];
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Error clearing auth:', error);
    }
  },

  updateUser: async (data) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;
      const updatedUser = { ...user, ...data };
      await SecureStore.setItemAsync('user_data', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    } catch (error) {
      console.error('Error updating auth user:', error);
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      const userData = await SecureStore.getItemAsync('user_data');

      if (token && userData) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // --- PERFORMANCE OPTIMIZATION (Optimistic Hydration) ---
        // Immediately set state from cache so UI loads in <1s
        const cachedUser = JSON.parse(userData);
        const normalizedCachedUser = { ...cachedUser, role: cachedUser.role?.toLowerCase() } as User;
        
        set({
          token,
          user: normalizedCachedUser,
          isAuthenticated: true,
          isLoading: false, // Transition to Ready immediately
        });

        // RE-VERIFY IN BACKGROUND
        api.get('/api/me')
          .then(response => {
            if (response.data?.user) {
              const incomingUser = response.data.user;
              const normalizedUser = { ...incomingUser, role: incomingUser.role?.toLowerCase() } as User;
              
              // Only update if data changed or for fresh data
              set({
                user: normalizedUser,
              });
              SecureStore.setItemAsync('user_data', JSON.stringify(normalizedUser)).catch(() => {});
            }
          })
          .catch(err => {
            console.log('[Auth] Background verification failed:', err?.response?.status || err.message);
            // ONLY log out if the server explicitly tells us the token is dead
            if (err.response && err.response.status === 401) {
              useAuthStore.getState().clearAuth();
            }
            // For network errors, we keep the cached session alive
          });
      } else {
        set({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
