import { apiClient } from "./apiClient";

export interface Dialogue {
  speaker: string;
  sentence: string;
  meaning: string;
  _id: { $oid: string } | string;
}

export interface RenshuuCData {
  _id: { $oid: string } | string;
  title: string;
  scenario: string;
  dialogue: Dialogue[];
  chapter: { $oid: string } | string;
  level: { $oid: string } | string;
  relatedKanji: any[];
  relatedVocab: any[];
  createdAt: string;
  updatedAt: string;
}

export const renshuuCApi = {
  getDialogueByChapter: (chapterId: string) =>
    apiClient.get<{ success: boolean; data: RenshuuCData[] }>("/renshuuC", {
      params: { chapterId },
    }),

  getById: (id: string) =>
    apiClient.get<{ success: boolean; data: RenshuuCData }>(`/renshuuC/${id}`),
};