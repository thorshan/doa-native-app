import { apiClient } from "./apiClient";

export interface CompletedSection {
  grammar: boolean;
  speaking: boolean;
  renshuuA: boolean;
  renshuuB: boolean;
  renshuuC: boolean;
}

export interface ChapterProgress {
  chapterId: string;
  isSectionCompleted: boolean;
  completedSection: CompletedSection;
  score: number;
}

export interface CourseProgress {
  levelTag: "Basic" | "N5" | "N4" | "N3" | "N2" | "N1" | "Business";
  isCompletedChapter: boolean;
  isCourseCompleted: boolean;
  completedChapter: ChapterProgress[];
}

export interface UserProgressResponse {
  _id: string;
  user: string;
  courseProgress: CourseProgress[];
  updatedAt: string;
}
export const progressApi = {
  /**
   * PATCH /api/progress/update-module
   * Updates grammar, speaking, or renshuu booleans.
   */
  updateModuleStatus: (
    levelTag: string,
    chapterId: string,
    moduleKey: keyof CompletedSection
  ) =>
    apiClient.patch<{ success: boolean; data: UserProgressResponse }>(
      `/progress/update-module`,
      { levelTag, chapterId, moduleKey }
    ),

  /**
   * POST /api/progress/complete-chapter-test
   * Finalizes the chapter and checks if all chapters in the level are done.
   */
  completeChapterTest: (payload: {
    levelTag: string;
    chapterId: string;
    score: number;
  }) =>
    apiClient.post<{
      success: boolean;
      allChaptersDone: boolean;
      message: string;
    }>("/progress/complete-chapter-test", payload),

  /**
   * GET /api/progress/course/:levelTag
   * Get progress for a specific level (e.g., N5) to render the chapter list checkmarks.
   */
  getCourseProgress: (levelTag: string) =>
    apiClient.get<{ success: boolean; data: CourseProgress }>(
      `/progress/course/${levelTag}`
    ),
};
