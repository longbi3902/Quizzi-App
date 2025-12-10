/**
 * Migration Runner Script
 * 
 * Script này chạy tất cả các migration chưa được thực thi
 * Dựa trên bảng migrations để tracking
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { query, testConnection } from '../src/config/database';

interface MigrationRecord {
  migration_name: string;
  executed_at: Date;
}

/**
 * Tạo bảng migrations nếu chưa có
 */
async function ensureMigrationsTable(): Promise<void> {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_migration_name (migration_name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  } catch (error) {
    console.error('Error creating migrations table:', error);
    throw error;
  }
}

/**
 * Lấy danh sách migration đã chạy
 */
async function getExecutedMigrations(): Promise<string[]> {
  try {
    const results = await query<MigrationRecord[]>(
      'SELECT migration_name FROM migrations ORDER BY migration_name'
    );
    return results.map((r) => r.migration_name);
  } catch (error: any) {
    // Nếu bảng migrations chưa tồn tại, trả về mảng rỗng
    if (error.code === 'ER_NO_SUCH_TABLE') {
      return [];
    }
    throw error;
  }
}

/**
 * Đánh dấu migration đã chạy
 */
async function markMigrationAsExecuted(migrationName: string): Promise<void> {
  await query(
    'INSERT INTO migrations (migration_name) VALUES (?) ON DUPLICATE KEY UPDATE migration_name=migration_name',
    [migrationName]
  );
}

/**
 * Đọc và thực thi file migration
 */
async function executeMigration(filePath: string, migrationName: string): Promise<void> {
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  // Loại bỏ các comment (dòng bắt đầu bằng --)
  const lines = sql.split('\n');
  const cleanedLines = lines
    .map(line => {
      // Loại bỏ comment ở cuối dòng
      const commentIndex = line.indexOf('--');
      if (commentIndex !== -1) {
        return line.substring(0, commentIndex).trim();
      }
      return line.trim();
    })
    .filter(line => line.length > 0 && !line.startsWith('--'));
  
  const cleanedSql = cleanedLines.join('\n');
  
  // Tách các câu lệnh SQL (phân cách bởi dấu ;)
  const statements = cleanedSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // Thực thi từng câu lệnh
  for (const statement of statements) {
    if (statement.trim()) {
      try {
        await query(statement);
        console.log(`   ✓ Thực thi: ${statement.substring(0, 50)}...`);
      } catch (error: any) {
        console.error(`   ✗ Lỗi khi thực thi: ${statement.substring(0, 50)}...`);
        console.error(`   Chi tiết: ${error.message}`);
        throw error;
      }
    }
  }

  // Đánh dấu đã chạy
  await markMigrationAsExecuted(migrationName);
  console.log(`✅ Đã chạy migration: ${migrationName}`);
}

/**
 * Lấy danh sách file migration
 */
function getMigrationFiles(): string[] {
  const migrationsDir = path.join(__dirname, '../database/migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b)); // Sắp xếp theo tên file

  return files.map((file) => path.join(migrationsDir, file));
}

/**
 * Main function
 */
async function runMigrations(): Promise<void> {
  try {
    console.log('🔄 Đang kiểm tra kết nối database...');
    await testConnection();

    console.log('📊 Đang đảm bảo bảng migrations tồn tại...');
    await ensureMigrationsTable();

    console.log('📋 Đang lấy danh sách migration đã chạy...');
    const executedMigrations = await getExecutedMigrations();
    console.log(`   Đã chạy ${executedMigrations.length} migration(s)`);

    console.log('📂 Đang tìm các file migration...');
    const migrationFiles = getMigrationFiles();
    console.log(`   Tìm thấy ${migrationFiles.length} file migration`);

    let executedCount = 0;

    for (const filePath of migrationFiles) {
      const fileName = path.basename(filePath);
      
      // Kiểm tra xem migration đã chạy chưa
      if (executedMigrations.includes(fileName)) {
        console.log(`⏭️  Bỏ qua (đã chạy): ${fileName}`);
        continue;
      }

      console.log(`🚀 Đang chạy migration: ${fileName}...`);
      await executeMigration(filePath, fileName);
      executedCount++;
    }

    if (executedCount === 0) {
      console.log('✨ Tất cả migration đã được chạy!');
    } else {
      console.log(`\n✨ Hoàn thành! Đã chạy ${executedCount} migration(s) mới.`);
    }
  } catch (error: any) {
    console.error('❌ Lỗi khi chạy migration:', error.message);
    process.exit(1);
  }
}

// Chạy migrations
(async () => {
  try {
    await runMigrations();
    console.log('✅ Migration process completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration process failed:', error);
    process.exit(1);
  }
})();

