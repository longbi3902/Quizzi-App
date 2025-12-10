# Quizzi App - Web Thi Trắc Nghiệm

Dự án web thi trắc nghiệm với:
- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React.js, Material-UI (MUI)
- **Database**: MySQL

## 📚 Tài liệu

- [Cơ chế Authentication và Phiên Đăng Nhập](./AUTHENTICATION.md) - Chi tiết về JWT, Access Token, Refresh Token

## Cài đặt

### 1. Cài đặt dependencies cho tất cả

```bash
npm run install:all
```

Hoặc cài đặt riêng:

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Chạy ứng dụng

### Chạy Backend
```bash
npm run dev:backend
```
Backend sẽ chạy tại: http://localhost:5000

### Swagger API Documentation
Sau khi chạy backend, truy cập Swagger UI tại:
- **Swagger UI**: http://localhost:5000/api-docs

Swagger cung cấp:
- 📖 Tài liệu API đầy đủ
- 🧪 Test API trực tiếp trên trình duyệt
- 📋 Xem request/response schemas
- 🔍 Tìm kiếm endpoints dễ dàng

### Chạy Frontend
```bash
npm run dev:frontend
```
Frontend sẽ chạy tại: http://localhost:3000

## Tính năng hiện tại

### Authentication
- ✅ Đăng ký tài khoản (Teacher/Student)
- ✅ Đăng nhập với Access Token (15 phút) và Refresh Token (30 ngày)
- ✅ Tự động refresh token khi hết hạn
- ✅ Giữ đăng nhập khi reload trang
- ✅ Quản lý session với JWT

### Form đăng ký
- Tên (bắt buộc)
- Email (bắt buộc)
- Mật khẩu (bắt buộc)
- Vai trò: Teacher hoặc Student (bắt buộc)
- Năm sinh (không bắt buộc)
- Lớp (không bắt buộc)
- Trường (bắt buộc)
- Số điện thoại (không bắt buộc)

### Quản lý Câu hỏi
- ✅ Tạo, xem, sửa, xóa câu hỏi
- ✅ Quản lý đáp án (thêm, xóa, đánh dấu đáp án đúng)
- ✅ Độ khó: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao
- ✅ Upload ảnh cho câu hỏi (không bắt buộc)

### Quản lý Đề thi
- ✅ Tạo đề thi tự chọn câu hỏi
- ✅ Tạo đề thi random theo độ khó
- ✅ Quản lý đề thi (xem, sửa, xóa)
- ✅ Validation tổng điểm

## Database

### Chạy Migrations

```bash
cd backend
npm run migrate
```

Migrations sẽ tự động:
- Tạo các bảng cần thiết
- Bỏ qua các migration đã chạy
- Tracking qua bảng `migrations`

### Cấu hình Database

Tạo file `.env` trong thư mục `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12345
DB_NAME=quizziapp
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
```

## Lưu ý

## Tài khoản mẫu

- **Teacher**: 
  - Email: `teacher@example.com`
  - Password: `123456`

- **Student**: 
  - Email: `student@example.com`
  - Password: `123456`

## Cấu trúc dự án

```
QuizziApp/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── swagger.ts
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── types/
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
└── package.json
```

