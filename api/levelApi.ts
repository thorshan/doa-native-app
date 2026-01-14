import { AxiosResponse } from "axios";
import { apiClient } from "./apiClient";

/* ================= TYPES ================= */

export interface LevelData {
  _id: string;
  code: string; // e.g., "N5", "N4"
  description?: string; // e.g., "Basic Japanese"
  order?: number; // To handle sorting (N5 -> N1)
  createdAt?: string;
  updatedAt?: string;
}

/* ================= API SERVICE ================= */

export const levelApi = {
  /** Get all JLPT levels */
  getAllLevel: (): Promise<AxiosResponse<LevelData[]>> =>
    apiClient.get("/levels"),

  /** Create a new level entry */
  createLevel: (data: Partial<LevelData>): Promise<AxiosResponse<LevelData>> =>
    apiClient.post(`/levels`, data),

  /** Update an existing level's details */
  updateLevel: (
    id: string,
    data: Partial<LevelData>
  ): Promise<AxiosResponse<LevelData>> => apiClient.put(`/levels/${id}`, data),

  /** Delete a level entry */
  deleteLevel: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    apiClient.delete(`/levels/${id}`),
};
