-- Migration: 007_create_exams_table.sql
-- Description: Tạo bảng exams để lưu thông tin đề thi

CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT 'Tên đề thi',
  duration INT NOT NULL COMMENT 'Thời gian thi (phút)',
  max_score DECIMAL(10,2) NOT NULL COMMENT 'Tổng điểm tối đa của đề thi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




