-- Migration: 016_create_subjects_table.sql
-- Description: Tạo bảng subjects để lưu danh sách môn học

CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Tên môn học',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Thêm dữ liệu mẫu
INSERT INTO subjects (name) VALUES
('Toán học'),
('Vật lý'),
('Văn học'),
('Sử học'),
('Địa lý'),
('Hóa học'),
('Tin học'),
('Tiếng Anh'),
('Sinh học')
ON DUPLICATE KEY UPDATE name=name;

