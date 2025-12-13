import {
  Class,
  ClassWithExams,
  CreateClassDTO,
  UpdateClassDTO,
} from '../types/class.types';
import { query } from '../config/database';
import examService from './exam.service';

interface ClassRow {
  id: number;
  code: string;
  name: string;
  password: string;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
}

interface ClassExamRow {
  id: number;
  class_id: number;
  exam_id: number;
  start_date: Date;
  end_date: Date;
  created_at: Date;
}

export class ClassService {
  /**
   * Sinh mã lớp học ngẫu nhiên (6 ký tự: chữ số và chữ cái)
   * Xác suất trùng: 1 / (36^6) ≈ 1 / 2,176,782,336
   */
  private generateClassCode(): string {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Tạo mã lớp học duy nhất (kiểm tra trùng)
   */
  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      code = this.generateClassCode();
      const existing = await query<ClassRow[]>(
        'SELECT id FROM classes WHERE code = ?',
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
   * Lấy tất cả lớp học (chỉ của user)
   */
  async findAll(userId?: number | null): Promise<ClassWithExams[]> {
    try {
      let queryStr = 'SELECT * FROM classes';
      const params: any[] = [];
      
      if (userId) {
        queryStr += ' WHERE created_by = ?';
        params.push(userId);
      }
      
      queryStr += ' ORDER BY created_at DESC';
      
      const rows = await query<ClassRow[]>(queryStr, params);

      const classes: ClassWithExams[] = [];

      for (const row of rows) {
        const classData = await this.findById(row.id, userId);
        if (classData) {
          classes.push(classData);
        }
      }

      return classes;
    } catch (error) {
      console.error('Error finding all classes:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả lớp học với phân trang (chỉ của user)
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    userId?: number | null,
    search?: string
  ): Promise<{
    data: ClassWithExams[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      // Xây dựng WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];
      
      if (userId) {
        conditions.push('created_by = ?');
        params.push(userId);
      }

      // Search theo tên lớp hoặc mã lớp
      if (search && search.trim()) {
        conditions.push('(name LIKE ? OR code LIKE ?)');
        const searchTerm = `%${search.trim()}%`;
        params.push(searchTerm, searchTerm);
      }
      
      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      
      // Đếm tổng số records
      const countRows = await query<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM classes ${whereClause}`,
        params
      );
      const total = countRows[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      const limitInt = Number.parseInt(limit.toString(), 10);
      const offsetInt = Number.parseInt(offset.toString(), 10);

      // Lấy dữ liệu với pagination
      const rows = await query<ClassRow[]>(
        `SELECT * FROM classes ${whereClause} ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`,
        params
      );

      const classes: ClassWithExams[] = [];

      for (const row of rows) {
        const classData = await this.findById(row.id, userId);
        if (classData) {
          classes.push(classData);
        }
      }

      return {
        data: classes,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error finding all classes with pagination:', error);
      throw error;
    }
  }

  /**
   * Lấy lớp học theo ID
   * - Nếu userId được truyền: chỉ lấy lớp của user đó (cho giáo viên)
   * - Nếu userId = null/undefined: lấy bất kỳ lớp nào (cho học sinh xem lớp đã tham gia)
   */
  async findById(id: number, userId?: number | null): Promise<ClassWithExams | null> {
    try {
      let queryStr = 'SELECT * FROM classes WHERE id = ?';
      const params: any[] = [id];
      
      // Chỉ filter theo created_by nếu userId được truyền (và không phải null)
      // Nếu userId = null/undefined, không filter (cho phép học sinh xem lớp đã tham gia)
      if (userId !== undefined && userId !== null) {
        queryStr += ' AND created_by = ?';
        params.push(userId);
      }
      
      const rows = await query<ClassRow[]>(queryStr, params);

      if (rows.length === 0) {
        return null;
      }

      const classData = this.mapRowToClass(rows[0]);
      
      // Lấy danh sách đề thi trong lớp kèm start_date và end_date
      const examRows = await query<ClassExamRow[]>(
        'SELECT * FROM class_exams WHERE class_id = ? ORDER BY created_at ASC',
        [id]
      );

      const exams = [];
      for (const examRow of examRows) {
        const exam = await examService.findById(examRow.exam_id, userId);
        if (exam) {
          exams.push({
            ...exam,
            startDate: examRow.start_date,
            endDate: examRow.end_date,
          });
        }
      }

      return {
        ...classData,
        exams,
      };
    } catch (error) {
      console.error('Error finding class by ID:', error);
      throw error;
    }
  }

  /**
   * Lấy lớp học theo ID (cho học sinh, không filter created_by)
   */
  async findByIdForStudent(id: number): Promise<ClassWithExams | null> {
    return this.findById(id, undefined);
  }

  /**
   * Tạo lớp học mới
   */
  async create(data: CreateClassDTO, userId?: number | null): Promise<ClassWithExams> {
    try {
      // Validate exams exist (chỉ của user)
      if (data.examIds && data.examIds.length > 0) {
        for (const examId of data.examIds) {
          const exam = await examService.findById(examId, userId);
          if (!exam) {
            throw new Error(`Đề thi ID ${examId} không tồn tại hoặc bạn không có quyền sử dụng`);
          }
        }
      }

      // Tạo mã lớp học duy nhất
      const code = await this.generateUniqueCode();

      // Tạo lớp học (không có start_date và end_date nữa)
      const result = await query<{ insertId: number }>(
        'INSERT INTO classes (code, name, password, created_by) VALUES (?, ?, ?, ?)',
        [code, data.name, data.password, userId || null]
      );

      const classId = result.insertId;

      // Thêm đề thi vào lớp (start_date và end_date sẽ được set sau khi thêm vào lớp)
      // Hiện tại không tự động thêm, vì cần start_date và end_date từ frontend
      // Sẽ được thêm qua addExamToClass với start_date và end_date

      const classData = await this.findById(classId, userId);
      if (!classData) {
        throw new Error('Không thể tạo lớp học');
      }

      return classData;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  /**
   * Cập nhật lớp học
   */
  async update(id: number, data: UpdateClassDTO, userId?: number | null): Promise<ClassWithExams> {
    try {
      // Check if class exists (chỉ của user)
      const existing = await this.findById(id, userId);
      if (!existing) {
        throw new Error('Lớp học không tồn tại hoặc bạn không có quyền chỉnh sửa');
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

      // Update class info
      if (updates.length > 0) {
        values.push(id);
        await query(
          `UPDATE classes SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      // Update exams if provided
      if (data.examIds !== undefined) {
        // Validate exams exist (chỉ của user)
        for (const examId of data.examIds) {
          const exam = await examService.findById(examId, userId);
          if (!exam) {
            throw new Error(`Đề thi ID ${examId} không tồn tại hoặc bạn không có quyền sử dụng`);
          }
        }

        // Xóa tất cả đề thi cũ
        await query('DELETE FROM class_exams WHERE class_id = ?', [id]);

        // Thêm đề thi mới
        for (const examId of data.examIds) {
          await query(
            'INSERT INTO class_exams (class_id, exam_id) VALUES (?, ?)',
            [id, examId]
          );
        }
      }

      const updated = await this.findById(id, userId);
      if (!updated) {
        throw new Error('Không thể cập nhật lớp học');
      }

      return updated;
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  /**
   * Lấy lớp học theo mã
   */
  async findByCode(code: string): Promise<ClassWithExams | null> {
    try {
      const rows = await query<ClassRow[]>(
        'SELECT * FROM classes WHERE code = ?',
        [code]
      );

      if (rows.length === 0) {
        return null;
      }

      return this.findById(rows[0].id);
    } catch (error) {
      console.error('Error finding class by code:', error);
      throw error;
    }
  }

  /**
   * Xác thực mã lớp học và mật khẩu
   */
  async verifyClass(code: string, password: string): Promise<ClassWithExams | null> {
    try {
      const classData = await this.findByCode(code);
      if (!classData) {
        return null;
      }

      if (classData.password !== password) {
        return null;
      }

      return classData;
    } catch (error) {
      console.error('Error verifying class:', error);
      throw error;
    }
  }

  /**
   * Thêm đề thi vào lớp học
   */
  async addExamToClass(
    classId: number,
    examId: number,
    startDate: Date | string,
    endDate: Date | string,
    userId?: number | null
  ): Promise<void> {
    try {
      // Kiểm tra quyền sở hữu lớp
      if (userId) {
        const classData = await this.findById(classId, userId);
        if (!classData) {
          throw new Error('Lớp học không tồn tại hoặc bạn không có quyền');
        }
      }

      // Kiểm tra đề thi tồn tại và thuộc về user
      const exam = await examService.findById(examId, userId);
      if (!exam) {
        throw new Error('Đề thi không tồn tại hoặc bạn không có quyền sử dụng');
      }

      // Kiểm tra đã có trong lớp chưa
      const existing = await query<ClassExamRow[]>(
        'SELECT * FROM class_exams WHERE class_id = ? AND exam_id = ?',
        [classId, examId]
      );
      if (existing.length > 0) {
        throw new Error('Đề thi đã có trong lớp học này');
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Ngày bắt đầu và ngày kết thúc không hợp lệ');
      }

      if (start >= end) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      // Thêm vào lớp với start_date và end_date
      await query(
        'INSERT INTO class_exams (class_id, exam_id, start_date, end_date) VALUES (?, ?, ?, ?)',
        [classId, examId, start, end]
      );
    } catch (error) {
      console.error('Error adding exam to class:', error);
      throw error;
    }
  }

  /**
   * Cập nhật start_date và end_date cho đề thi trong lớp
   */
  async updateExamDatesInClass(
    classId: number,
    examId: number,
    startDate: Date | string,
    endDate: Date | string,
    userId?: number | null
  ): Promise<void> {
    try {
      // Kiểm tra quyền sở hữu lớp
      if (userId) {
        const classData = await this.findById(classId, userId);
        if (!classData) {
          throw new Error('Lớp học không tồn tại hoặc bạn không có quyền');
        }
      }

      // Validate dates
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Ngày bắt đầu và ngày kết thúc không hợp lệ');
      }

      if (start >= end) {
        throw new Error('Ngày kết thúc phải sau ngày bắt đầu');
      }

      // Cập nhật
      const result = await query<{ affectedRows: number }>(
        'UPDATE class_exams SET start_date = ?, end_date = ? WHERE class_id = ? AND exam_id = ?',
        [start, end, classId, examId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Đề thi không có trong lớp học này');
      }
    } catch (error) {
      console.error('Error updating exam dates in class:', error);
      throw error;
    }
  }

  /**
   * Xóa đề thi khỏi lớp học
   */
  async removeExamFromClass(classId: number, examId: number, userId?: number | null): Promise<void> {
    try {
      // Kiểm tra quyền sở hữu lớp
      if (userId) {
        const classData = await this.findById(classId, userId);
        if (!classData) {
          throw new Error('Lớp học không tồn tại hoặc bạn không có quyền');
        }
      }

      // Xóa khỏi lớp
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM class_exams WHERE class_id = ? AND exam_id = ?',
        [classId, examId]
      );

      if (result.affectedRows === 0) {
        throw new Error('Đề thi không có trong lớp học này');
      }
    } catch (error) {
      console.error('Error removing exam from class:', error);
      throw error;
    }
  }

  /**
   * Xóa lớp học
   */
  async delete(id: number, userId?: number | null): Promise<void> {
    try {
      // Kiểm tra quyền sở hữu nếu có userId
      if (userId) {
        const existing = await this.findById(id, userId);
        if (!existing) {
          throw new Error('Lớp học không tồn tại hoặc bạn không có quyền xóa');
        }
      }
      
      let queryStr = 'DELETE FROM classes WHERE id = ?';
      const params: any[] = [id];
      
      if (userId) {
        queryStr += ' AND created_by = ?';
        params.push(userId);
      }
      
      const result = await query<{ affectedRows: number }>(queryStr, params);

      if (result.affectedRows === 0) {
        throw new Error('Lớp học không tồn tại');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  /**
   * Map database row sang Class object
   */
  private mapRowToClass(row: ClassRow): Class {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      password: row.password,
      createdBy: row.created_by || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new ClassService();


