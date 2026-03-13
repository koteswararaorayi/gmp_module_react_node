import useAuthStore from "../stores/authStore";

function useAuth() {
  return useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    userId: state.userId,
    token: state.token,
    refreshToken: state.refreshToken,
    role: state.role,
    companyId: state.companyId,
    userName: state.userName,
    userEmail: state.userEmail,
    loading: state.loading,
    error: state.error,
    setAuthData: state.setAuthData,
    clearAuth: state.clearAuth,
    setLoading: state.setLoading,
    setError: state.setError,
    setToken: state.setToken,
    setRefreshToken: state.setRefreshToken,
  }));
}

export default useAuth;
