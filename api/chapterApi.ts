import { apiClient } from "./apiClient";

// --- Data Interfaces ---

export interface GrammarPattern {
  _id: string;
  title: string;
  structure: string;
  explanation: string;
  examples: {
    japanese: string;
    reading?: string;
    english: string;
  }[];
}

export interface QuestionData {
  _id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  category: string;
}

export interface ExamData {
  _id: string;
  title: string;
  questions: QuestionData[]
}

export interface KanjiReference {
  _id: string;
  character: string;
  meaning: string;
}

export interface SpeakingSection {
  _id: string;
  level: string;
  title: string;
  description?: string;
  lines: [
    {
      orderIndex: number;
      speaker: {
        nameJa: string;
        nameMm?: string;
      };
      textJa: string;
      textMn: string;
      audioUrl?: string;
    }
  ];
  relatedKanji?: string[];
  relatedGrammar?: string[];
  relatedVocabulary?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Chapter {
  _id: string;
  index: number;
  level: {
    _id: string;
    name: string;
    code: string;
  };
  module: string;
  grammarPatterns: GrammarPattern[];
  kanji: KanjiReference[];
  vocabulary: string[];
  speaking: SpeakingSection;
  exam: ExamData;
  isActive: boolean;
}

// Standardized API Response based on your controller patterns
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

// --- Chapter API Object ---

export const chapterApi = {
  /**
   * Matches router.route("/").get(getChapters)
   * Fetches all chapters. Supports query params like ?level=... or ?module=...
   */
  getChapters: (levelId: string) =>
    apiClient.get<ApiResponse<Chapter[]>>(`/chapters`, {
      params: { levelId }
    }),

  /**
   * Matches router.route("/:id").get(getFullChapter)
   * Fetches full details including populated grammar and kanji
   */
  getFullChapter: (id: string) =>
    apiClient.get<ApiResponse<Chapter>>(`/chapters/${id}`),

  /**
   * Helper specifically for the level-based filtering you use in Course.tsx
   */
  getChaptersByLevel: (levelId: string) =>
    apiClient.get<ApiResponse<Chapter[]>>(`/chapters?levelId=${levelId}`),
};
