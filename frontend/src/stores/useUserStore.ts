import { create } from 'zustand';
import { userApi } from '../api/user';
import { User } from '../types/user';
import { storage } from '../utils/storage';

interface UserStore {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  setAuth: (token: string, user: User) => void;
  loadProfile: () => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  currentUser: null,
  token: storage.getToken(),
  loading: false,
  setAuth: (token, user) => {
    storage.setToken(token);
    set({ token, currentUser: user });
  },
  loadProfile: async () => {
    if (!storage.getToken()) {
      set({ currentUser: null, token: null });
      return;
    }
    set({ loading: true });
    try {
      const user = await userApi.profile();
      set({ currentUser: user, token: storage.getToken(), loading: false });
    } catch {
      storage.clearToken();
      set({ currentUser: null, token: null, loading: false });
    }
  },
  logout: () => {
    storage.clearToken();
    set({ currentUser: null, token: null });
  },
}));
