/**
 * Utility functions cho câu hỏi
 */

import { QuestionDifficulty } from '../types/question.types';

/**
 * Lấy tên độ khó từ số
 */
export const getDifficultyName = (difficulty: number): string => {
  switch (difficulty) {
    case QuestionDifficulty.NHAN_BIET:
      return 'Nhận biết';
    case QuestionDifficulty.THONG_HIEU:
      return 'Thông hiểu';
    case QuestionDifficulty.VAN_DUNG:
      return 'Vận dụng';
    case QuestionDifficulty.VAN_DUNG_CAO:
      return 'Vận dụng cao';
    default:
      return 'Không xác định';
  }
};

/**
 * Lấy màu cho độ khó (để hiển thị)
 */
export const getDifficultyColor = (difficulty: number): string => {
  switch (difficulty) {
    case QuestionDifficulty.NHAN_BIET:
      return '#4caf50'; // Xanh lá
    case QuestionDifficulty.THONG_HIEU:
      return '#2196f3'; // Xanh dương
    case QuestionDifficulty.VAN_DUNG:
      return '#ff9800'; // Cam
    case QuestionDifficulty.VAN_DUNG_CAO:
      return '#f44336'; // Đỏ
    default:
      return '#9e9e9e'; // Xám
  }
};

/**
 * Danh sách độ khó để dùng trong dropdown
 */
export const difficultyOptions = [
  { value: QuestionDifficulty.NHAN_BIET, label: 'Nhận biết' },
  { value: QuestionDifficulty.THONG_HIEU, label: 'Thông hiểu' },
  { value: QuestionDifficulty.VAN_DUNG, label: 'Vận dụng' },
  { value: QuestionDifficulty.VAN_DUNG_CAO, label: 'Vận dụng cao' },
];

