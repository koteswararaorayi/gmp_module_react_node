import api from "./api";

function buildMockAuth(username) {
  return {
    userId: 1,
    token: "phase0-demo-token",
    role: username.toLowerCase() === "admin" ? "admin" : "user",
    companyId: 1,
    userName: username,
    userEmail: `${username.toLowerCase()}@gmp-live.local`,
  };
}

export async function login(credentials) {
  const username = credentials.username?.trim();
  const password = credentials.password?.trim();

  if (!username || !password) {
    throw new Error("Username and password are required.");
  }

  return buildMockAuth(username);
}

export async function logout() {
  return Promise.resolve(true);
}

export async function fetchHealth() {
  return api.get("/health");
}

export async function fetchVersion() {
  return api.get("/version");
}
