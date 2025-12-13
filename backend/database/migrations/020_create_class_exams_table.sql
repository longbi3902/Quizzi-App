-- Migration: 020_create_class_exams_table.sql
-- Description: Tạo bảng class_exams để liên kết lớp học với nhiều đề thi

CREATE TABLE IF NOT EXISTS class_exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL COMMENT 'ID lớp học',
  exam_id INT NOT NULL COMMENT 'ID đề thi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_class_id (class_id),
  INDEX idx_exam_id (exam_id),
  UNIQUE KEY unique_class_exam (class_id, exam_id) COMMENT 'Mỗi đề thi chỉ được thêm vào lớp 1 lần'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: 020_create_class_exams_table.sql
-- Description: Tạo bảng class_exams để liên kết lớp học với nhiều đề thi

CREATE TABLE IF NOT EXISTS class_exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL COMMENT 'ID lớp học',
  exam_id INT NOT NULL COMMENT 'ID đề thi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_class_id (class_id),
  INDEX idx_exam_id (exam_id),
  UNIQUE KEY unique_class_exam (class_id, exam_id) COMMENT 'Mỗi đề thi chỉ được thêm vào lớp 1 lần'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate dữ liệu từ exam_rooms sang class_exams
-- Mỗi exam_room (với exam_id) sẽ trở thành 1 class_exam
INSERT INTO class_exams (class_id, exam_id, created_at)
SELECT 
  c.id AS class_id,
  er.exam_id,
  er.created_at
FROM exam_rooms er
INNER JOIN classes c ON c.code = er.code
WHERE NOT EXISTS (
  SELECT 1 FROM class_exams ce WHERE ce.class_id = c.id AND ce.exam_id = er.exam_id
);

