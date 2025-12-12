# Cơ chế Authentication và Phiên Đăng Nhập

## Tổng quan

Hệ thống sử dụng **JWT (JSON Web Token)** với cơ chế **Access Token** và **Refresh Token** để quản lý phiên đăng nhập.

## Cơ chế hoạt động

### 1. Đăng nhập (Login)

Khi user đăng nhập thành công:

1. **Backend tạo 2 tokens:**
   - **Access Token**: Hết hạn sau **15 phút**
     - Dùng để xác thực các API requests
     - Được gửi kèm trong header: `Authorization: Bearer <accessToken>`
   - **Refresh Token**: Hết hạn sau **30 ngày**
     - Dùng để lấy lại access token mới khi access token hết hạn
     - Được lưu trong database (bảng `refresh_tokens`)

2. **Frontend lưu vào localStorage:**
   - `user`: Thông tin user (JSON)
   - `accessToken`: Access token
   - `refreshToken`: Refresh token

### 2. Sử dụng Access Token

Khi gọi API:
- Frontend tự động thêm header: `Authorization: Bearer <accessToken>`
- Backend verify access token
- Nếu hợp lệ → cho phép truy cập
- Nếu hết hạn → trả về 401

### 3. Tự động Refresh Token

**Khi nào refresh token tự động chạy:**

1. **Khi khởi động app (reload trang):**
   - Load tokens từ localStorage
   - Kiểm tra access token có hết hạn không
   - Nếu hết hạn → gọi API `/api/auth/refresh` ngay
   - Nếu còn hạn → đặt timer để refresh trước khi hết hạn (buffer 1 phút)

2. **Khi access token sắp hết hạn:**
   - Timer tự động gọi refresh trước 1 phút
   - Lấy access token mới
   - Cập nhật localStorage

3. **Khi API trả về 401 (Unauthorized):**
   - Tự động gọi refresh token
   - Thử lại request với access token mới

### 4. Kiểm tra Token hết hạn

**Cách check:**
- Decode JWT token (không cần verify)
- Lấy field `exp` (expiration time)
- So sánh với thời gian hiện tại
- Có buffer 1 phút để refresh trước khi hết hạn

**Code:**
```typescript
// frontend/src/utils/tokenUtils.ts
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  const expirationTime = decoded.exp * 1000; // Convert to milliseconds
  const currentTime = Date.now();
  const bufferTime = 60 * 1000; // 1 phút buffer
  
  return currentTime >= expirationTime - bufferTime;
};
```

### 5. Khi Refresh Token hết hạn

Nếu refresh token hết hạn hoặc không hợp lệ:
- Tự động logout
- Xóa tất cả tokens khỏi localStorage
- Xóa refresh token khỏi database
- Redirect về trang login

### 6. Đăng xuất (Logout)

Khi user đăng xuất:
1. Gọi API `/api/auth/logout` với refresh token
2. Backend xóa refresh token khỏi database
3. Frontend xóa tất cả tokens khỏi localStorage
4. Clear state trong AuthContext

## Luồng hoạt động chi tiết

### Luồng đăng nhập:

```
User nhập email/password
    ↓
POST /api/auth/login
    ↓
Backend verify password
    ↓
Tạo Access Token (15 phút)
Tạo Refresh Token (30 ngày)
Lưu Refresh Token vào DB
    ↓
Trả về: { user, accessToken, refreshToken }
    ↓
Frontend lưu vào localStorage
    ↓
User đã đăng nhập ✅
```

### Luồng reload trang:

```
User reload trang
    ↓
AuthContext mount
    ↓
Load từ localStorage:
  - user
  - accessToken
  - refreshToken
    ↓
Kiểm tra accessToken hết hạn?
    ├─ CÓ → Gọi /api/auth/refresh
    │         ├─ Thành công → Cập nhật accessToken mới
    │         └─ Thất bại → Logout, redirect /login
    │
    └─ KHÔNG → Đặt timer refresh trước 1 phút
    ↓
ProtectedRoute check user
    ├─ Có user → Cho phép truy cập
    └─ Không có → Redirect /login
```

### Luồng gọi API:

```
Frontend gọi API
    ↓
Kiểm tra accessToken hết hạn?
    ├─ CÓ → Gọi /api/auth/refresh trước
    │         → Cập nhật accessToken
    │
    └─ KHÔNG → Dùng accessToken hiện tại
    ↓
Gửi request với header: Authorization: Bearer <accessToken>
    ↓
Backend verify token
    ├─ Hợp lệ → Trả về data
    │
    └─ 401 Unauthorized → Frontend tự động refresh
                          → Thử lại request
```

## Thời gian hết hạn

| Token | Thời gian hết hạn | Mục đích |
|-------|-------------------|----------|
| **Access Token** | 15 phút | Xác thực API requests |
| **Refresh Token** | 30 ngày | Lấy lại access token mới |

## Lưu trữ

### Frontend (localStorage):
- `user`: Thông tin user (JSON string)
- `accessToken`: Access token (JWT string)
- `refreshToken`: Refresh token (JWT string)

### Backend (Database):
- Bảng `refresh_tokens`:
  - `user_id`: ID của user
  - `token`: Refresh token
  - `expires_at`: Thời gian hết hạn
  - `created_at`: Thời gian tạo

## Bảo mật

1. **Access Token ngắn hạn (15 phút):**
   - Giảm thiểu rủi ro nếu bị lộ
   - Tự động refresh khi hết hạn

2. **Refresh Token dài hạn (30 ngày):**
   - Lưu trong database để có thể revoke
   - Xóa khi logout
   - Xóa khi hết hạn

3. **Tự động cleanup:**
   - Xóa các refresh token đã hết hạn khỏi database

## API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập
  - Request: `{ email, password }`
  - Response: `{ user, accessToken, refreshToken }`

- `POST /api/auth/register` - Đăng ký
  - Request: `{ name, email, password, role, ... }`
  - Response: `{ user, accessToken, refreshToken }`

- `POST /api/auth/refresh` - Refresh access token
  - Request: `{ refreshToken }`
  - Response: `{ accessToken }`

- `POST /api/auth/logout` - Đăng xuất
  - Request: `{ refreshToken }`
  - Response: `{ success: true }`

## Troubleshooting

### Vấn đề: Reload trang bị đẩy ra login

**Nguyên nhân:**
- AuthContext chưa kịp load từ localStorage
- ProtectedRoute check user trước khi load xong

**Giải pháp:**
- Thêm `isLoading` state trong AuthContext
- ProtectedRoute đợi `isLoading = false` mới check user
- Hiển thị loading spinner trong lúc chờ

### Vấn đề: Token hết hạn nhưng không tự động refresh

**Nguyên nhân:**
- Timer refresh không chạy
- Refresh token đã hết hạn

**Giải pháp:**
- Kiểm tra refresh token còn hạn không
- Kiểm tra timer có được set đúng không
- Check network request có lỗi không

## Tóm tắt

✅ **Access Token**: 15 phút, dùng cho API requests  
✅ **Refresh Token**: 30 ngày, dùng để lấy access token mới  
✅ **Tự động refresh**: Khi sắp hết hạn hoặc nhận 401  
✅ **Lưu localStorage**: Giữ đăng nhập khi reload  
✅ **Bảo mật**: Access token ngắn hạn, refresh token có thể revoke  




