-- Migration: 019_create_classes_table.sql
-- Description: Tạo bảng classes để thay thế exam_rooms (lớp học có thể có nhiều đề thi)

CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã lớp học (tự động sinh, 6 ký tự)',
  name VARCHAR(255) NOT NULL COMMENT 'Tên lớp học',
  password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu lớp học',
  start_date DATETIME NOT NULL COMMENT 'Ngày giờ bắt đầu cho phép thi',
  end_date DATETIME NOT NULL COMMENT 'Ngày giờ kết thúc cho phép thi',
  created_by INT NULL COMMENT 'ID người tạo (giáo viên)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_created_by (created_by),
  INDEX idx_code (code),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate dữ liệu từ exam_rooms sang classes
-- Sử dụng code từ exam_rooms làm code cho classes
INSERT INTO classes (code, name, password, start_date, end_date, created_by, created_at, updated_at)
SELECT 
  er.code,
  er.name,
  er.password,
  er.start_date,
  er.end_date,
  er.created_by,
  er.created_at,
  er.updated_at
FROM exam_rooms er
WHERE NOT EXISTS (
  SELECT 1 FROM classes c WHERE c.code = er.code
);

