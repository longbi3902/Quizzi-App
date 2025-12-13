-- Migration: 024_remove_exam_room_id_from_exam_results.sql
-- Description: Cho phép exam_room_id là NULL và cập nhật constraints vì đã chuyển sang dùng class_id và exam_id

-- Bước 1: Xóa unique constraint cũ (unique_user_exam_room)
-- Migration script sẽ bỏ qua lỗi nếu index không tồn tại
ALTER TABLE exam_results DROP INDEX unique_user_exam_room;

-- Bước 2: Thử xóa foreign key constraint (MySQL tự tạo tên, thử các tên phổ biến)
-- Migration script sẽ bỏ qua lỗi nếu không tồn tại
-- MySQL thường tạo tên như exam_results_ibfk_N (N là số thứ tự)
ALTER TABLE exam_results DROP FOREIGN KEY exam_results_ibfk_2;
-- Nếu tên khác, có thể cần chạy thủ công: SHOW CREATE TABLE exam_results; để xem tên chính xác

-- Bước 3: Cho phép exam_room_id là NULL
ALTER TABLE exam_results
MODIFY COLUMN exam_room_id INT NULL COMMENT 'ID phòng thi (deprecated - không dùng nữa)';

-- Bước 4: Tạo unique constraint mới dựa trên class_id và exam_id
-- Migration script sẽ bỏ qua lỗi nếu constraint đã tồn tại
ALTER TABLE exam_results 
ADD UNIQUE KEY unique_user_class_exam (user_id, class_id, exam_id) 
COMMENT 'Mỗi học sinh chỉ được làm 1 lần mỗi đề thi trong mỗi lớp';

