# Giải thích về Bảng Migrations

## Tại sao cần bảng `migrations`?

Bảng `migrations` được dùng để **tracking** (theo dõi) các migration đã được chạy.

### Vấn đề không có tracking:

Nếu không có bảng `migrations`, mỗi lần chạy `npm run migrate`:
- Script sẽ chạy **TẤT CẢ** các file migration
- Dù migration đã chạy rồi, nó vẫn chạy lại
- → Gây lỗi: "Table already exists", "Duplicate entry", v.v.

### Với bảng `migrations`:

1. **Lần đầu chạy:**
   ```
   ✅ Chạy 001_create_users_table.sql
   ✅ Chạy 002_create_questions_table.sql
   ✅ Chạy 003_create_answers_table.sql
   ✅ Chạy 004_create_migrations_table.sql
   ✅ Chạy 005_insert_sample_users.sql
   → Ghi tất cả vào bảng migrations
   ```

2. **Lần sau chạy:**
   ```
   ⏭️  Bỏ qua 001_create_users_table.sql (đã chạy)
   ⏭️  Bỏ qua 002_create_questions_table.sql (đã chạy)
   ⏭️  Bỏ qua 003_create_answers_table.sql (đã chạy)
   ⏭️  Bỏ qua 004_create_migrations_table.sql (đã chạy)
   ⏭️  Bỏ qua 005_insert_sample_users.sql (đã chạy)
   → Không chạy lại, tránh lỗi!
   ```

3. **Khi có migration mới:**
   ```
   ⏭️  Bỏ qua 001-005 (đã chạy)
   ✅ Chạy 006_new_feature.sql (mới)
   → Chỉ chạy migration mới!
   ```

## Tại sao bảng migrations được tạo tự động?

Bảng `migrations` được tạo **tự động** trong script vì:
- Nó cần tồn tại **TRƯỚC** khi chạy các migration khác
- Nếu không có, script không biết migration nào đã chạy
- Function `ensureMigrationsTable()` tự động tạo nếu chưa có

## Có thể bỏ bảng migrations không?

Có, nhưng **KHÔNG KHUYẾN NGHỊ** vì:
- Phải chạy migration thủ công từng file
- Dễ chạy nhầm migration đã chạy rồi
- Không biết migration nào đã chạy

## Kết luận

Bảng `migrations` là **bắt buộc** cho hệ thống migration tự động. Nó giúp:
- ✅ Tránh chạy lại migration đã chạy
- ✅ Biết migration nào đã chạy
- ✅ Chỉ chạy migration mới
- ✅ An toàn khi chạy nhiều lần

