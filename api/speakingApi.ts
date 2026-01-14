import { apiClient } from "./apiClient";

export interface SpeakingLine {
  orderIndex: number;
  speaker: {
    nameJa: string;
    nameMm?: string;
  };
  textJa: string;
  textMn: string;
  audioUrl?: string;
}

export interface Speaking {
  _id: string;
  level: string;
  title: string;
  description?: string;
  lines: SpeakingLine[];
  relatedKanji?: string[];
  relatedGrammar?: string[];
  relatedVocabulary?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const speakingApi = {
  getAllSpeaking: () => apiClient.get<Speaking[]>("/speakings"),
  createSpeaking: (data: Partial<Speaking>) =>
    apiClient.post<Speaking>("/speakings", data),
  getSpeaking: (id: string) => apiClient.get<Speaking>(`/speakings/${id}`),
  updateSpeaking: (id: string, data: Partial<Speaking>) =>
    apiClient.put<Speaking>(`/speakings/${id}`, data),
  deleteSpeaking: (id: string) => apiClient.delete<void>(`/speakings/${id}`),
};
