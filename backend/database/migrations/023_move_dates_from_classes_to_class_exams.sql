-- Migration: 023_move_dates_from_classes_to_class_exams.sql
-- Description: Di chuyển start_date và end_date từ classes sang class_exams

-- Bước 1: Thêm start_date và end_date vào class_exams
ALTER TABLE class_exams
ADD COLUMN start_date DATETIME NULL COMMENT 'Ngày giờ bắt đầu cho phép thi',
ADD COLUMN end_date DATETIME NULL COMMENT 'Ngày giờ kết thúc cho phép thi';

-- Bước 2: Migrate dữ liệu từ classes sang class_exams
-- Mỗi class_exam sẽ lấy start_date và end_date từ class tương ứng
UPDATE class_exams ce
INNER JOIN classes c ON ce.class_id = c.id
SET ce.start_date = c.start_date,
    ce.end_date = c.end_date;

-- Bước 3: Đặt NOT NULL cho start_date và end_date (sau khi đã migrate)
ALTER TABLE class_exams
MODIFY COLUMN start_date DATETIME NOT NULL COMMENT 'Ngày giờ bắt đầu cho phép thi',
MODIFY COLUMN end_date DATETIME NOT NULL COMMENT 'Ngày giờ kết thúc cho phép thi';

-- Bước 4: Xóa start_date và end_date khỏi classes
ALTER TABLE classes
DROP COLUMN start_date,
DROP COLUMN end_date;

