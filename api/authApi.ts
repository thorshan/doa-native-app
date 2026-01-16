import { apiClient } from "./apiClient";

export const authApi = {
  auth: (idToken: string) => 
    apiClient.post("/auth/google", { token: idToken }),
};