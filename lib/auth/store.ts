import { create } from 'zustand';
import { api } from '@/lib/api';
import { Profile, LoginCredentials, RegisterData } from '@/lib/api/types';

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.auth.login(credentials);
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const user = await api.auth.register(data);
      set({ user, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.auth.logout();
      set({ user: null, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      // In mock mode, 'me' might just return null or we persist session in store.
      // But for consistency, let's assume 'me' returns the current user if session exists.
      // Real API does this via Supabase session.
      // Mock API needs to handle session persistence or we do it here?
      // For now, let's assume the API layer handles "who am I".
      
      const user = await api.auth.me();
      // If we got a user, we might need to fetch their profile details if 'me' only returned basic auth user
      // But our realClient.me returns User, and we need Profile?
      // realClient.me returns User. We need to fetch profile.
      
      if (user) {
          try {
             const profile = await api.profiles.get(user.id);
             // @ts-ignore - mismatch between Supabase User and our Profile type
             set({ user: profile, isLoading: false });
          } catch {
             // If profile fetch fails, user might not be fully set up
              set({ user: null, isLoading: false });
          }
      } else {
          set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
