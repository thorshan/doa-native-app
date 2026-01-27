import { apiClient } from "./apiClient";

/**
 * Interface representing a single exercise in Renshuu B
 */
export interface RenshuuBExercise {
  questionRef: string;
  question: string;
  answer: string[];
  correctAnswer: string;
  _id?: { $oid: string } | string;
}

/**
 * Interface representing the full Renshuu B document
 */
export interface RenshuuBData {
  _id: { $oid: string } | string;
  exercises: RenshuuBExercise[];
  level: { $oid: string } | string;
  chapter: { $oid: string } | string;
  relatedKanji: any[];
  relatedVocab: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const renshuuBApi = {
  /**
   * Fetch Renshuu B exercises filtered by chapter ID
   */
  getExercisesByChapter: (chapterId: string) =>
    apiClient.get<{ success: boolean; data: RenshuuBData[] }>("/renshuuB", {
      params: { chapterId },
    }),

  /**
   * Fetch a specific Renshuu B document by its ID
   */
  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: RenshuuBData }>(`/renshuuB/${id}`),
};