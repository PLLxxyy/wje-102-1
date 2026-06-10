import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi, LoginPayload, RegisterPayload } from '../api/user';
import { useUserStore } from '../stores/useUserStore';

export function useAuth() {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.currentUser);
  const token = useUserStore((state) => state.token);
  const loading = useUserStore((state) => state.loading);
  const setAuth = useUserStore((state) => state.setAuth);
  const loadProfile = useUserStore((state) => state.loadProfile);
  const clearAuth = useUserStore((state) => state.logout);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await userApi.login(payload);
      setAuth(response.token, response.user);
      navigate('/');
    },
    [navigate, setAuth],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const response = await userApi.register(payload);
      setAuth(response.token, response.user);
      navigate('/');
    },
    [navigate, setAuth],
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [clearAuth, navigate]);

  return {
    currentUser,
    token,
    loading,
    isAuthenticated: Boolean(token && currentUser),
    login,
    register,
    logout,
    loadProfile,
  };
}
