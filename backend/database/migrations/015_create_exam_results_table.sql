-- Migration: 015_create_exam_results_table.sql
-- Description: Tạo bảng exam_results để lưu lịch sử làm bài thi của học sinh

CREATE TABLE IF NOT EXISTS exam_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'ID học sinh',
  exam_room_id INT NOT NULL COMMENT 'ID phòng thi',
  exam_code_id INT NULL COMMENT 'ID mã đề thi (nếu có)',
  exam_id INT NOT NULL COMMENT 'ID đề thi gốc',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian bắt đầu làm bài',
  submitted_at TIMESTAMP NULL COMMENT 'Thời gian nộp bài',
  score DECIMAL(10, 2) DEFAULT 0 COMMENT 'Điểm số đạt được',
  max_score DECIMAL(10, 2) NOT NULL COMMENT 'Tổng điểm tối đa',
  answers JSON NOT NULL COMMENT 'JSON chứa đáp án học sinh chọn: [{"questionId": 1, "answerIds": [1, 2]}, ...]',
  correct_answers JSON NULL COMMENT 'JSON chứa đáp án đúng: [{"questionId": 1, "answerIds": [1, 2]}, ...]',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_room_id) REFERENCES exam_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_code_id) REFERENCES exam_codes(id) ON DELETE SET NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_exam_room_id (exam_room_id),
  INDEX idx_exam_code_id (exam_code_id),
  INDEX idx_started_at (started_at),
  UNIQUE KEY unique_user_exam_room (user_id, exam_room_id) COMMENT 'Mỗi học sinh chỉ được làm 1 lần mỗi phòng thi'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



