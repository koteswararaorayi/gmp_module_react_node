import api from "./api";

export async function login(username, password) {
  return api.post("/auth/login", { username, password });
}

export async function logout() {
  return api.post("/auth/logout", {});
}

export async function refreshToken(refreshTokenValue) {
  return api.post("/auth/refresh-token", { refreshToken: refreshTokenValue });
}

export async function forgotPassword(email) {
  return api.post("/auth/forgot-password", { email });
}

export async function resetPassword(token, newPassword) {
  return api.post("/auth/reset-password", { token, newPassword });
}

export async function getProfile() {
  return api.get("/users/profile");
}

export async function updateProfile(updateData) {
  return api.put("/users/profile", updateData);
}

export async function changePassword(oldPassword, newPassword) {
  return api.put("/users/change-password", { oldPassword, newPassword });
}

export async function getRoles() {
  return api.get("/users/roles");
}

export async function getLoginHistory(limit = 20, offset = 0) {
  return api.get(`/users/login-history?limit=${limit}&offset=${offset}`);
}

export async function checkHealth() {
  return api.get("/health");
}
