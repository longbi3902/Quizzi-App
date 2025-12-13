-- Migration: 008_create_exam_questions_table.sql
-- Description: Tạo bảng exam_questions để lưu câu hỏi trong đề thi

CREATE TABLE IF NOT EXISTS exam_questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  question_id INT NOT NULL,
  score DECIMAL(10,2) NOT NULL COMMENT 'Điểm số của câu hỏi trong đề thi',
  order_index INT NOT NULL DEFAULT 0 COMMENT 'Thứ tự câu hỏi trong đề thi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_exam_id (exam_id),
  INDEX idx_question_id (question_id),
  INDEX idx_order (exam_id, order_index),
  UNIQUE KEY unique_exam_question (exam_id, question_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;






