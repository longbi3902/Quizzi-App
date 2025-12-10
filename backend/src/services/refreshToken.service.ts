import { query } from '../config/database';

interface RefreshTokenRow {
  id: number;
  user_id: number;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export class RefreshTokenService {
  /**
   * Lưu refresh token vào database
   */
  async create(userId: number, token: string, expiresAt: Date): Promise<void> {
    try {
      await query(
        'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [userId, token, expiresAt]
      );
    } catch (error) {
      console.error('Error creating refresh token:', error);
      throw error;
    }
  }

  /**
   * Tìm refresh token
   */
  async findByToken(token: string): Promise<RefreshTokenRow | null> {
    try {
      const results = await query<RefreshTokenRow[]>(
        'SELECT * FROM refresh_tokens WHERE token = ?',
        [token]
      );
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error finding refresh token:', error);
      throw error;
    }
  }

  /**
   * Xóa refresh token
   */
  async delete(token: string): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM refresh_tokens WHERE token = ?',
        [token]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting refresh token:', error);
      throw error;
    }
  }

  /**
   * Xóa tất cả refresh token của user (khi logout)
   */
  async deleteAllByUserId(userId: number): Promise<void> {
    try {
      await query('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
    } catch (error) {
      console.error('Error deleting refresh tokens by user id:', error);
      throw error;
    }
  }

  /**
   * Xóa các refresh token đã hết hạn
   */
  async deleteExpiredTokens(): Promise<void> {
    try {
      await query('DELETE FROM refresh_tokens WHERE expires_at < NOW()');
    } catch (error) {
      console.error('Error deleting expired tokens:', error);
      throw error;
    }
  }
}

export default new RefreshTokenService();

