import { Subject } from '../types/subject.types';
import { query } from '../config/database';

interface SubjectRow {
  id: number;
  name: string;
  created_at: Date;
}

export class SubjectService {
  /**
   * Lấy tất cả môn học
   */
  async findAll(): Promise<Subject[]> {
    try {
      const rows = await query<SubjectRow[]>(
        'SELECT * FROM subjects ORDER BY name'
      );

      return rows.map((row) => ({
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Error finding all subjects:', error);
      throw error;
    }
  }

  /**
   * Lấy môn học theo ID
   */
  async findById(id: number): Promise<Subject | null> {
    try {
      const rows = await query<SubjectRow[]>(
        'SELECT * FROM subjects WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const row = rows[0];
      return {
        id: row.id,
        name: row.name,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error('Error finding subject by id:', error);
      throw error;
    }
  }
}

export default new SubjectService();



