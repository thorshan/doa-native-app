import { apiClient } from "./apiClient";

// 1. Define the interface using T[] instead of Array<T>
export interface VocabItem {
  _id: {
    $oid: string;
  };
  word: string;
  reading: string;
  meaning: string;
  kanji: {
    $oid: string;
  }[]; // Updated: T[] syntax
  level: {
    _id: string;
  };
  createdAt: {
    $date: string;
  };
  updatedAt: {
    $date: string;
  };
  __v: number;
}

export const vocabApi = {
  /**
   * Fetch all vocabulary. 
   * @param levelId Optional filter by Level ID ($oid string)
   */
  getAllVocab: (levelId?: string) => {
    const params = levelId ? { level: levelId } : {};
    return apiClient.get("/vocabularies", { params });
  },

  /**
   * Get a single vocabulary by its string ID
   */
  getVocabById: (id: string) => 
    apiClient.get(`/vocabularies/${id}`),

  /**
   * Create new vocabulary.
   */
  createVocab: (data: Partial<VocabItem>) => 
    apiClient.post("/vocabularies", data),

  /**
   * Update vocabulary
   */
  updateVocab: (id: string, data: Partial<VocabItem>) => 
    apiClient.put(`/vocabularies/${id}`, data),

  /**
   * Delete vocabulary
   */
  deleteVocab: (id: string) => 
    apiClient.delete(`/vocabularies/${id}`),
};