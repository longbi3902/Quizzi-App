# Quizzi App - Web Thi Trắc Nghiệm

Dự án web thi trắc nghiệm với:
- **Backend**: Node.js, Express.js, TypeScript
- **Frontend**: React.js, Material-UI (MUI)
- **Database**: MySQL (hiện tại đang dùng fake data)

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
- ✅ Đăng nhập
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

## Lưu ý

- Hiện tại đang sử dụng **fake data** (in-memory) thay vì MySQL
- Các phần code liên quan đến MySQL đã được comment lại với TODO
- Khi sẵn sàng kết nối MySQL, uncomment các phần code đã được đánh dấu

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

