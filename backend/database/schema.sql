-- ============================================
-- SCHEMA DATABASE QUIZZIAPP
-- File này tạo toàn bộ database từ đầu
-- Sử dụng cho môi trường development
-- ============================================

-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS quizziapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE quizziapp;

-- ============================================
-- Bảng users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('teacher', 'student') NOT NULL,
  birth_year INT NULL,
  class_name VARCHAR(50) NULL,
  school VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Bảng subjects (Môn học)
-- ============================================
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE COMMENT 'Tên môn học',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert dữ liệu mẫu môn học
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

-- ============================================
-- Bảng questions (Câu hỏi)
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  image VARCHAR(500) NULL,
  difficulty INT NOT NULL DEFAULT 1 COMMENT 'Độ khó: 1=Nhận biết, 2=Thông hiểu, 3=Vận dụng, 4=Vận dụng cao',
  grade INT NULL COMMENT 'Khối lớp (1-12)',
  subject_id INT NULL COMMENT 'ID môn học',
  created_by INT NULL COMMENT 'ID người tạo (giáo viên)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_created_at (created_at),
  INDEX idx_difficulty (difficulty),
  INDEX idx_grade (grade),
  INDEX idx_subject_id (subject_id),
  INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Bảng answers (Đáp án)
-- ============================================
CREATE TABLE IF NOT EXISTS answers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id INT NOT NULL,
  content TEXT NOT NULL,
  is_true BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id),
  INDEX idx_is_true (is_true)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Bảng exams (Đề thi)
-- ============================================
CREATE TABLE IF NOT EXISTS exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT 'Tên đề thi',
  duration INT NOT NULL COMMENT 'Thời gian thi (phút)',
  max_score DECIMAL(10,2) NOT NULL COMMENT 'Tổng điểm tối đa của đề thi',
  created_by INT NULL COMMENT 'ID người tạo (giáo viên)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_created_at (created_at),
  INDEX idx_created_by (created_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Bảng exam_questions (Câu hỏi trong đề thi)
-- ============================================
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

-- ============================================
-- Bảng exam_codes (Mã đề thi - đảo thứ tự câu hỏi)
-- ============================================
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

-- ============================================
-- Bảng classes (Lớp học)
-- ============================================
CREATE TABLE IF NOT EXISTS classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE COMMENT 'Mã lớp học (tự động sinh, 6 ký tự)',
  name VARCHAR(255) NOT NULL COMMENT 'Tên lớp học',
  password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu lớp học',
  created_by INT NULL COMMENT 'ID người tạo (giáo viên)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_created_by (created_by),
  INDEX idx_code (code),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Bảng class_exams (Liên kết lớp học với đề thi)
-- Mỗi đề thi trong lớp có start_date và end_date riêng
-- ============================================
CREATE TABLE IF NOT EXISTS class_exams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL COMMENT 'ID lớp học',
  exam_id INT NOT NULL COMMENT 'ID đề thi',
  start_date DATETIME NOT NULL COMMENT 'Ngày giờ bắt đầu cho phép thi',
  end_date DATETIME NOT NULL COMMENT 'Ngày giờ kết thúc cho phép thi',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_class_id (class_id),
  INDEX idx_exam_id (exam_id),
  UNIQUE KEY unique_class_exam (class_id, exam_id) COMMENT 'Mỗi đề thi chỉ được thêm vào lớp 1 lần'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Bảng class_participants (Học sinh tham gia lớp)
-- ============================================
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

-- ============================================
-- Bảng exam_results (Kết quả làm bài)
-- ============================================
CREATE TABLE IF NOT EXISTS exam_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL COMMENT 'ID học sinh',
  exam_room_id INT NULL COMMENT 'ID phòng thi (deprecated - không dùng nữa)',
  class_id INT NOT NULL COMMENT 'ID lớp học',
  exam_code_id INT NULL COMMENT 'ID mã đề thi (nếu có)',
  exam_id INT NOT NULL COMMENT 'ID đề thi gốc',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Thời gian bắt đầu làm bài',
  submitted_at TIMESTAMP NULL COMMENT 'Thời gian nộp bài',
  score DECIMAL(10, 2) DEFAULT 0 COMMENT 'Điểm số đạt được',
  max_score DECIMAL(10, 2) NOT NULL COMMENT 'Tổng điểm tối đa',
  answers JSON NOT NULL COMMENT 'JSON chứa đáp án học sinh chọn: [{"questionId": 1, "answerIds": [1, 2]}, ...]',
  correct_answers JSON NULL COMMENT 'JSON chứa đáp án đúng: [{"questionId": 1, "answerIds": [1, 2]}, ...]',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_code_id) REFERENCES exam_codes(id) ON DELETE SET NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_class_id (class_id),
  INDEX idx_exam_code_id (exam_code_id),
  INDEX idx_exam_id (exam_id),
  INDEX idx_started_at (started_at),
  UNIQUE KEY unique_user_class_exam (user_id, class_id, exam_id) COMMENT 'Mỗi học sinh chỉ được làm 1 lần mỗi đề thi trong mỗi lớp'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Bảng refresh_tokens (Refresh token cho JWT)
-- ============================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_token (token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Bảng migrations (Theo dõi migrations đã chạy)
-- ============================================
CREATE TABLE IF NOT EXISTS migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  migration_name VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_migration_name (migration_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERT DỮ LIỆU MẪU
-- ============================================

-- Insert users mẫu (password: 123456)
INSERT INTO users (name, email, password, role, birth_year, class_name, school, phone) VALUES
('Nguyễn Văn A', 'teacher@example.com', '$2a$10$mkSFrgK2f7tTxHGwqcwLCue7aPqCZ8hLt7DncundDP8MbN0cU62Sm', 'teacher', 1985, NULL, 'Trường THPT ABC', '0123456789'),
('Trần Thị B', 'student@example.com', '$2a$10$mkSFrgK2f7tTxHGwqcwLCue7aPqCZ8hLt7DncundDP8MbN0cU62Sm', 'student', 2005, '12A1', 'Trường THPT XYZ', '0987654321')
ON DUPLICATE KEY UPDATE name=name;
