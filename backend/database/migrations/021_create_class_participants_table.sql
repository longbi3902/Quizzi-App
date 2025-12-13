-- Migration: 021_create_class_participants_table.sql
-- Description: Tạo bảng class_participants để thay thế exam_room_participants

CREATE TABLE IF NOT EXISTS class_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'ID học sinh',
  class_id INT NOT NULL COMMENT 'ID lớp học',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tham gia',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_class_id (class_id),
  UNIQUE KEY unique_user_class (user_id, class_id) COMMENT 'Mỗi học sinh chỉ tham gia 1 lần mỗi lớp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: 021_create_class_participants_table.sql
-- Description: Tạo bảng class_participants để thay thế exam_room_participants

CREATE TABLE IF NOT EXISTS class_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'ID học sinh',
  class_id INT NOT NULL COMMENT 'ID lớp học',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tham gia',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_class_id (class_id),
  UNIQUE KEY unique_user_class (user_id, class_id) COMMENT 'Mỗi học sinh chỉ tham gia 1 lần mỗi lớp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migrate dữ liệu từ exam_room_participants sang class_participants
INSERT INTO class_participants (user_id, class_id, joined_at)
SELECT 
  erp.user_id,
  c.id AS class_id,
  erp.joined_at
FROM exam_room_participants erp
INNER JOIN exam_rooms er ON erp.exam_room_id = er.id
INNER JOIN classes c ON c.code = er.code
WHERE NOT EXISTS (
  SELECT 1 FROM class_participants cp WHERE cp.user_id = erp.user_id AND cp.class_id = c.id
);

