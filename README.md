# Quizzi App - Hệ Thống Thi Trắc Nghiệm Trực Tuyến

## 📋 Mục Lục

1. [Tổng Quan Hệ Thống](#tổng-quan-hệ-thống)
2. [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
3. [Tính Năng Chính](#tính-năng-chính)
4. [Logic Cá Nhân Hóa](#logic-cá-nhân-hóa-data-isolation)
5. [Luồng Nghiệp Vụ](#luồng-nghiệp-vụ)
6. [Cấu Trúc Database](#cấu-trúc-database)
7. [API Endpoints](#api-endpoints)
8. [Cài Đặt và Chạy](#cài-đặt-và-chạy)
9. [Cấu Trúc Dự Án](#cấu-trúc-dự-án)

---

## 🎯 Tổng Quan Hệ Thống

**Quizzi App** là hệ thống thi trắc nghiệm trực tuyến cho phép giáo viên tạo và quản lý đề thi, phòng thi, đồng thời cho phép học sinh tham gia thi và xem kết quả.

### Đối Tượng Sử Dụng

- **Giáo Viên (Teacher)**: Quản lý câu hỏi, đề thi, phòng thi, xem lịch sử thi của học sinh
- **Học Sinh (Student)**: Tham gia phòng thi, làm bài, xem kết quả

---

## 🛠 Công Nghệ Sử Dụng

### Backend
- **Node.js** + **Express.js**: Framework web server
- **TypeScript**: Type-safe programming
- **MySQL**: Database quan hệ
- **JWT**: Authentication và Authorization
- **Swagger**: API documentation

### Frontend
- **React.js**: UI framework
- **TypeScript**: Type-safe programming
- **Material-UI (MUI)**: Component library
- **React Router**: Client-side routing
- **Context API**: State management

---

## ✨ Tính Năng Chính

### 1. Authentication & Authorization
- ✅ Đăng ký tài khoản (Teacher/Student)
- ✅ Đăng nhập với JWT (Access Token + Refresh Token)
- ✅ Tự động refresh token khi hết hạn
- ✅ Giữ đăng nhập khi reload trang
- ✅ Protected routes theo role
- ✅ Cập nhật thông tin cá nhân (Teacher & Student)
- ✅ Validation số điện thoại (định dạng Việt Nam: 10 số, bắt đầu bằng 03, 05, 07, 08, hoặc 09)

### 2. Quản Lý Câu Hỏi (Teacher)
- ✅ **CRUD câu hỏi**: Tạo, xem, sửa, xóa
- ✅ **Quản lý đáp án**: Thêm, xóa, đánh dấu đáp án đúng/sai
- ✅ **Phân loại câu hỏi**:
  - Độ khó: Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao
  - Khối lớp: 1-12
  - Môn học: Toán, Lý, Văn, Sử, Địa, Hóa, Tin, Anh, Sinh
- ✅ Upload ảnh cho câu hỏi (không bắt buộc)
- ✅ Phân trang danh sách câu hỏi
- ✅ Tìm kiếm và lọc theo nội dung câu hỏi, môn học, khối lớp (1-12), độ khó (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)

### 3. Quản Lý Đề Thi (Teacher)
- ✅ **Tạo đề thi tự chọn**: Chọn từng câu hỏi và gán điểm
- ✅ **Tạo đề thi random**: Tự động chọn câu hỏi theo:
  - Số lượng câu hỏi mỗi mức độ (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao)
  - Lọc theo khối lớp (tùy chọn)
  - Lọc theo môn học (tùy chọn)
- ✅ **Quản lý đề thi**: Xem, sửa, xóa
- ✅ **Mã đề thi**: Tạo nhiều mã đề cho một đề thi (đảo thứ tự câu hỏi)
- ✅ Phân trang danh sách đề thi
- ✅ Tìm kiếm theo tên đề thi

### 4. Quản Lý Lớp Học (Teacher)
- ✅ **CRUD lớp học**: Tạo, xem, sửa, xóa
- ✅ **Thông tin lớp học**:
  - Tên lớp học
  - Mật khẩu lớp học
  - Mã lớp học (tự động sinh, 6 ký tự ngẫu nhiên)
  - Nhiều đề thi có thể được thêm vào lớp học
  - **Thời gian bắt đầu và kết thúc**: Gắn với từng đề thi riêng biệt (trong bảng `class_exams`)
- ✅ **Quản lý đề thi trong lớp**:
  - Thêm đề thi có sẵn vào lớp
  - Tạo đề thi mới trực tiếp trong trang chi tiết lớp (tự chọn câu hỏi hoặc random)
  - Gán thời gian bắt đầu/kết thúc cho từng đề thi
  - Xóa đề thi khỏi lớp
- ✅ Phân trang danh sách lớp học
- ✅ Tìm kiếm theo tên lớp hoặc mã lớp

### 5. Tham Gia Thi (Student)
- ✅ **Tham gia lớp học**: Nhập mã lớp học và mật khẩu
- ✅ **Xem danh sách lớp học đã tham gia**: Hiển thị trên trang chủ
- ✅ **Kiểm tra thời gian thi** (theo từng đề thi):
  - Chưa đến thời gian bắt đầu: Hiển thị "Chưa đến thời gian bắt đầu thi"
  - Đã hết thời gian: Hiển thị "Đã hết thời gian thi"
  - Trong thời gian thi: Hiển thị nút "Bắt đầu thi"
- ✅ **Làm bài thi**:
  - Hệ thống tự động gán mã đề ngẫu nhiên (nếu đề thi có nhiều mã đề)
  - Hiển thị tất cả câu hỏi trên một trang
  - Mỗi câu hỏi hiển thị điểm số
  - Timer đếm ngược thời gian
  - Tự động nộp bài khi hết giờ
- ✅ **Chấm điểm tự động**: Sau khi nộp bài, hệ thống tự động chấm và hiển thị kết quả
- ✅ **Chọn đề thi**: Học sinh chọn đề thi từ danh sách đề thi trong lớp
- ✅ **Xem kết quả**:
  - Nếu chưa hết thời gian thi: Chỉ xem đáp án đã chọn
  - Nếu đã hết thời gian thi: Xem đáp án đã chọn và đáp án đúng
- ✅ **Không cho phép thi lại**: Mỗi học sinh chỉ được thi một lần cho mỗi đề thi trong lớp

### 6. Lịch Sử Thi (Teacher)
- ✅ **Xem lịch sử thi của học sinh** theo lớp học và đề thi
- ✅ **Thông tin hiển thị**:
  - Tên học sinh
  - Email
  - Điểm số
  - Thời gian làm bài
  - Thời gian bắt đầu và nộp bài
  - Mã đề thi (nếu có)
- ✅ **Bộ lọc và sắp xếp**:
  - Lọc theo tên học sinh
  - Sắp xếp theo điểm (tăng/giảm)
  - Sắp xếp theo thời gian làm bài (tăng/giảm)
  - Sắp xếp theo thời gian bắt đầu (mới nhất/cũ nhất)
- ✅ **Xem chi tiết bài làm**:
  - Thông tin học sinh (2 cột)
  - Danh sách câu hỏi với đáp án học sinh chọn
  - Đánh dấu đúng/sai
  - Hiển thị đáp án đúng (nếu sai)
- ✅ Phân trang danh sách kết quả

### 7. Lịch Sử Thi (Student)
- ✅ Xem danh sách các lớp học đã tham gia
- ✅ Xem kết quả thi của từng đề thi trong lớp
- ✅ Xem chi tiết bài làm đã nộp

---

## 🔐 Logic Cá Nhân Hóa (Data Isolation)

Hệ thống đảm bảo mỗi người dùng chỉ có thể xem và thao tác với dữ liệu của chính mình thông qua cơ chế **cá nhân hóa dữ liệu** (Data Isolation).

### Nguyên Tắc Cơ Bản

1. **Mỗi bản ghi có trường `created_by`**: Lưu ID của người tạo (giáo viên)
2. **Filter theo `user_id`**: Tất cả queries đều filter theo `user_id` từ JWT token
3. **Authorization check**: Kiểm tra quyền sở hữu trước khi cho phép sửa/xóa

### Cơ Chế Cá Nhân Hóa Cho Giáo Viên

#### 1. Câu Hỏi (Questions)
- **Trường `created_by`**: Lưu ID giáo viên tạo câu hỏi
- **Filter trong queries**:
  ```sql
  SELECT * FROM questions WHERE created_by = ? [AND filters...]
  ```
- **Khi tạo mới**: Tự động lưu `created_by = userId` từ JWT token
- **Khi sửa/xóa**: Kiểm tra `created_by = userId` trước khi cho phép
- **Kết quả**: Giáo viên A chỉ thấy câu hỏi của giáo viên A

#### 2. Đề Thi (Exams)
- **Trường `created_by`**: Lưu ID giáo viên tạo đề thi
- **Filter trong queries**:
  ```sql
  SELECT * FROM exams WHERE created_by = ? [AND filters...]
  ```
- **Khi tạo mới**: Tự động lưu `created_by = userId`
- **Khi sửa/xóa**: Kiểm tra `created_by = userId` trước khi cho phép
- **Khi tạo đề thi random**: Chỉ lấy câu hỏi của chính giáo viên đó (filter `created_by`)
- **Kết quả**: Giáo viên A chỉ thấy đề thi của giáo viên A

#### 3. Lớp Học (Classes)
- **Trường `created_by`**: Lưu ID giáo viên tạo lớp học
- **Filter trong queries**:
  ```sql
  SELECT * FROM classes WHERE created_by = ? [AND filters...]
  ```
- **Khi tạo mới**: Tự động lưu `created_by = userId`
- **Khi thêm đề thi**: Chỉ hiển thị đề thi của chính giáo viên đó
- **Khi sửa/xóa**: Kiểm tra `created_by = userId` trước khi cho phép
- **Kết quả**: Giáo viên A chỉ thấy lớp học của giáo viên A

### Cơ Chế Cá Nhân Hóa Cho Học Sinh

#### 1. Lớp Học Đã Tham Gia
- **Bảng `class_participants`**: Lưu lịch sử tham gia lớp học
- **Filter theo `user_id`**:
  ```sql
  SELECT c.* FROM class_participants cp
  INNER JOIN classes c ON cp.class_id = c.id
  WHERE cp.user_id = ?
  ```
- **Khi tham gia lớp học**: Tự động insert vào `class_participants`
- **Kết quả**: Học sinh chỉ thấy lớp học mà mình đã tham gia

#### 2. Kết Quả Thi
- **Bảng `exam_results`**: Lưu kết quả thi của học sinh
- **Filter theo `user_id`**:
  ```sql
  SELECT * FROM exam_results WHERE user_id = ? AND class_id = ? AND exam_id = ?
  ```
- **Khi làm bài**: Tự động lưu `user_id` từ JWT token
- **Khi xem kết quả**: Chỉ lấy kết quả của chính học sinh đó
- **Kết quả**: Học sinh chỉ thấy kết quả thi của mình

#### 3. Xem Lớp Học và Đề Thi
- **Logic đặc biệt**: Khi học sinh xem lớp học đã tham gia, hệ thống **không filter theo `created_by`**
- **Lý do**: Học sinh cần xem lớp học và đề thi của giáo viên khác (nếu đã tham gia)
- **Implementation**:
  ```typescript
  // Trong ClassService.findByIdForStudent()
  // Không filter theo created_by cho học sinh
  ```
- **Kết quả**: Học sinh có thể xem lớp học và đề thi mà mình đã tham gia, bất kể ai tạo

### Luồng Xử Lý Request

#### Backend Flow
```
1. Request đến API endpoint
2. Middleware authenticateToken() → Lấy JWT token
3. Middleware getUserIdFromToken() → Extract userId từ token
4. Controller → Truyền userId vào Service
5. Service → Filter queries theo userId (hoặc created_by)
6. Response → Chỉ trả về dữ liệu của user đó
```

#### Frontend Flow
```
1. User đăng nhập → Lưu JWT token vào localStorage
2. Mỗi API call → apiClient tự động attach token vào header
3. Backend nhận token → Extract userId và filter data
4. Response → Chỉ nhận được dữ liệu của chính user đó
```

### Ví Dụ Cụ Thể

#### Ví dụ 1: Giáo viên A tạo câu hỏi
```
1. Giáo viên A đăng nhập → userId = 1
2. Tạo câu hỏi mới → INSERT INTO questions (..., created_by) VALUES (..., 1)
3. Khi xem danh sách → SELECT * FROM questions WHERE created_by = 1
4. Kết quả: Chỉ thấy câu hỏi của giáo viên A
```

#### Ví dụ 2: Giáo viên B không thấy câu hỏi của giáo viên A
```
1. Giáo viên B đăng nhập → userId = 2
2. Xem danh sách câu hỏi → SELECT * FROM questions WHERE created_by = 2
3. Kết quả: Chỉ thấy câu hỏi của giáo viên B (không thấy của giáo viên A)
```

#### Ví dụ 3: Học sinh tham gia lớp học của giáo viên A
```
1. Học sinh đăng nhập → userId = 10
2. Nhập mã lớp học → Verify thành công
3. Insert vào class_participants → (user_id=10, class_id=X)
4. Khi xem danh sách lớp học đã tham gia:
   SELECT c.* FROM class_participants cp
   INNER JOIN classes c ON cp.class_id = c.id
   WHERE cp.user_id = 10
5. Kết quả: Chỉ thấy lớp học mà học sinh đã tham gia
```

#### Ví dụ 4: Học sinh xem lớp học đã tham gia (không filter created_by)
```
1. Học sinh xem lớp học ID = 5 (của giáo viên A)
2. ClassService.findByIdForStudent(5) → Không filter theo created_by
3. Query: SELECT * FROM classes WHERE id = 5
4. Kết quả: Học sinh có thể xem lớp học của giáo viên A (vì đã tham gia)
```

### Bảo Mật

1. **JWT Token**: Mỗi request phải có valid JWT token
2. **User ID từ Token**: Không tin tưởng client, luôn lấy userId từ token
3. **SQL Injection Prevention**: Sử dụng prepared statements với parameters
4. **Authorization Check**: Kiểm tra quyền sở hữu trước khi sửa/xóa
5. **No Direct Access**: Không cho phép truy cập trực tiếp dữ liệu của người khác

### Migration và Backward Compatibility

- **Migration 018**: Thêm cột `created_by` vào các bảng `questions`, `exams`, `exam_rooms`
- **Default Value**: Các bản ghi cũ được gán `created_by` = ID của giáo viên đầu tiên
- **New Records**: Tất cả bản ghi mới tự động có `created_by` từ JWT token

---

## 🔄 Luồng Nghiệp Vụ

### Luồng Nghiệp Vụ - Giáo Viên

#### 1. Quản Lý Câu Hỏi
```
1. Đăng nhập với role Teacher
2. Vào "Quản lý câu hỏi"
3. Tạo câu hỏi mới:
   - Nhập nội dung câu hỏi
   - Chọn độ khó (Nhận biết/Thông hiểu/Vận dụng/Vận dụng cao)
   - Chọn khối lớp (1-12, tùy chọn)
   - Chọn môn học (tùy chọn)
   - Thêm ảnh (tùy chọn)
   - Thêm ít nhất 2 đáp án
   - Đánh dấu ít nhất 1 đáp án đúng
4. Lưu câu hỏi
5. Có thể sửa/xóa câu hỏi sau đó
```

#### 2. Tạo Đề Thi
```
1. Vào "Quản lý đề thi" > "Tạo đề thi mới"
2. Chọn một trong hai cách:

   Cách 1: Tự chọn câu hỏi
   - Nhập tên đề thi, thời gian, tổng điểm
   - Chọn số mã đề (nếu muốn tạo nhiều mã đề)
   - Lọc câu hỏi theo tên, môn, khối, độ khó
   - Chọn từng câu hỏi và gán điểm
   - Xem tổng điểm đã phân bổ
   - Lưu đề thi

   Cách 2: Random câu hỏi
   - Nhập tên đề thi, thời gian, tổng điểm
   - Nhập tổng số câu hỏi
   - Phân bổ số câu hỏi cho từng mức độ
   - Chọn khối lớp (tùy chọn) - chỉ lấy câu hỏi trong khối đó
   - Chọn môn học (tùy chọn) - chỉ lấy câu hỏi trong môn đó
   - Chọn số mã đề (nếu muốn tạo nhiều mã đề)
   - Hệ thống tự động chọn câu hỏi ngẫu nhiên
   - Lưu đề thi
```

#### 3. Tạo Lớp Học
```
1. Vào "Quản lý lớp học" > "Tạo lớp học mới"
2. Nhập thông tin:
   - Tên lớp học
   - Mật khẩu lớp học
3. Hệ thống tự động sinh mã lớp học (6 ký tự)
4. Lưu lớp học
5. Vào trang chi tiết lớp học để:
   - Xem/sửa thông tin lớp học
   - Xem danh sách học sinh đã tham gia
   - Quản lý đề thi:
     * Thêm đề thi có sẵn vào lớp
     * Tạo đề thi mới trực tiếp (tự chọn câu hỏi hoặc random)
     * Gán thời gian bắt đầu/kết thúc cho từng đề thi
     * Xóa đề thi khỏi lớp
```

#### 4. Xem Lịch Sử Thi
```
1. Vào "Quản lý lớp học"
2. Nhấn nút "Xem lịch sử thi" (icon History) của lớp học và đề thi
3. Xem danh sách học sinh đã thi:
   - Lọc theo tên học sinh
   - Sắp xếp theo điểm/thời gian làm bài/thời gian bắt đầu
4. Nhấn "Xem chi tiết" để xem bài làm của học sinh:
   - Thông tin học sinh
   - Từng câu hỏi với đáp án học sinh chọn
   - Đánh dấu đúng/sai
   - Đáp án đúng (nếu học sinh chọn sai)
```

### Luồng Nghiệp Vụ - Học Sinh

#### 1. Tham Gia Lớp Học
```
1. Đăng nhập với role Student
2. Trên trang chủ, nhấn "Tham gia lớp học"
3. Nhập:
   - Mã lớp học (6 ký tự)
   - Mật khẩu lớp học
4. Hệ thống kiểm tra và lưu thông tin tham gia
5. Chuyển đến trang lớp học
```

#### 2. Làm Bài Thi
```
1. Vào trang lớp học (từ danh sách đã tham gia hoặc sau khi nhập mã)
2. Chọn đề thi từ danh sách đề thi trong lớp (mỗi đề thi có thời gian bắt đầu/kết thúc riêng)
3. Hệ thống kiểm tra thời gian theo đề thi đã chọn:
   - Nếu chưa đến thời gian: Hiển thị "Chưa đến thời gian bắt đầu thi"
   - Nếu đã hết thời gian: Hiển thị "Đã hết thời gian thi"
   - Nếu trong thời gian thi: Hiển thị nút "Bắt đầu thi"
4. Nhấn "Bắt đầu thi":
   - Hệ thống gán mã đề ngẫu nhiên (nếu có nhiều mã đề)
   - Hiển thị tất cả câu hỏi trên một trang
   - Bắt đầu đếm ngược thời gian
5. Làm bài:
   - Chọn đáp án cho từng câu hỏi
   - Có thể thay đổi đáp án bất cứ lúc nào
6. Nộp bài:
   - Nhấn nút "Nộp bài" để nộp sớm, HOẶC
   - Hệ thống tự động nộp khi hết giờ
7. Sau khi nộp:
   - Hiển thị popup "Đang chấm bài..."
   - Hệ thống tự động chấm điểm
   - Hiển thị kết quả:
     * Điểm số đạt được / Tổng điểm
     * Danh sách câu hỏi với đáp án đã chọn
     * Đánh dấu đúng/sai
     * Đáp án đúng (chỉ hiển thị nếu đã hết thời gian thi)
```

#### 3. Xem Kết Quả
```
1. Trên trang chủ, xem danh sách lớp học đã tham gia
2. Nhấn vào lớp học và chọn đề thi đã thi xong
3. Xem kết quả:
   - Điểm số
   - Thời gian làm bài
   - Chi tiết từng câu hỏi
   - Đáp án đã chọn
   - Đáp án đúng (nếu đã hết thời gian thi)
```

---

## 🗄 Cấu Trúc Database

### Các Bảng Chính

#### 1. `users` - Người dùng
- `id`: ID người dùng
- `name`: Tên
- `email`: Email (unique)
- `password`: Mật khẩu (hashed)
- `role`: Vai trò (teacher/student)
- `birth_year`: Năm sinh
- `class_name`: Lớp
- `school`: Trường
- `phone`: Số điện thoại
- `created_at`: Thời gian tạo

#### 2. `subjects` - Môn học
- `id`: ID môn học
- `name`: Tên môn học (unique)
- `created_at`: Thời gian tạo

#### 3. `questions` - Câu hỏi
- `id`: ID câu hỏi
- `content`: Nội dung câu hỏi
- `image`: URL ảnh (tùy chọn)
- `difficulty`: Độ khó (1-4)
- `grade`: Khối lớp (1-12, nullable)
- `subject_id`: ID môn học (nullable, FK → subjects)
- `created_at`: Thời gian tạo

#### 4. `answers` - Đáp án
- `id`: ID đáp án
- `question_id`: ID câu hỏi (FK → questions)
- `content`: Nội dung đáp án
- `is_true`: Đáp án đúng/sai (boolean)
- `created_at`: Thời gian tạo

#### 5. `exams` - Đề thi
- `id`: ID đề thi
- `name`: Tên đề thi
- `duration`: Thời gian thi (phút)
- `max_score`: Tổng điểm tối đa
- `created_by`: ID giáo viên tạo (nullable, FK → users) - **Dùng cho cá nhân hóa**
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

#### 6. `exam_questions` - Câu hỏi trong đề thi
- `id`: ID
- `exam_id`: ID đề thi (FK → exams)
- `question_id`: ID câu hỏi (FK → questions)
- `score`: Điểm số của câu hỏi
- `order_index`: Thứ tự trong đề thi
- `created_at`: Thời gian tạo

#### 7. `exam_codes` - Mã đề thi
- `id`: ID mã đề
- `exam_id`: ID đề thi (FK → exams)
- `code`: Mã đề (ví dụ: MĐ001)
- `question_order`: Thứ tự câu hỏi đã đảo (JSON array)
- `created_at`: Thời gian tạo

#### 8. `classes` - Lớp học
- `id`: ID lớp học
- `code`: Mã lớp học (6 ký tự, unique, tự động sinh)
- `name`: Tên lớp học
- `password`: Mật khẩu lớp học
- `created_by`: ID giáo viên tạo (nullable, FK → users) - **Dùng cho cá nhân hóa**
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật

#### 9. `class_exams` - Đề thi trong lớp học
- `id`: ID
- `class_id`: ID lớp học (FK → classes)
- `exam_id`: ID đề thi (FK → exams)
- `start_date`: Thời gian bắt đầu cho phép thi (theo đề thi này)
- `end_date`: Thời gian kết thúc cho phép thi (theo đề thi này)
- `created_at`: Thời gian tạo
- Unique constraint: (class_id, exam_id)

#### 10. `class_participants` - Người tham gia lớp học
- `id`: ID
- `user_id`: ID học sinh (FK → users)
- `class_id`: ID lớp học (FK → classes)
- `joined_at`: Thời gian tham gia
- Unique constraint: (user_id, class_id)

#### 11. `exam_results` - Kết quả thi
- `id`: ID kết quả
- `user_id`: ID học sinh (FK → users)
- `class_id`: ID lớp học (FK → classes)
- `exam_code_id`: ID mã đề (FK → exam_codes, nullable)
- `exam_id`: ID đề thi gốc (FK → exams)
- `started_at`: Thời gian bắt đầu làm bài
- `submitted_at`: Thời gian nộp bài
- `score`: Điểm số đạt được
- `max_score`: Điểm tối đa
- `answers`: Đáp án học sinh chọn (JSON)
- `correct_answers`: Đáp án đúng (JSON, chỉ có khi hết giờ)
- `created_at`: Thời gian tạo
- `updated_at`: Thời gian cập nhật
- Unique constraint: (user_id, exam_room_id)

#### 12. `refresh_tokens` - Refresh tokens
- `id`: ID
- `user_id`: ID người dùng (FK → users)
- `token`: Refresh token
- `expires_at`: Thời gian hết hạn
- `created_at`: Thời gian tạo

#### 13. `migrations` - Quản lý migrations
- `id`: ID
- `filename`: Tên file migration
- `executed_at`: Thời gian chạy

### Quan Hệ Giữa Các Bảng

```
users (1) ──< class_participants (N)
users (1) ──< exam_results (N)
users (1) ──< refresh_tokens (N)

subjects (1) ──< questions (N)
questions (1) ──< answers (N)
questions (1) ──< exam_questions (N)

exams (1) ──< exam_questions (N)
exams (1) ──< exam_codes (N)
exams (1) ──< class_exams (N)
exams (1) ──< exam_results (N)

classes (1) ──< class_exams (N)
classes (1) ──< class_participants (N)
classes (1) ──< exam_results (N)

exam_codes (1) ──< exam_results (N)
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Đăng xuất
- `PUT /api/auth/profile` - Cập nhật thông tin cá nhân (Teacher & Student)

### Questions (Teacher only)
- `GET /api/questions?page=1&limit=10&content=...&subjectId=...&grade=...&difficulty=...` - Lấy danh sách câu hỏi (có filter và pagination)
- `GET /api/questions/:id` - Lấy chi tiết câu hỏi
- `POST /api/questions` - Tạo câu hỏi
- `PUT /api/questions/:id` - Cập nhật câu hỏi
- `DELETE /api/questions/:id` - Xóa câu hỏi

### Subjects
- `GET /api/subjects` - Lấy danh sách môn học
- `GET /api/subjects/:id` - Lấy chi tiết môn học

### Exams (Teacher only)
- `GET /api/exams?page=1&limit=10&name=...` - Lấy danh sách đề thi (có tìm kiếm theo tên và pagination)
- `GET /api/exams/:id` - Lấy chi tiết đề thi
- `POST /api/exams` - Tạo đề thi (tự chọn câu hỏi)
- `POST /api/exams/random` - Tạo đề thi random
- `PUT /api/exams/:id` - Cập nhật đề thi
- `DELETE /api/exams/:id` - Xóa đề thi

### Exam Codes (Teacher only)
- `GET /api/exam-codes?examId=...` - Lấy danh sách mã đề theo đề thi
- `GET /api/exam-codes/:id` - Lấy chi tiết mã đề

### Classes (Teacher only)
- `GET /api/classes?page=1&limit=10&search=...` - Lấy danh sách lớp học (có tìm kiếm theo tên/mã lớp và pagination)
- `GET /api/classes/:id` - Lấy chi tiết lớp học
- `POST /api/classes` - Tạo lớp học
- `PUT /api/classes/:id` - Cập nhật lớp học
- `DELETE /api/classes/:id` - Xóa lớp học
- `GET /api/classes/:id/participants` - Lấy danh sách học sinh trong lớp
- `POST /api/classes/:id/exams` - Thêm đề thi vào lớp
- `DELETE /api/classes/:id/exams/:examId` - Xóa đề thi khỏi lớp
- `PUT /api/classes/:id/exams/:examId/dates` - Cập nhật thời gian bắt đầu/kết thúc cho đề thi trong lớp
- `POST /api/classes/verify` - Xác thực mã lớp học và mật khẩu (Student)
- `GET /api/classes/participated` - Lấy danh sách lớp học đã tham gia (Student)

### Exam Results
- `POST /api/exam-results/start/class/:classId/exam/:examId` - Bắt đầu làm bài (Student)
- `POST /api/exam-results/submit` - Nộp bài (Student)
- `GET /api/exam-results/class/:classId/exam/:examId` - Lấy kết quả của học sinh trong lớp và đề thi (Student)
- `GET /api/exam-results/history` - Lấy lịch sử thi của học sinh (Student)
- `GET /api/exam-results/class/:classId/exam/:examId/all?studentName=...&scoreSort=...&durationSort=...&page=1&limit=10` - Lấy tất cả kết quả trong lớp và đề thi (Teacher, có filter và pagination)
- `GET /api/exam-results/detail/:resultId` - Lấy chi tiết bài làm (Teacher)

---

## 🚀 Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js >= 16.x
- MySQL >= 5.7
- npm hoặc yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd QuizziApp
```

### 2. Cài Đặt Dependencies

#### Cài đặt tất cả
```bash
npm run install:all
```

#### Hoặc cài đặt riêng

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 3. Cấu Hình Database

Tạo file `.env` trong thư mục `backend/`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=quizziapp
PORT=5000
JWT_SECRET=your-secret-key-change-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-in-production
```

### 4. Chạy Migrations

```bash
cd backend
npm run migrate
```

Migrations sẽ tự động:
- Tạo database nếu chưa có
- Tạo tất cả các bảng cần thiết
- Insert dữ liệu mẫu (users, subjects)
- Tracking qua bảng `migrations` (bỏ qua migration đã chạy)

### 5. Chạy Ứng Dụng

#### Chạy Backend
```bash
npm run dev:backend
# hoặc
cd backend
npm run dev
```

Backend sẽ chạy tại: **http://localhost:5000**

#### Chạy Frontend
```bash
npm run dev:frontend
# hoặc
cd frontend
npm run dev
```

Frontend sẽ chạy tại: **http://localhost:3000**

### 6. Truy Cập Swagger API Documentation

Sau khi chạy backend, truy cập:
- **Swagger UI**: http://localhost:5000/api-docs

Swagger cung cấp:
- 📖 Tài liệu API đầy đủ
- 🧪 Test API trực tiếp trên trình duyệt
- 📋 Xem request/response schemas
- 🔍 Tìm kiếm endpoints dễ dàng

---

## 📁 Cấu Trúc Dự Án

```
QuizziApp/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── config/            # Cấu hình (database, swagger)
│   │   ├── controllers/        # Controllers xử lý request
│   │   ├── routes/             # Định nghĩa routes
│   │   ├── services/           # Business logic
│   │   ├── types/              # TypeScript types/interfaces
│   │   ├── utils/              # Utilities (auth helpers)
│   │   └── index.ts            # Entry point
│   ├── database/
│   │   └── migrations/         # SQL migration files
│   ├── scripts/                # Scripts (migrations, utilities)
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # Frontend React App
│   ├── src/
│   │   ├── pages/              # Các trang (Login, Dashboard, etc.)
│   │   ├── components/         # Reusable components
│   │   ├── contexts/            # React Context (AuthContext)
│   │   ├── types/               # TypeScript types/interfaces
│   │   ├── constants/           # Constants (API endpoints)
│   │   ├── utils/               # Utilities (apiClient, tokenUtils)
│   │   ├── App.tsx              # Main App component
│   │   └── index.tsx            # Entry point
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
│
├── AUTHENTICATION.md           # Tài liệu về Authentication
├── README.md                   # File này
└── package.json                # Root package.json (scripts)
```

---

## 👤 Tài Khoản Mẫu

Sau khi chạy migrations, có sẵn các tài khoản mẫu:

### Giáo Viên
- **Email**: `teacher@example.com`
- **Password**: `123456`

### Học Sinh
- **Email**: `student@example.com`
- **Password**: `123456`

---

## 📚 Tài Liệu Bổ Sung

- [Cơ chế Authentication và Phiên Đăng Nhập](./AUTHENTICATION.md) - Chi tiết về JWT, Access Token, Refresh Token

---

## 🔒 Bảo Mật

- Mật khẩu được hash bằng bcrypt
- JWT tokens với expiration time
- Protected routes theo role
- SQL injection prevention (prepared statements)
- CORS configuration
- Input validation
- Phone number validation (Vietnamese format)

---

## 📝 Ghi Chú

- Tất cả thời gian được lưu dưới dạng UTC trong database
- Frontend hiển thị thời gian theo timezone local
- Mã lớp học được sinh ngẫu nhiên 6 ký tự (0-9, A-Z) với xác suất trùng thấp
- Mỗi học sinh chỉ được thi một lần cho mỗi đề thi trong lớp
- Đáp án đúng chỉ hiển thị sau khi hết thời gian thi
- Một lớp học có thể chứa nhiều đề thi
- **Thời gian bắt đầu/kết thúc** được gắn với từng đề thi riêng biệt trong lớp (bảng `class_exams`), không phải với lớp học
- Giáo viên có thể tạo đề thi mới trực tiếp trong trang chi tiết lớp học
- Số điện thoại phải đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, hoặc 09)

---

## 🐛 Troubleshooting

### Lỗi kết nối database
- Kiểm tra file `.env` có đúng thông tin không
- Đảm bảo MySQL đang chạy
- Kiểm tra quyền truy cập database

### Lỗi migration
- Xóa bảng `migrations` và chạy lại `npm run migrate`
- Kiểm tra log trong console để xem migration nào bị lỗi

### Lỗi CORS
- Kiểm tra cấu hình CORS trong `backend/src/index.ts`
- Đảm bảo frontend URL được thêm vào whitelist

---

## 📄 License

MIT License

---

**Phát triển bởi**: Quizzi App Team  
**Phiên bản**: 1.0.0
