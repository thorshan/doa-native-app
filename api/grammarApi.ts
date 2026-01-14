import { apiClient } from "./apiClient";

/* ================= TYPES ================= */

export interface GrammarExample {
  jp1: string;
  jp2?: string;
  mm1: string;
  mm2?: string;
}

export interface Grammar {
  _id: string;
  title: string;
  structure: string;
  meaning: string;
  explanation: string;
  level: string;
  examples: GrammarExample[];
  relatedKanji?: any[];
  relatedVocabulary?: any[];
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

/* ================= API ================= */

export const grammarApi = {
  getAllGrammar: () => apiClient.get<Grammar[]>("/grammars"),

  getGrammar: (id: string) => apiClient.get<Grammar>(`/grammars/${id}`),

  createGrammar: (data: Partial<Grammar>) =>
    apiClient.post<Grammar>("/grammars", data),

  updateGrammar: (id: string, data: Partial<Grammar>) =>
    apiClient.put<Grammar>(`/grammars/${id}`, data),

  deleteGrammar: (id: string) =>
    apiClient.delete<{ success: boolean }>(`/grammars/${id}`),
};
