import { apiClient } from "./apiClient";

export const progressApi = {
  getProgress: () => apiClient.get("/user-progress"),
  passTest: (data: any) => apiClient.post("/user-progress/pass", data),
  getLatestProgress: () => apiClient.get("/user-progress/latest"),
};
