-- Migration: 011_create_exam_rooms_table.sql
-- Description: Tạo bảng exam_rooms để lưu thông tin phòng thi

CREATE TABLE IF NOT EXISTS exam_rooms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT 'Tên phòng thi',
  password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu phòng thi',
  exam_id INT NOT NULL COMMENT 'ID đề thi được sử dụng trong phòng',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_exam_id (exam_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



