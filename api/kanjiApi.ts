import { AxiosResponse } from "axios";
import { apiClient } from "./apiClient";

/* ================= TYPES ================= */

export interface KanjiExample {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiData {
  _id?: string;
  character: string;
  meaning: string[];
  onyomi: string[];
  kunyomi: string[];
  strokes: number;
  level: {
    _id: string;
    code: string;
  };
  examples: KanjiExample[];
  createdAt?: string;
  updatedAt?: string;
}

/* ================= API SERVICE ================= */

export const kanjiApi = {
  /** Get all kanji characters */
  getAllKanji: (): Promise<AxiosResponse<KanjiData[]>> =>
    apiClient.get("/kanji"),

  /** Create a new kanji entry */
  createKanji: (data: Partial<KanjiData>): Promise<AxiosResponse<KanjiData>> =>
    apiClient.post(`/kanji`, data),

  /** Get a specific kanji by ID */
  getKanji: (id: string): Promise<AxiosResponse<KanjiData>> =>
    apiClient.get(`/kanji/${id}`),

  /** Update an existing kanji */
  updateKanji: (
    id: string,
    data: Partial<KanjiData>
  ): Promise<AxiosResponse<KanjiData>> => apiClient.put(`/kanji/${id}`, data),

  /** Delete a kanji entry */
  deleteKanji: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    apiClient.delete(`/kanji/${id}`),
};
