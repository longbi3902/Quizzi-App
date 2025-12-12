-- Tạo database nếu chưa có
CREATE DATABASE IF NOT EXISTS quizziapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE quizziapp;

-- Bảng users
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

-- Bảng questions
CREATE TABLE IF NOT EXISTS questions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content TEXT NOT NULL,
  image VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng answers
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

-- Insert dữ liệu mẫu cho users (password: 123456)
INSERT INTO users (name, email, password, role, birth_year, class_name, school, phone) VALUES
('Nguyễn Văn A', 'teacher@example.com', '$2a$10$mkSFrgK2f7tTxHGwqcwLCue7aPqCZ8hLt7DncundDP8MbN0cU62Sm', 'teacher', 1985, NULL, 'Trường THPT ABC', '0123456789'),
('Trần Thị B', 'student@example.com', '$2a$10$mkSFrgK2f7tTxHGwqcwLCue7aPqCZ8hLt7DncundDP8MbN0cU62Sm', 'student', 2005, '12A1', 'Trường THPT XYZ', '0987654321')
ON DUPLICATE KEY UPDATE name=name;




