/**
 * API Configuration
 * File này chứa các cấu hình liên quan đến API
 * Giúp dễ dàng thay đổi URL API khi cần
 */

// URL của backend server
export const API_BASE_URL = 'http://localhost:5000';

// Các endpoint API
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  UPDATE_PROFILE: (userId: number) => `${API_BASE_URL}/api/auth/profile/${userId}`,
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  EXAMS: `${API_BASE_URL}/api/exams`,
  EXAMS_RANDOM: `${API_BASE_URL}/api/exams/random`,
  EXAM_CODES: `${API_BASE_URL}/api/exam-codes`,
  // Classes (mới)
  CLASSES: `${API_BASE_URL}/api/classes`,
  CLASSES_VERIFY: `${API_BASE_URL}/api/classes/verify`,
  CLASSES_PARTICIPATED: `${API_BASE_URL}/api/classes/participated`,
  CLASSES_PARTICIPANTS: (classId: number) => `${API_BASE_URL}/api/classes/${classId}/participants`,
  CLASSES_ADD_EXAM: (classId: number) => `${API_BASE_URL}/api/classes/${classId}/exams`,
  CLASSES_UPDATE_EXAM_DATES: (classId: number, examId: number) => `${API_BASE_URL}/api/classes/${classId}/exams/${examId}`,
  CLASSES_REMOVE_EXAM: (classId: number, examId: number) => `${API_BASE_URL}/api/classes/${classId}/exams/${examId}`,
  // Exam Results (cập nhật)
  EXAM_RESULTS_START: (classId: number, examId: number) => `${API_BASE_URL}/api/exam-results/start/class/${classId}/exam/${examId}`,
  EXAM_RESULTS_SUBMIT: `${API_BASE_URL}/api/exam-results/submit`,
  EXAM_RESULTS_BY_CLASS_EXAM: (classId: number, examId: number) => `${API_BASE_URL}/api/exam-results/class/${classId}/exam/${examId}`,
  EXAM_RESULTS_BY_CLASS_EXAM_TEACHER: (classId: number, examId: number) => `${API_BASE_URL}/api/exam-results/class/${classId}/exam/${examId}/all`,
  EXAM_RESULTS_HISTORY: `${API_BASE_URL}/api/exam-results/history`,
  EXAM_RESULTS_DETAIL: (resultId: number) => `${API_BASE_URL}/api/exam-results/detail/${resultId}`,
  SUBJECTS: `${API_BASE_URL}/api/subjects`,
} as const;







