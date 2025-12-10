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
} as const;







