import { create } from "zustand";
import { persist } from "zustand/middleware";

const defaultState = {
  isAuthenticated: false,
  userId: null,
  token: null,
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
          userId: data.userId ?? null,
          token: data.token ?? null,
          role: data.role ?? null,
          companyId: data.companyId ?? null,
          userName: data.userName ?? null,
          userEmail: data.userEmail ?? null,
          error: null,
        }),
      clearAuth: () => set({ ...defaultState }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      getToken: () => get().token,
      isLoggedIn: () => get().isAuthenticated,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userId: state.userId,
        role: state.role,
        companyId: state.companyId,
        userName: state.userName,
        userEmail: state.userEmail,
      }),
    },
  ),
);

export default useAuthStore;
