-- Migration: 022_update_exam_results_add_class_id.sql
-- Description: Thêm cột class_id vào exam_results và migrate dữ liệu từ exam_room_id

-- Thêm cột class_id (nullable trước, sau đó sẽ migrate dữ liệu)
ALTER TABLE exam_results
ADD COLUMN class_id INT NULL COMMENT 'ID lớp học' AFTER user_id;

-- Thêm foreign key và index
ALTER TABLE exam_results
ADD CONSTRAINT fk_exam_results_class
FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

CREATE INDEX idx_exam_results_class_id ON exam_results(class_id);

-- Migrate dữ liệu: Lấy class_id từ exam_room_id
UPDATE exam_results er
INNER JOIN exam_rooms er_old ON er.exam_room_id = er_old.id
INNER JOIN classes c ON c.code = er_old.code
SET er.class_id = c.id
WHERE er.class_id IS NULL;

-- Sau khi migrate xong, có thể xóa cột exam_room_id (nhưng để lại để backup tạm thời)
-- ALTER TABLE exam_results DROP COLUMN exam_room_id;
-- ALTER TABLE exam_results DROP FOREIGN KEY fk_exam_results_exam_room;


