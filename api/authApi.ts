import { apiClient } from "./apiClient";

export const authApi = {
  login: (data: { email: string; password: string }) =>
    apiClient.post("/auth/login", data),
  register: (data: { name: string; email: string; password: string; }) =>
    apiClient.post("/auth/register", data),
  logout: () => apiClient.post("/auth/logout"),
  me: () => apiClient.get("/auth/me"),
};
