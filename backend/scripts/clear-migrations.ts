/**
 * Clear Migrations Script
 * 
 * Script này xóa tất cả records trong bảng migrations
 * Sử dụng khi muốn chạy lại migrations từ đầu
 */

import { query, testConnection } from '../src/config/database';

async function clearMigrations() {
  try {
    console.log('🔄 Đang kiểm tra kết nối database...');
    await testConnection();

    console.log('⚠️  Đang xóa tất cả records trong bảng migrations...');
    await query('DELETE FROM migrations');
    
    console.log('✅ Đã xóa tất cả migrations!');
    console.log('📝 Bạn có thể chạy lại migrations từ đầu.');
  } catch (error: any) {
    console.error('❌ Lỗi khi xóa migrations:', error.message);
    process.exit(1);
  }
}

// Chạy
(async () => {
  try {
    await clearMigrations();
    console.log('\n✨ Process completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Process failed:', error);
    process.exit(1);
  }
})();

