import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Cấu hình kết nối MySQL
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '12345',
  database: process.env.DB_NAME || 'quizziapp',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Tạo connection pool
const pool = mysql.createPool(dbConfig);

/**
 * Test kết nối database
 */
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Kết nối MySQL thành công!');
    connection.release();
  } catch (error) {
    console.error('❌ Lỗi kết nối MySQL:', error);
    throw error;
  }
};

/**
 * Thực thi query
 */
export const query = async <T = any>(
  sql: string,
  params?: any[]
): Promise<T> => {
  try {
    const [results] = await pool.execute(sql, params);
    return results as T;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default pool;

