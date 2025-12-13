-- Migration: 014_create_exam_room_participants_table.sql
-- Description: Tạo bảng exam_room_participants để lưu lịch sử tham gia phòng thi của học sinh

CREATE TABLE IF NOT EXISTS exam_room_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'ID học sinh',
  exam_room_id INT NOT NULL COMMENT 'ID phòng thi',
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian tham gia',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_room_id) REFERENCES exam_rooms(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_exam_room_id (exam_room_id),
  UNIQUE KEY unique_user_exam_room (user_id, exam_room_id) COMMENT 'Mỗi học sinh chỉ tham gia 1 lần mỗi phòng thi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





