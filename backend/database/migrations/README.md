# Database Migrations

Thư mục này chứa các file migration để quản lý schema database.

## Cấu trúc

Mỗi file migration có format: `XXX_description.sql`
- `XXX`: Số thứ tự migration (001, 002, 003...)
- `description`: Mô tả ngắn gọn về migration

## Danh sách Migrations

1. **001_create_users_table.sql** - Tạo bảng users
2. **002_create_questions_table.sql** - Tạo bảng questions
3. **003_create_answers_table.sql** - Tạo bảng answers với foreign key
4. **004_create_migrations_table.sql** - Tạo bảng migrations để tracking
5. **005_insert_sample_users.sql** - Thêm dữ liệu mẫu

## Chạy Migrations

### Cách 1: Chạy thủ công từng file
```bash
mysql -u root -p quizziapp < database/migrations/001_create_users_table.sql
mysql -u root -p quizziapp < database/migrations/002_create_questions_table.sql
mysql -u root -p quizziapp < database/migrations/003_create_answers_table.sql
mysql -u root -p quizziapp < database/migrations/004_create_migrations_table.sql
mysql -u root -p quizziapp < database/migrations/005_insert_sample_users.sql
```

### Cách 2: Sử dụng script migration runner
```bash
npm run migrate
```

## Lưu ý

- Chạy migrations theo thứ tự số (001, 002, 003...)
- Migration 004 phải chạy sau 001, 002, 003 để tracking hoạt động
- Không sửa các migration đã chạy, chỉ tạo migration mới






