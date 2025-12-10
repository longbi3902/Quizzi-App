import { ExamCode, ExamCodeWithExam } from '../types/exam.types';
import { query } from '../config/database';
import examService from './exam.service';

interface ExamCodeRow {
  id: number;
  exam_id: number;
  code: string;
  question_order: string | number[]; // JSON string hoặc đã được parse thành array
  created_at: Date;
}

export class ExamCodeService {
  /**
   * Lấy tất cả mã đề của một đề thi
   */
  async findByExamId(examId: number): Promise<ExamCode[]> {
    try {
      const rows = await query<ExamCodeRow[]>(
        'SELECT * FROM exam_codes WHERE exam_id = ? ORDER BY code',
        [examId]
      );

      return rows.map((row) => this.mapRowToExamCode(row));
    } catch (error) {
      console.error('Error finding exam codes by exam ID:', error);
      throw error;
    }
  }

  /**
   * Lấy mã đề theo ID
   */
  async findById(id: number): Promise<ExamCodeWithExam | null> {
    try {
      const rows = await query<ExamCodeRow[]>(
        'SELECT * FROM exam_codes WHERE id = ?',
        [id]
      );

      if (rows.length === 0) {
        return null;
      }

      const examCode = this.mapRowToExamCode(rows[0]);
      const exam = await examService.findById(examCode.examId);

      if (!exam) {
        return null;
      }

      return {
        ...examCode,
        exam,
      };
    } catch (error) {
      console.error('Error finding exam code by ID:', error);
      throw error;
    }
  }

  /**
   * Lấy mã đề theo code
   */
  async findByCode(examId: number, code: string): Promise<ExamCodeWithExam | null> {
    try {
      const rows = await query<ExamCodeRow[]>(
        'SELECT * FROM exam_codes WHERE exam_id = ? AND code = ?',
        [examId, code]
      );

      if (rows.length === 0) {
        return null;
      }

      const examCode = this.mapRowToExamCode(rows[0]);
      const exam = await examService.findById(examCode.examId);

      if (!exam) {
        return null;
      }

      return {
        ...examCode,
        exam,
      };
    } catch (error) {
      console.error('Error finding exam code by code:', error);
      throw error;
    }
  }

  /**
   * Map database row sang ExamCode object
   */
  private mapRowToExamCode(row: ExamCodeRow): ExamCode {
    let questionOrder: number[] = [];
    
    try {
      // MySQL có thể trả về JSON type đã được parse (array) hoặc string
      if (Array.isArray(row.question_order)) {
        // Đã là array rồi, dùng trực tiếp
        questionOrder = row.question_order;
      } else if (typeof row.question_order === 'string') {
        // Là string, cần parse
        if (row.question_order.trim() === '' || row.question_order === 'null') {
          questionOrder = [];
        } else {
          questionOrder = JSON.parse(row.question_order);
        }
      } else if (row.question_order === null || row.question_order === undefined) {
        questionOrder = [];
      } else {
        // Fallback: thử convert
        questionOrder = Array.isArray(row.question_order) ? row.question_order : [];
      }
    } catch (error) {
      console.error('Error parsing question_order:', error);
      questionOrder = [];
    }

    return {
      id: row.id,
      examId: row.exam_id,
      code: row.code,
      questionOrder,
      createdAt: row.created_at,
    };
  }
}

export default new ExamCodeService();

