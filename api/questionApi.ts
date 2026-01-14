import { apiClient } from "./apiClient";

/* ================= TYPES ================= */

export interface Question {
  _id: string | { $oid: string };
  exam: string | { $oid: string }; // Links back to the Exam ID
  type: "mcq";
  question: string;
  options: string[];
  correctAnswer: string; // "に", "を", etc.
  explanation?: string;
  marks?: number;
  createdAt?: string | { $date: string };
  updatedAt?: string | { $date: string };
}

/* ================= API ================= */

export const questionApi = {
  getAllQuestions: (): Promise<{ data: Question[] }> =>
    apiClient.get("/questions"),

  getQuestion: (id: string): Promise<{ data: Question }> =>
    apiClient.get(`/questions/${id}`),

  createQuestion: (data: Partial<Question>): Promise<{ data: Question }> =>
    apiClient.post(`/questions`, data),

  updateQuestion: (
    id: string,
    data: Partial<Question>
  ): Promise<{ data: Question }> => apiClient.put(`/questions/${id}`, data),

  deleteQuestion: (id: string): Promise<void> =>
    apiClient.delete(`/questions/${id}`),
};
