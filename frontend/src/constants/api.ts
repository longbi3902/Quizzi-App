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
  QUESTIONS: `${API_BASE_URL}/api/questions`,
  EXAMS: `${API_BASE_URL}/api/exams`,
  EXAMS_RANDOM: `${API_BASE_URL}/api/exams/random`,
  EXAM_CODES: `${API_BASE_URL}/api/exam-codes`,
  EXAM_ROOMS: `${API_BASE_URL}/api/exam-rooms`,
  EXAM_ROOMS_VERIFY: `${API_BASE_URL}/api/exam-rooms/verify`,
  EXAM_ROOMS_PARTICIPATED: `${API_BASE_URL}/api/exam-rooms/participated`,
  EXAM_RESULTS_START: (examRoomId: number) => `${API_BASE_URL}/api/exam-results/start/${examRoomId}`,
  EXAM_RESULTS_SUBMIT: `${API_BASE_URL}/api/exam-results/submit`,
  EXAM_RESULTS_BY_ROOM: (examRoomId: number) => `${API_BASE_URL}/api/exam-results/room/${examRoomId}`,
  EXAM_RESULTS_HISTORY: `${API_BASE_URL}/api/exam-results/history`,
  EXAM_RESULTS_BY_ROOM_TEACHER: (examRoomId: number) => `${API_BASE_URL}/api/exam-results/room/${examRoomId}/all`,
  EXAM_RESULTS_DETAIL: (resultId: number) => `${API_BASE_URL}/api/exam-results/detail/${resultId}`,
  SUBJECTS: `${API_BASE_URL}/api/subjects`,
} as const;







