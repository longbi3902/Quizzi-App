"use strict";
/**
 * Reset Database Script
 *
 * Script này reset database về trạng thái ban đầu
 * CHỈ SỬ DỤNG CHO MÔI TRƯỜNG DEVELOPMENT!
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
async function getConnection() {
    return await promise_1.default.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
    });
}
async function resetDatabase() {
    let connection = null;
    try {
        console.log('🔄 Đang kết nối database...');
        connection = await getConnection();
        console.log('✅ Kết nối thành công!');
        console.log('⚠️  CẢNH BÁO: Script này sẽ XÓA TOÀN BỘ database và tạo lại từ đầu!');
        console.log('📂 Đang đọc file schema.sql...');
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');
        // Tách các câu lệnh SQL (phân cách bởi dấu ;)
        const statements = schema
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith('--'));
        console.log(`📝 Tìm thấy ${statements.length} câu lệnh SQL`);
        // Thực thi từng câu lệnh
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    const preview = statement.substring(0, 60).replace(/\n/g, ' ');
                    if (preview.length < statement.length) {
                        console.log(`   ✓ Thực thi: ${preview}...`);
                    }
                    else {
                        console.log(`   ✓ Thực thi: ${preview}`);
                    }
                }
                catch (error) {
                    // Bỏ qua lỗi duplicate key cho INSERT với ON DUPLICATE KEY UPDATE
                    if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
                        const preview = statement.substring(0, 60).replace(/\n/g, ' ');
                        console.log(`   ⚠ Bỏ qua (đã tồn tại): ${preview}...`);
                        continue;
                    }
                    const preview = statement.substring(0, 60).replace(/\n/g, ' ');
                    console.error(`   ✗ Lỗi khi thực thi: ${preview}...`);
                    console.error(`   Chi tiết: ${error.message}`);
                    throw error;
                }
            }
        }
        // Đánh dấu các migration cũ đã chạy (để không chạy lại)
        console.log('\n📝 Đang đánh dấu các migration cũ đã chạy...');
        const oldMigrations = [
            '001_create_users_table.sql',
            '002_create_questions_table.sql',
            '003_create_answers_table.sql',
            '004_create_migrations_table.sql',
            '005_insert_sample_users.sql',
            '006_add_difficulty_to_questions.sql',
            '007_create_exams_table.sql',
            '008_create_exam_questions_table.sql',
            '009_create_refresh_tokens_table.sql',
            '010_create_exam_codes_table.sql',
            '011_create_exam_rooms_table.sql',
            '012_add_code_to_exam_rooms.sql',
            '013_add_dates_to_exam_rooms.sql',
            '014_create_exam_room_participants_table.sql',
            '015_create_exam_results_table.sql',
            '016_create_subjects_table.sql',
            '017_add_grade_and_subject_to_questions.sql',
            '018_add_created_by_to_questions_exams_rooms.sql',
            '019_create_classes_table.sql',
            '020_create_class_exams_table.sql',
            '021_create_class_participants_table.sql',
            '022_update_exam_results_add_class_id.sql',
            '023_move_dates_from_classes_to_class_exams.sql',
            '024_remove_exam_room_id_from_exam_results.sql',
        ];
        for (const migrationName of oldMigrations) {
            try {
                await connection.execute('INSERT INTO migrations (migration_name) VALUES (?) ON DUPLICATE KEY UPDATE migration_name=migration_name', [migrationName]);
                console.log(`   ✓ Đánh dấu: ${migrationName}`);
            }
            catch (error) {
                // Bỏ qua lỗi
            }
        }
        console.log('\n✅ Đã reset database thành công!');
        console.log('📊 Database đã được tạo lại với schema mới nhất.');
        console.log('📝 Tất cả các migration cũ đã được đánh dấu là đã chạy.');
    }
    catch (error) {
        console.error('❌ Lỗi khi reset database:', error.message);
        process.exit(1);
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
}
// Chạy reset
(async () => {
    try {
        await resetDatabase();
        console.log('\n✨ Reset database process completed!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Reset database process failed:', error);
        process.exit(1);
    }
})();
