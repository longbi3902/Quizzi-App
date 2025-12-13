"use strict";
/**
 * Script kiểm tra trạng thái migrations và database
 */
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../src/config/database");
async function checkMigrations() {
    try {
        console.log('🔄 Đang kiểm tra kết nối database...');
        await (0, database_1.testConnection)();
        console.log('\n📊 Kiểm tra bảng migrations:');
        const migrations = await (0, database_1.query)('SELECT * FROM migrations ORDER BY migration_name');
        if (migrations.length === 0) {
            console.log('   ⚠️  Chưa có migration nào được ghi nhận');
        }
        else {
            console.log(`   ✅ Đã ghi nhận ${migrations.length} migration(s):`);
            migrations.forEach(m => {
                console.log(`      - ${m.migration_name} (${m.executed_at})`);
            });
        }
        console.log('\n📋 Kiểm tra các bảng trong database:');
        const tables = await (0, database_1.query)('SHOW TABLES');
        if (tables.length === 0) {
            console.log('   ⚠️  Không có bảng nào trong database');
        }
        else {
            console.log(`   ✅ Tìm thấy ${tables.length} bảng:`);
            tables.forEach(t => {
                const tableName = Object.values(t)[0];
                console.log(`      - ${tableName}`);
            });
        }
        console.log('\n🔍 So sánh:');
        const expectedTables = ['users', 'questions', 'answers', 'migrations'];
        const existingTables = tables.map(t => Object.values(t)[0]);
        expectedTables.forEach(table => {
            if (existingTables.includes(table)) {
                console.log(`   ✅ ${table} - Tồn tại`);
            }
            else {
                console.log(`   ❌ ${table} - THIẾU!`);
            }
        });
        // Kiểm tra số lượng migration vs số bảng
        if (migrations.length >= 4 && existingTables.length < 4) {
            console.log('\n⚠️  CẢNH BÁO: Có migration đã được ghi nhận nhưng bảng chưa được tạo!');
            console.log('   → Có thể cần xóa bảng migrations và chạy lại:');
            console.log('   → DELETE FROM migrations; hoặc DROP TABLE migrations;');
        }
    }
    catch (error) {
        console.error('❌ Lỗi:', error.message);
        process.exit(1);
    }
}
checkMigrations()
    .then(() => {
    console.log('\n✅ Kiểm tra hoàn tất!');
    process.exit(0);
})
    .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
});
