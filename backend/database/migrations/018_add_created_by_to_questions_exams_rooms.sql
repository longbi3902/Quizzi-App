-- Migration: 018_add_created_by_to_questions_exams_rooms.sql
-- Description: Thêm cột created_by (user_id) vào bảng questions, exams, exam_rooms để phân quyền dữ liệu

-- Thêm created_by vào bảng questions
ALTER TABLE questions
ADD COLUMN created_by INT NULL COMMENT 'ID người tạo (giáo viên)' AFTER subject_id;

-- Thêm foreign key
ALTER TABLE questions
ADD CONSTRAINT fk_questions_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Thêm index
CREATE INDEX idx_questions_created_by ON questions(created_by);

-- Thêm created_by vào bảng exams
ALTER TABLE exams
ADD COLUMN created_by INT NULL COMMENT 'ID người tạo (giáo viên)' AFTER max_score;

-- Thêm foreign key
ALTER TABLE exams
ADD CONSTRAINT fk_exams_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Thêm index
CREATE INDEX idx_exams_created_by ON exams(created_by);

-- Thêm created_by vào bảng exam_rooms
ALTER TABLE exam_rooms
ADD COLUMN created_by INT NULL COMMENT 'ID người tạo (giáo viên)' AFTER end_date;

-- Thêm foreign key
ALTER TABLE exam_rooms
ADD CONSTRAINT fk_exam_rooms_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;

-- Thêm index
CREATE INDEX idx_exam_rooms_created_by ON exam_rooms(created_by);

-- Cập nhật các record hiện tại: gán created_by cho user có role teacher đầu tiên (nếu có)
-- Hoặc có thể để NULL nếu không có giáo viên nào
UPDATE questions q
SET q.created_by = (SELECT id FROM users WHERE role = 'teacher' LIMIT 1)
WHERE q.created_by IS NULL;

UPDATE exams e
SET e.created_by = (SELECT id FROM users WHERE role = 'teacher' LIMIT 1)
WHERE e.created_by IS NULL;

UPDATE exam_rooms er
SET er.created_by = (SELECT id FROM users WHERE role = 'teacher' LIMIT 1)
WHERE er.created_by IS NULL;



