import { apiClient } from "./apiClient";

/**
 * Interface representing a single grammar pattern in Renshuu A
 */
export interface RenshuuAPattern {
  structure: string;
  meaning: string;
}

/**
 * Interface representing the full Renshuu A document
 */
export interface RenshuuAData {
  _id: string;
  patterns: RenshuuAPattern[];
  level: any; 
  chapter: string; 
  relatedKanji: any[]; 
  relatedVocab: any[]; 
  createdAt: string;
  updatedAt: string;
}

export const renshuuAApi = {
  
  getPatternsByChapter: (chapterId: string) =>
    apiClient.get<{ success: boolean; data: RenshuuAData[] }>("/renshuuA", {
      params: { chapterId },
    }),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: RenshuuAData }>(`/renshuuA/${id}`),

};