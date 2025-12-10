-- Migration: 006_add_difficulty_to_questions.sql
-- Description: Thêm cột difficulty (độ khó) vào bảng questions
-- 1: Nhận biết, 2: Thông hiểu, 3: Vận dụng, 4: Vận dụng cao

ALTER TABLE questions 
ADD COLUMN difficulty INT NOT NULL DEFAULT 1 
COMMENT 'Độ khó: 1=Nhận biết, 2=Thông hiểu, 3=Vận dụng, 4=Vận dụng cao';

-- Thêm index cho độ khó để tìm kiếm nhanh hơn
CREATE INDEX idx_difficulty ON questions(difficulty);

