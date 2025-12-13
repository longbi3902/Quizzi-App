-- Migration: 005_insert_sample_users.sql
-- Description: Thêm dữ liệu mẫu cho users (password: 123456)

INSERT INTO users (name, email, password, role, birth_year, class_name, school, phone) VALUES
('Nguyễn Văn A', 'teacher@example.com', '$2a$10$mkSFrgK2f7tTxHGwqcwLCue7aPqCZ8hLt7DncundDP8MbN0cU62Sm', 'teacher', 1985, NULL, 'Trường THPT ABC', '0123456789'),
('Trần Thị B', 'student@example.com', '$2a$10$mkSFrgK2f7tTxHGwqcwLCue7aPqCZ8hLt7DncundDP8MbN0cU62Sm', 'student', 2005, '12A1', 'Trường THPT XYZ', '0987654321')
ON DUPLICATE KEY UPDATE name=name;






