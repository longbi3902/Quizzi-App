-- Migration: 017_add_grade_and_subject_to_questions.sql
-- Description: Thêm cột grade (khối) và subject_id (môn học) vào bảng questions

ALTER TABLE questions
ADD COLUMN grade INT NULL COMMENT 'Khối lớp (1-12)' AFTER difficulty,
ADD COLUMN subject_id INT NULL COMMENT 'ID môn học' AFTER grade;

-- Thêm foreign key
ALTER TABLE questions
ADD CONSTRAINT fk_questions_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE SET NULL;

-- Thêm index
CREATE INDEX idx_grade ON questions(grade);
CREATE INDEX idx_subject_id ON questions(subject_id);

