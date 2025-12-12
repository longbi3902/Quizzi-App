# Database Setup

## Cài đặt Database

1. Đảm bảo MySQL đã được cài đặt và đang chạy

2. Chạy file SQL để tạo database và các bảng:

```bash
mysql -u root -p < database/schema.sql
```

Hoặc mở MySQL Workbench/phpMyAdmin và chạy nội dung file `schema.sql`

## Cấu hình

File `.env` trong thư mục `backend/` (tạo từ `.env.example`):

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12345
DB_NAME=quizziapp
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
```

## Cấu trúc Database

### Bảng `users`
- Lưu thông tin người dùng (giáo viên và học sinh)
- Có dữ liệu mẫu: teacher@example.com và student@example.com (password: 123456)

### Bảng `questions`
- Lưu thông tin câu hỏi

### Bảng `answers`
- Lưu thông tin đáp án
- Có foreign key đến `questions` với CASCADE delete

## Kiểm tra kết nối

Khi khởi động server, nếu kết nối thành công sẽ thấy:
```
✅ Kết nối MySQL thành công!
✅ Server is running on port 5000
```




