-- Migration: 013_add_dates_to_exam_rooms.sql
-- Description: Thêm cột start_date và end_date vào bảng exam_rooms

ALTER TABLE exam_rooms 
ADD COLUMN start_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Ngày giờ bắt đầu cho phép thi' AFTER password,
ADD COLUMN end_date DATETIME NOT NULL DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 1 DAY)) COMMENT 'Ngày giờ kết thúc cho phép thi' AFTER start_date;



