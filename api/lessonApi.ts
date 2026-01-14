import { apiClient } from "./apiClient";

// Nested grammar pattern interface
export interface GrammarPattern {
  _id: string;
  title: string;
  structure: string;
  explanation?: string;
}

export interface Kanji {
  _id: string;
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meaning: string;
  strokes: number;
  level: string;
  examples: [];
}

export interface Speaking {
  _id: string;
  title: string;
  description: string;
}

// Lesson interface
export interface Lesson {
  _id: string;
  title: string;
  level: string;
  module: string;
  grammarPatterns: GrammarPattern[];
  kanji: Kanji[];
  vocabulary: string[];
  speaking: Speaking;
  examples: string[];
  contentBlocks: null;
}

// Optional: generic API response wrapper
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const lessonApi = {
  getAllLesson: () => apiClient.get<ApiResponse<Lesson[]>>("/lessons"),

  getLesson: (id: string) =>
    apiClient.get<ApiResponse<Lesson>>(`/lessons/${id}`),

  createLesson: (data: Partial<Lesson>) =>
    apiClient.post<ApiResponse<Lesson>>("/lessons", data),

  updateLesson: (id: string, data: Partial<Lesson>) =>
    apiClient.put<ApiResponse<Lesson>>(`/lessons/${id}`, data),

  deleteLesson: (id: string) =>
    apiClient.delete<ApiResponse<Lesson>>(`/lessons/${id}`),
};
