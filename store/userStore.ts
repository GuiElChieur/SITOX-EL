import { create } from 'zustand';

export type Role = 'Administrator' | 'Editor' | 'Viewer';

interface User {
  id: string;
  username: string;
  role: Role;
}

interface UserState {
  user: User | null;
  login: (username: string, role: Role) => void;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  login: (username, role) => set({ user: { id: Date.now().toString(), username, role } }),
  logout: () => set({ user: null }),
  hasPermission: (permission) => {
    const role = get().user?.role;
    if (!role) return false;
    
    // Simple RBAC structure for demo
    if (role === 'Administrator') return true;
    if (role === 'Editor') {
      return ['read', 'search', 'view_details', 'edit'].includes(permission);
    }
    if (role === 'Viewer') {
      return ['read', 'search', 'view_details'].includes(permission);
    }
    return false;
  },
}));
