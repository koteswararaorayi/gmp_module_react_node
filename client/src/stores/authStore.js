import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultState = {
  isAuthenticated: false,
  userId: null,
  token: null,
  refreshToken: null,
  role: null,
  companyId: null,
  userName: null,
  userEmail: null,
  loading: false,
  error: null,
};

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...defaultState,
      setAuthData: (data) =>
        set({
          isAuthenticated: true,
          userId: data.userId ?? data.user_id ?? null,
          token: data.token ?? null,
          refreshToken: data.refreshToken ?? data.refresh_token ?? null,
          role: data.role ?? null,
          companyId: data.companyId ?? data.company_id ?? null,
          userName: data.userName ?? data.user_name ?? null,
          userEmail: data.userEmail ?? data.email ?? null,
          error: null,
        }),
      clearAuth: () => set({ ...defaultState }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setToken: (token) => set({ token, isAuthenticated: Boolean(token) }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      getToken: () => get().token,
      getRefreshToken: () => get().refreshToken,
      isLoggedIn: () => get().isAuthenticated,
    }),
    {
      name: "auth-storage",
    },
  ),
);

export default useAuthStore;
