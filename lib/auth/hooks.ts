import { useAuthStore } from './store';

export function useAuth() {
  const { user, isLoading, error, login, register, logout } = useAuthStore();
  return { user, isLoading, error, login, register, logout };
}

export function useUser() {
  const { user } = useAuthStore();
  return user;
}

export function useRole() {
  const { user } = useAuthStore();
  return user?.role;
}

export function useIsManager() {
  const { user } = useAuthStore();
  return user?.role === 'owner' || user?.role === 'manager';
}
