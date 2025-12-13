# Frontend - Quizzi App

## 📁 Cấu trúc thư mục

```
src/
├── constants/          # Các hằng số, cấu hình
│   └── api.ts         # URL API endpoints
├── contexts/           # React Context (quản lý state global)
│   └── AuthContext.tsx # Context quản lý đăng nhập/đăng ký
├── pages/              # Các trang (components chính)
│   ├── Login.tsx      # Trang đăng nhập
│   ├── Register.tsx   # Trang đăng ký
│   └── Home.tsx       # Trang chủ (sau khi đăng nhập)
├── types/             # Định nghĩa kiểu dữ liệu TypeScript
│   └── user.types.ts  # Kiểu dữ liệu cho User
├── utils/              # Các hàm tiện ích
│   └── validation.ts  # Hàm validation (kiểm tra dữ liệu)
├── App.tsx            # Component chính
└── index.tsx          # Entry point
```

## 🎯 Các khái niệm React cần biết

### 1. **Component**
- Component là một phần của UI (giao diện)
- Ví dụ: `Login`, `Register`, `Home` là các components
- Component có thể tái sử dụng

### 2. **State (Trạng thái)**
- State là dữ liệu có thể thay đổi trong component
- Dùng `useState` để tạo state
- Khi state thay đổi, component sẽ tự động re-render

```typescript
const [email, setEmail] = useState<string>('');
// email: giá trị hiện tại
// setEmail: hàm để thay đổi giá trị
```

### 3. **Props**
- Props là dữ liệu truyền từ component cha sang component con
- Props là read-only (chỉ đọc, không thay đổi)

### 4. **Context**
- Context dùng để chia sẻ dữ liệu giữa các component
- Tránh phải truyền props qua nhiều cấp (prop drilling)
- `AuthContext` quản lý thông tin đăng nhập

### 5. **Hooks**
- Hooks là các hàm đặc biệt trong React
- Bắt đầu bằng chữ `use`
- Ví dụ: `useState`, `useEffect`, `useContext`

### 6. **useEffect**
- Chạy sau khi component render
- Dùng để: fetch data, subscribe, cleanup, ...

```typescript
useEffect(() => {
  // Code chạy sau khi component mount
}, []); // [] = chỉ chạy 1 lần
```

### 7. **Event Handler**
- Hàm xử lý sự kiện (click, submit, change, ...)
- Thường bắt đầu bằng `handle`

```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault(); // Ngăn form submit mặc định
  // Xử lý logic
};
```

### 8. **Async/Await**
- Xử lý các tác vụ bất đồng bộ (API calls, ...)
- `async`: đánh dấu hàm là bất đồng bộ
- `await`: đợi kết quả trả về

```typescript
const login = async (email: string, password: string) => {
  const response = await fetch(API_URL);
  const data = await response.json();
};
```

## 🔄 Luồng hoạt động

### Đăng nhập:
1. User nhập email/password → `Login.tsx`
2. Click "Đăng Nhập" → gọi `handleSubmit`
3. `handleSubmit` gọi `login()` từ `AuthContext`
4. `AuthContext` gửi request đến backend
5. Nếu thành công: lưu user/token → chuyển đến `/home`
6. Nếu thất bại: hiển thị lỗi

### Đăng ký:
1. User điền form → `Register.tsx`
2. Click "Đăng Ký" → `handleSubmit`
3. Validate form (kiểm tra dữ liệu)
4. Gọi `register()` từ `AuthContext`
5. Tương tự như đăng nhập

### Bảo vệ Route:
- `ProtectedRoute` kiểm tra user đã đăng nhập chưa
- Nếu chưa → chuyển về `/login`
- Nếu rồi → hiển thị component

## 📝 Các file quan trọng

### `AuthContext.tsx`
- Quản lý state: `user`, `token`
- Cung cấp: `login()`, `register()`, `logout()`
- Lưu vào `localStorage` để giữ đăng nhập

### `constants/api.ts`
- Chứa URL API
- Dễ thay đổi khi deploy

### `utils/validation.ts`
- Các hàm kiểm tra dữ liệu
- Tái sử dụng được

## 🚀 Cách chạy

```bash
npm install  # Cài đặt dependencies
npm start    # Chạy development server
```

## 💡 Tips cho người mới học

1. **Đọc code từ trên xuống dưới**
2. **Xem comments để hiểu từng phần**
3. **Thử thay đổi giá trị và xem kết quả**
4. **Dùng console.log() để debug**
5. **Đọc lỗi trong console để hiểu vấn đề**

## 🔍 Debug

- Mở Developer Tools (F12)
- Tab Console: xem lỗi JavaScript
- Tab Network: xem API requests
- Tab React DevTools: xem component tree và state












