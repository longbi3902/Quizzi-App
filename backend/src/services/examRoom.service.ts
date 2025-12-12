import {
  ExamRoom,
  ExamRoomWithExam,
  CreateExamRoomDTO,
  UpdateExamRoomDTO,
} from '../types/examRoom.types';
import { query } from '../config/database';
import examService from './exam.service';

interface ExamRoomRow {
  id: number;
  code: string;
  name: string;
  password: string;
  start_date: Date;
  end_date: Date;
  exam_id: number;
  created_at: Date;
  updated_at: Date;
}

export class ExamRoomService {
  /**
   * Sinh mã phòng thi ngẫu nhiên (6 ký tự: chữ số và chữ cái)
   * Xác suất trùng: 1 / (36^6) ≈ 1 / 2,176,782,336
   */
  private generateRoomCode(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Tạo mã phòng thi duy nhất (kiểm tra trùng)
   */
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateRoomCode();
      const existing = await query<ExamRoomRow[]>(
        'SELECT id FROM exam_rooms WHERE code = ?',
        [code]
      );
      if (existing.length === 0) {
        return code;
      }
      attempts++;
    } while (attempts < maxAttempts);

    // Nếu vẫn trùng sau 10 lần, thêm timestamp để đảm bảo unique
    return `${code}${Date.now().toString().slice(-4)}`;
  }

  /**
   * Lấy tất cả phòng thi
   */
  async findAll(): Promise<ExamRoomWithExam[]> {
    try {
      const rows = await query<ExamRoomRow[]>(
        'SELECT * FROM exam_rooms ORDER BY created_at DESC'
      );

      const examRooms: ExamRoomWithExam[] = [];

      for (const row of rows) {
        const exam = await examService.findById(row.exam_id);
        if (exam) {
          examRooms.push({
            ...this.mapRowToExamRoom(row),
            exam,
          });
        }
      }

      return examRooms;
    } catch (error) {
      console.error('Error finding all exam rooms:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả phòng thi với phân trang
   */
  async findAllPaginated(page: number = 1, limit: number = 10): Promise<{
    data: ExamRoomWithExam[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Đếm tổng số records
      const countRows = await query<{ count: number }[]>(
        'SELECT COUNT(*) as count FROM exam_rooms'
      );
      const total = countRows[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      const limitInt = Number.parseInt(limit.toString(), 10);
      const offsetInt = Number.parseInt(offset.toString(), 10);

      // Lấy dữ liệu với pagination
      const rows = await query<ExamRoomRow[]>(
        `SELECT * FROM exam_rooms ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`
      );

      const examRooms: ExamRoomWithExam[] = [];

      for (const row of rows) {
        const exam = await examService.findById(row.exam_id);
        if (exam) {
          examRooms.push({
            ...this.mapRowToExamRoom(row),
            exam,
          });
        }
      }

      return {
        data: examRooms,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error finding all exam rooms with pagination:', error);
      throw error;
    }
  }

  /**
   * Lấy phòng thi theo ID
   */
  async findById(id: number): Promise<ExamRoomWithExam | null> {
    try {
      const rows = await query<ExamRoomRow[]>(
        'SELECT * FROM exam_rooms WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const examRoom = this.mapRowToExamRoom(rows[0]);
      const exam = await examService.findById(examRoom.examId);

      if (!exam) {
        return null;
      }

      return {
        ...examRoom,
        exam,
      };
    } catch (error) {
      console.error('Error finding exam room by ID:', error);
      throw error;
    }
  }

  /**
   * Tạo phòng thi mới
   */
  async create(data: CreateExamRoomDTO): Promise<ExamRoomWithExam> {
    try {
      // Validate exam exists
      const exam = await examService.findById(data.examId);
      if (!exam) {
        throw new Error('Đề thi không tồn tại');
      }

      // Tạo mã phòng thi duy nhất
      const code = await this.generateUniqueCode();

      // Validate dates
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Ngày bắt đầu và ngày kết thúc không hợp lệ');
      }

      if (startDate >= endDate) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      const result = await query<{ insertId: number }>(
        'INSERT INTO exam_rooms (code, name, password, start_date, end_date, exam_id) VALUES (?, ?, ?, ?, ?, ?)',
        [code, data.name, data.password, startDate, endDate, data.examId]
      );

      const examRoom = await this.findById(result.insertId);
      if (!examRoom) {
        throw new Error('Không thể tạo phòng thi');
      }

      return examRoom;
    } catch (error) {
      console.error('Error creating exam room:', error);
      throw error;
    }
  }

  /**
   * Cập nhật phòng thi
   */
  async update(id: number, data: UpdateExamRoomDTO): Promise<ExamRoomWithExam> {
    try {
      // Check if exam room exists
      const existing = await this.findById(id);
      if (!existing) {
        throw new Error('Phòng thi không tồn tại');
      }

      // Validate exam if examId is being updated
      if (data.examId !== undefined) {
        const exam = await examService.findById(data.examId);
        if (!exam) {
          throw new Error('Đề thi không tồn tại');
        }
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }
      if (data.password !== undefined) {
        updates.push('password = ?');
        values.push(data.password);
      }
      if (data.startDate !== undefined) {
        const startDate = new Date(data.startDate);
        if (isNaN(startDate.getTime())) {
          throw new Error('Ngày bắt đầu không hợp lệ');
        }
        updates.push('start_date = ?');
        values.push(startDate);
      }
      if (data.endDate !== undefined) {
        const endDate = new Date(data.endDate);
        if (isNaN(endDate.getTime())) {
          throw new Error('Ngày kết thúc không hợp lệ');
        }
        updates.push('end_date = ?');
        values.push(endDate);
      }
      if (data.examId !== undefined) {
        updates.push('exam_id = ?');
        values.push(data.examId);
      }

      // Validate date range if both dates are being updated
      if (data.startDate !== undefined && data.endDate !== undefined) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);
        if (startDate >= endDate) {
          throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
        }
      } else if (data.startDate !== undefined) {
        // If only startDate is updated, check against existing endDate
        const startDate = new Date(data.startDate);
        if (startDate >= existing.endDate) {
          throw new Error('Ngày bắt đầu phải trước ngày kết thúc');
        }
      } else if (data.endDate !== undefined) {
        // If only endDate is updated, check against existing startDate
        const endDate = new Date(data.endDate);
        if (existing.startDate >= endDate) {
          throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
        }
      }

      if (updates.length === 0) {
        return existing;
      }

      values.push(id);
      await query(
        `UPDATE exam_rooms SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const updated = await this.findById(id);
      if (!updated) {
        throw new Error('Không thể cập nhật phòng thi');
      }

      return updated;
    } catch (error) {
      console.error('Error updating exam room:', error);
      throw error;
    }
  }

  /**
   * Lấy phòng thi theo mã
   */
  async findByCode(code: string): Promise<ExamRoomWithExam | null> {
    try {
      const rows = await query<ExamRoomRow[]>(
        'SELECT * FROM exam_rooms WHERE code = ?',
        [code]
      );

      if (rows.length === 0) {
        return null;
      }

      const examRoom = this.mapRowToExamRoom(rows[0]);
      const exam = await examService.findById(examRoom.examId);

      if (!exam) {
        return null;
      }

      return {
        ...examRoom,
        exam,
      };
    } catch (error) {
      console.error('Error finding exam room by code:', error);
      throw error;
    }
  }

  /**
   * Xác thực mã phòng thi và mật khẩu
   */
  async verifyRoom(code: string, password: string): Promise<ExamRoomWithExam | null> {
    try {
      const examRoom = await this.findByCode(code);
      if (!examRoom) {
        return null;
      }

      if (examRoom.password !== password) {
        return null;
      }

      return examRoom;
    } catch (error) {
      console.error('Error verifying exam room:', error);
      throw error;
    }
  }

  /**
   * Xóa phòng thi
   */
  async delete(id: number): Promise<void> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM exam_rooms WHERE id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        throw new Error('Phòng thi không tồn tại');
      }
    } catch (error) {
      console.error('Error deleting exam room:', error);
      throw error;
    }
  }

  /**
   * Map database row sang ExamRoom object
   */
  private mapRowToExamRoom(row: ExamRoomRow): ExamRoom {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      password: row.password,
      startDate: row.start_date,
      endDate: row.end_date,
      examId: row.exam_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new ExamRoomService();

