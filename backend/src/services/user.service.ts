import bcrypt from 'bcryptjs';
import { User, RegisterDTO, UserRole } from '../types/user.types';
import { query } from '../config/database';

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
  birth_year: number | null;
  class_name: string | null;
  school: string;
  phone: string | null;
  created_at: Date;
}

export class UserService {
  /**
   * Tìm user theo email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const results = await query<UserRow[]>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (results.length === 0) {
        return null;
      }

      const userRow = results[0];
      return this.mapRowToUser(userRow);
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Tìm user theo ID
   */
  async findById(id: number): Promise<User | null> {
    try {
      const results = await query<UserRow[]>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );

      if (results.length === 0) {
        return null;
      }

      const userRow = results[0];
      return this.mapRowToUser(userRow);
    } catch (error) {
      console.error('Error finding user by id:', error);
      throw error;
    }
  }

  /**
   * Tạo user mới
   */
  async create(userData: RegisterDTO): Promise<User> {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Insert vào database
      const result = await query<{ insertId: number }>(
        `INSERT INTO users (name, email, password, role, birth_year, class_name, school, phone) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.name,
          userData.email,
          hashedPassword,
          userData.role,
          userData.birthYear || null,
          userData.className || null,
          userData.school,
          userData.phone || null,
        ]
      );

      // Lấy user vừa tạo
      const newUser = await this.findById(result.insertId);
      if (!newUser) {
        throw new Error('Không thể tạo user mới');
      }

      return newUser;
    } catch (error: any) {
      console.error('Error creating user:', error);
      // Kiểm tra lỗi duplicate email
      if (error.code === 'ER_DUP_ENTRY' || error.message?.includes('Duplicate entry')) {
        throw new Error('Email đã được sử dụng');
      }
      throw error;
    }
  }

  /**
   * Cập nhật thông tin user
   */
  async update(id: number, updateData: {
    name?: string;
    birthYear?: number | null;
    className?: string | null;
    school?: string;
    phone?: string | null;
  }): Promise<User | null> {
    try {
      // Xây dựng câu lệnh UPDATE động
      const updates: string[] = [];
      const values: any[] = [];

      if (updateData.name !== undefined) {
        updates.push('name = ?');
        values.push(updateData.name);
      }
      if (updateData.birthYear !== undefined) {
        updates.push('birth_year = ?');
        values.push(updateData.birthYear);
      }
      if (updateData.className !== undefined) {
        updates.push('class_name = ?');
        values.push(updateData.className);
      }
      if (updateData.school !== undefined) {
        updates.push('school = ?');
        values.push(updateData.school);
      }
      if (updateData.phone !== undefined) {
        updates.push('phone = ?');
        values.push(updateData.phone);
      }

      if (updates.length === 0) {
        // Không có gì để cập nhật
        return await this.findById(id);
      }

      values.push(id);
      const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
      
      await query(updateQuery, values);

      // Lấy user đã cập nhật
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Xác thực mật khẩu
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Map database row sang User object
   */
  private mapRowToUser(row: UserRow): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      password: row.password,
      role: row.role as UserRole,
      birthYear: row.birth_year || undefined,
      className: row.class_name || undefined,
      school: row.school,
      phone: row.phone || undefined,
      createdAt: row.created_at,
    };
  }
}

export default new UserService();
