-- Migration: 012_add_code_to_exam_rooms.sql
-- Description: Thêm cột code vào bảng exam_rooms để lưu mã phòng thi tự động sinh

-- Cập nhật code cho các phòng thi đã tồn tại (nếu có)
-- Sử dụng ID + random để đảm bảo unique
UPDATE exam_rooms 
SET code = CONCAT(
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  SUBSTRING('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', FLOOR(1 + RAND() * 36), 1),
  LPAD(id, 4, '0')
)
WHERE code IS NULL OR code = '';

-- Sau khi đảm bảo tất cả có code, đặt NOT NULL và UNIQUE
ALTER TABLE exam_rooms 
MODIFY COLUMN code VARCHAR(20) NOT NULL UNIQUE;

