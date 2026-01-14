import { apiClient } from "./apiClient";

/* ================= TYPES ================= */

// This matches your Mongoose Schema exactly
export interface Exam {
  _id: string | { $oid: string };
  title: string;
  type: "Practice" | "Lesson" | "Level" | "Final";
  level?: string | { $oid: string };
  module?: string | { $oid: string };
  lesson?: string | { $oid: string };
  grammar?: string | { $oid: string };

  duration?: number;
  passingScore?: number;
  totalMarks?: number;

  // These will be IDs unless .populate('questions') is called on the backend
  questions: any[];

  isRequired: boolean;
  maxAttempts: number;
  isPublished: boolean;

  createdAt: string | { $date: string };
  updatedAt: string | { $date: string };
}

export interface ExamPayload {
  title: string;
  type: string;
  level?: string;
  questions: string[];
  passingScore?: number;
  isPublished?: boolean;
}

/* ================= API ================= */

export const examApi = {
  // Fetches all exams (useful for our frontend filtering)
  getAllExams: (): Promise<{ data: Exam[] }> => apiClient.get("/exams"),

  // Fetches a single exam with full details (and populated questions)
  getExam: (id: string): Promise<{ data: Exam }> =>
    apiClient.get(`/exams/${id}`),

  createExam: (data: ExamPayload): Promise<{ data: Exam }> =>
    apiClient.post("/exams", data),

  getExamByLecture: (lectureId: string): Promise<{ data: Exam[] }> =>
    apiClient.get(`/exams/lectures/${lectureId}`),

  updateExam: (
    id: string,
    data: Partial<ExamPayload>
  ): Promise<{ data: Exam }> => apiClient.put(`/exams/${id}`, data),

  deleteExam: (id: string): Promise<void> => apiClient.delete(`/exams/${id}`),
};
