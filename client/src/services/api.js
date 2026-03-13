import axios from "axios";
import useAuthStore from "../stores/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let refreshRequest = null;

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const isRefreshEndpoint = originalRequest.url?.includes("/auth/refresh-token");
    const isPublicAuthCall =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/forgot-password") ||
      originalRequest.url?.includes("/auth/reset-password");

    if (
      status === 401 &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      !isPublicAuthCall
    ) {
      originalRequest._retry = true;
      const store = useAuthStore.getState();
      const refreshToken = store.getRefreshToken();

      if (refreshToken) {
        try {
          if (!refreshRequest) {
            refreshRequest = api.post("/auth/refresh-token", { refreshToken });
          }

          const refreshed = await refreshRequest;
          refreshRequest = null;

          store.setToken(refreshed.data.token);
          originalRequest.headers.Authorization = `Bearer ${refreshed.data.token}`;

          return api(originalRequest);
        } catch (refreshError) {
          refreshRequest = null;
        }
      }

      store.clearAuth();
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error.response?.data || error);
  },
);

export default api;
