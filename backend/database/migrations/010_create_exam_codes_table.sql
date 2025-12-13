-- Migration: 010_create_exam_codes_table.sql
-- Description: Tạo bảng exam_codes để lưu các mã đề thi (đảo thứ tự câu hỏi)

CREATE TABLE IF NOT EXISTS exam_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT NOT NULL,
  code VARCHAR(50) NOT NULL COMMENT 'Mã đề (ví dụ: MĐ001, MĐ002)',
  question_order JSON NOT NULL COMMENT 'Thứ tự câu hỏi đã đảo (array of question IDs)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_exam_id (exam_id),
  INDEX idx_code (code),
  UNIQUE KEY unique_exam_code (exam_id, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;






