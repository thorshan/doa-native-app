// src/constants/routes.ts
export const ROUTES = {
  HOME: "/" as const,
  SETTINGS: "/Settings" as const,
  OPTIONS: "/Options" as const,
  COUNTINGS: "/Countings" as const,
  VIDEO_FEED: "/VideoFeed" as const,
  ADMIN_INFO: "/AdminInfo" as const,

  COURSE_LIST: "/course/Course" as const,
  CHAPTER_DETAILS: (id: string) => `/course/${id}` as const,
  CHAPTER_GRAMMAR: (id: string) => `/course/${id}/Grammar` as const,
  CHAPTER_SPEAKING: (id: string) => `/course/${id}/Speaking` as const,
  CHAPTER_RENSHUUA: (id: string) => `/course/${id}/RenshuuA` as const,
  CHAPTER_RENSHUUB: (id: string) => `/course/${id}/RenshuuB` as const,
  CHAPTER_RENSHUUC: (id: string) => `/course/${id}/RenshuuC` as const,
  CHAPTER_TEST: (id: string) => `/course/${id}/ChapterTest` as const,

  LOGIN: "/auth/Login" as const,
  REGISTER: "/auth/Register" as const,

  PROFILE: "/user/Profile" as const,
  PROFILE_EDIT: "/user/EditProfile" as const,
  AVATAR_SELECT: "/user/AvatarPicker" as const,

  BASIC_INFO: "/basic/BasicInfo" as const,
  BASIC_DETAILS: "/basic/BasicDetails" as const,
  BASIC_EXAM: "/basic/BasicExam" as const,

  DOA_HUB: "/DoaHub" as const,

  GRAMMAR: "/grammar/Grammar" as const,
  GRAMMAR_N5: "/grammar/GrammarN5" as const,
  GRAMMAR_N4: "/grammar/GrammarN4" as const,
  GRAMMAR_N3: "/grammar/GrammarN3" as const,
  GRAMMAR_N2: "/grammar/GrammarN2" as const,
  GRAMMAR_N1: "/grammar/GrammarN1" as const,
  GRAMMAR_SPEAKING: "/grammar/SpeakingDetails" as const,
  GRAMMAR_CHAPTER: "/grammar/ChapterDetails" as const,

  MOJI_GOI: "/moji-goi/Options" as const,
  MOJI: "/moji-goi/Moji" as const,
  GOI: "/moji-goi/Goi" as const,
  PARTICLES: "/moji-goi/Particles" as const,

  READING: "/Reading" as const,
  LISTENING: "/Listening" as const,
  SPEAKING: "/Speaking" as const,

  EXAMS: "/exams/Exam" as const,
  EXAM_LEVEL_TEXT: "/exams/LevelTest" as const,
  EXAM_MOCK: "/exams/MockExams" as const,
  EXAM_SCREEN: (id: string) => `/exams/${id}` as const,
};
