import { ClassWithExams } from '../types/class.types';
import { query } from '../config/database';
import classService from './class.service';

interface ParticipantRow {
  id: number;
  user_id: number;
  class_id: number;
  joined_at: Date;
}

export class ClassParticipantService {
  /**
   * Lưu participant khi học sinh tham gia lớp học thành công
   */
  async createParticipant(userId: number, classId: number): Promise<void> {
    try {
      // Sử dụng INSERT IGNORE để tránh lỗi nếu đã tham gia rồi
      await query(
        'INSERT IGNORE INTO class_participants (user_id, class_id) VALUES (?, ?)',
        [userId, classId]
      );
    } catch (error) {
      console.error('Error creating participant:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách lớp học đã tham gia của học sinh
   */
  async getParticipatedClasses(userId: number): Promise<ClassWithExams[]> {
    try {
      const rows = await query<ParticipantRow[]>(
        `SELECT cp.* 
         FROM class_participants cp
         WHERE cp.user_id = ?
         ORDER BY cp.joined_at DESC`,
        [userId]
      );

      const classes: ClassWithExams[] = [];

      for (const row of rows) {
        // Use findByIdForStudent to bypass created_by filter for students
        const classData = await classService.findByIdForStudent(row.class_id);
        if (classData) {
          classes.push(classData);
        }
      }

      return classes;
    } catch (error) {
      console.error('Error getting participated classes:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra học sinh đã tham gia lớp học chưa
   */
  async hasParticipated(userId: number, classId: number): Promise<boolean> {
    try {
      const rows = await query<ParticipantRow[]>(
        'SELECT id FROM class_participants WHERE user_id = ? AND class_id = ?',
        [userId, classId]
      );
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking participation:', error);
      throw error;
    }
  }

  /**
   * Lấy danh sách học sinh trong một lớp học
   */
  async getClassParticipants(classId: number): Promise<Array<{
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    joinedAt: Date;
  }>> {
    try {
      const rows = await query<Array<ParticipantRow & { user_name: string; user_email: string }>>(
        `SELECT cp.*, u.name as user_name, u.email as user_email
         FROM class_participants cp
         INNER JOIN users u ON cp.user_id = u.id
         WHERE cp.class_id = ?
         ORDER BY cp.joined_at DESC`,
        [classId]
      );

      return rows.map(row => ({
        id: row.id,
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        joinedAt: row.joined_at,
      }));
    } catch (error) {
      console.error('Error getting class participants:', error);
      throw error;
    }
  }
}

export default new ClassParticipantService();


