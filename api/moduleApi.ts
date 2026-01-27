import { apiClient } from "./apiClient";
import { Chapter } from "./chapterApi"; // Import Chapter interface

export interface Module {
  _id: string;
  name: string;
  level: {
    _id: string;
    name: string;
    code: string;
  };
  chapters: Chapter[];
  exam?: {
    _id: string;
    title: string;
    totalQuestions: number;
  };
  passingScorePercentage: number;
  isActive: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  data: T;
  message?: string;
}

export const moduleApi = {
  /**
   * Fetches modules for a level. 
   * Backend populates: level, chapters, and exam.
   */
  getModules: (levelId?: string) =>
    apiClient.get<ApiResponse<Module[]>>("/modules", {
      params: { levelId },
    }),

  getModuleById: (id: string) =>
    apiClient.get<ApiResponse<Module>>(`/modules/${id}`),
};