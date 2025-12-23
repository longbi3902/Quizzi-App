import {
  Exam,
  ExamQuestion,
  ExamWithQuestions,
  CreateExamDTO,
  CreateExamRandomDTO,
  UpdateExamDTO,
  UpdateExamWithQuestionsDTO,
  CreateExamQuestionDTO,
} from '../types/exam.types';
import { QuestionDifficulty } from '../types/question.types';
import { query } from '../config/database';
import questionService from './question.service';
import examCodeService from './examCode.service';

interface ExamRow {
  id: number;
  name: string;
  duration: number;
  max_score: number;
  created_by: number | null;
  created_at: Date;
  updated_at: Date;
}

interface ExamQuestionRow {
  id: number;
  exam_id: number;
  question_id: number;
  score: number;
  order_index: number;
  created_at: Date;
}

export class ExamService {
  /**
   * Lấy tất cả đề thi
   */
  async findAll(): Promise<ExamWithQuestions[]> {
    try {
      const examRows = await query<ExamRow[]>(
        'SELECT * FROM exams ORDER BY created_at DESC'
      );

      const examsWithQuestions: ExamWithQuestions[] = [];

      for (const examRow of examRows) {
        const questions = await this.getExamQuestions(examRow.id);
        examsWithQuestions.push({
          ...this.mapRowToExam(examRow),
          questions,
        });
      }

      return examsWithQuestions;
    } catch (error) {
      console.error('Error finding all exams:', error);
      throw error;
    }
  }

  /**
   * Lấy tất cả đề thi với phân trang (chỉ của user)
   */
  async findAllPaginated(
    page: number = 1,
    limit: number = 10,
    userId?: number | null,
    filters?: {
      name?: string;
    }
  ): Promise<{
    data: ExamWithQuestions[];
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

      if (filters) {
        if (filters.name && filters.name.trim()) {
          conditions.push('name LIKE ?');
          params.push(`%${filters.name.trim()}%`);
        }
      }

      const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
      
      // Đếm tổng số records
      const countRows = await query<{ count: number }[]>(
        `SELECT COUNT(*) as count FROM exams ${whereClause}`,
        params
      );
      const total = countRows[0]?.count || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      const limitInt = Number.parseInt(limit.toString(), 10);
      const offsetInt = Number.parseInt(offset.toString(), 10);

      // Lấy dữ liệu với pagination
      const examRows = await query<ExamRow[]>(
        `SELECT * FROM exams ${whereClause} ORDER BY created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`,
        params
      );

      const examsWithQuestions: ExamWithQuestions[] = [];

      for (const examRow of examRows) {
        const questions = await this.getExamQuestions(examRow.id);
        examsWithQuestions.push({
          ...this.mapRowToExam(examRow),
          questions,
        });
      }

      return {
        data: examsWithQuestions,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error finding all exams with pagination:', error);
      throw error;
    }
  }

  /**
   * Lấy đề thi theo ID (chỉ của user)
   */
  async findById(id: number, userId?: number | null): Promise<ExamWithQuestions | null> {
    try {
      let queryStr = 'SELECT * FROM exams WHERE id = ?';
      const params: any[] = [id];
      
      if (userId) {
        queryStr += ' AND created_by = ?';
        params.push(userId);
      }
      
      const results = await query<ExamRow[]>(queryStr, params);

      if (results.length === 0) {
        return null;
      }

      const examRow = results[0];
      const questions = await this.getExamQuestions(id);

      return {
        ...this.mapRowToExam(examRow),
        questions,
      };
    } catch (error) {
      console.error('Error finding exam by id:', error);
      throw error;
    }
  }

  /**
   * Tạo đề thi tự chọn
   */
  async create(examData: CreateExamDTO, userId?: number | null): Promise<ExamWithQuestions> {
    try {
      // Validate
      if (!examData.name || examData.name.trim() === '') {
        throw new Error('Tên đề thi là bắt buộc');
      }

      if (examData.duration <= 0) {
        throw new Error('Thời gian thi phải lớn hơn 0');
      }

      if (examData.maxScore <= 0) {
        throw new Error('Tổng điểm phải lớn hơn 0');
      }

      if (!examData.questions || examData.questions.length === 0) {
        throw new Error('Đề thi phải có ít nhất 1 câu hỏi');
      }

      // Tính tổng điểm các câu hỏi
      const totalScore = examData.questions.reduce(
        (sum, q) => sum + q.score,
        0
      );

      if (totalScore > examData.maxScore) {
        throw new Error(
          `Tổng điểm các câu hỏi (${totalScore}) không được vượt quá tổng điểm đề thi (${examData.maxScore})`
        );
      }

      // Kiểm tra các câu hỏi có tồn tại không
      for (const examQuestion of examData.questions) {
        const question = await questionService.findById(examQuestion.questionId);
        if (!question) {
          throw new Error(`Câu hỏi ID ${examQuestion.questionId} không tồn tại`);
        }
      }

      // Insert đề thi
      const examResult = await query<{ insertId: number }>(
        'INSERT INTO exams (name, duration, max_score, created_by) VALUES (?, ?, ?, ?)',
        [examData.name.trim(), examData.duration, examData.maxScore, userId || null]
      );

      const examId = examResult.insertId;

      // Insert các câu hỏi vào đề thi
      for (let i = 0; i < examData.questions.length; i++) {
        const examQuestion = examData.questions[i];
        await query(
          'INSERT INTO exam_questions (exam_id, question_id, score, order_index) VALUES (?, ?, ?, ?)',
          [examId, examQuestion.questionId, examQuestion.score, i + 1]
        );
      }

      // Tạo mã đề nếu có yêu cầu
      if (examData.numberOfCodes && examData.numberOfCodes > 0) {
        await this.createExamCodes(examId, examData.numberOfCodes);
      }

      // Lấy lại đề thi vừa tạo
      const exam = await this.findById(examId);
      if (!exam) {
        throw new Error('Không thể tạo đề thi');
      }

      return exam;
    } catch (error) {
      console.error('Error creating exam:', error);
      throw error;
    }
  }

  /**
   * Tạo đề thi random
   */
  async createRandom(examData: CreateExamRandomDTO, userId?: number | null): Promise<ExamWithQuestions> {
    try {
      // Validate
      if (!examData.name || examData.name.trim() === '') {
        throw new Error('Tên đề thi là bắt buộc');
      }

      if (examData.duration <= 0) {
        throw new Error('Thời gian thi phải lớn hơn 0');
      }

      if (examData.maxScore <= 0) {
        throw new Error('Tổng điểm phải lớn hơn 0');
      }

      const totalQuestions =
        examData.nhanBietCount +
        examData.thongHieuCount +
        examData.vanDungCount +
        examData.vanDungCaoCount;

      if (totalQuestions !== examData.totalQuestions) {
        throw new Error(
          `Tổng số câu hỏi các mức độ (${totalQuestions}) phải bằng tổng số câu hỏi (${examData.totalQuestions})`
        );
      }

      if (totalQuestions === 0) {
        throw new Error('Đề thi phải có ít nhất 1 câu hỏi');
      }

      // Tính điểm mỗi câu hỏi
      const scorePerQuestion = examData.maxScore / totalQuestions;

      // Lấy câu hỏi random theo từng mức độ
      const selectedQuestions: CreateExamQuestionDTO[] = [];

      // Nhận biết
      if (examData.nhanBietCount > 0) {
        const questions = await this.getRandomQuestionsByDifficulty(
          QuestionDifficulty.NHAN_BIET,
          examData.nhanBietCount,
          examData.grade,
          examData.subjectId
        );
        if (questions.length < examData.nhanBietCount) {
          throw new Error(
            `Không đủ câu hỏi mức Nhận biết. Cần ${examData.nhanBietCount}, chỉ có ${questions.length}`
          );
        }
        questions.forEach((q) => {
          selectedQuestions.push({
            questionId: q.id,
            score: scorePerQuestion,
          });
        });
      }

      // Thông hiểu
      if (examData.thongHieuCount > 0) {
        const questions = await this.getRandomQuestionsByDifficulty(
          QuestionDifficulty.THONG_HIEU,
          examData.thongHieuCount,
          examData.grade,
          examData.subjectId
        );
        if (questions.length < examData.thongHieuCount) {
          throw new Error(
            `Không đủ câu hỏi mức Thông hiểu. Cần ${examData.thongHieuCount}, chỉ có ${questions.length}`
          );
        }
        questions.forEach((q) => {
          selectedQuestions.push({
            questionId: q.id,
            score: scorePerQuestion,
          });
        });
      }

      // Vận dụng
      if (examData.vanDungCount > 0) {
        const questions = await this.getRandomQuestionsByDifficulty(
          QuestionDifficulty.VAN_DUNG,
          examData.vanDungCount,
          examData.grade,
          examData.subjectId
        );
        if (questions.length < examData.vanDungCount) {
          throw new Error(
            `Không đủ câu hỏi mức Vận dụng. Cần ${examData.vanDungCount}, chỉ có ${questions.length}`
          );
        }
        questions.forEach((q) => {
          selectedQuestions.push({
            questionId: q.id,
            score: scorePerQuestion,
          });
        });
      }

      // Vận dụng cao
      if (examData.vanDungCaoCount > 0) {
        const questions = await this.getRandomQuestionsByDifficulty(
          QuestionDifficulty.VAN_DUNG_CAO,
          examData.vanDungCaoCount,
          examData.grade,
          examData.subjectId
        );
        if (questions.length < examData.vanDungCaoCount) {
          throw new Error(
            `Không đủ câu hỏi mức Vận dụng cao. Cần ${examData.vanDungCaoCount}, chỉ có ${questions.length}`
          );
        }
        questions.forEach((q) => {
          selectedQuestions.push({
            questionId: q.id,
            score: scorePerQuestion,
          });
        });
      }

      // Tạo đề thi với các câu hỏi đã chọn
      return await this.create({
        name: examData.name,
        duration: examData.duration,
        maxScore: examData.maxScore,
        questions: selectedQuestions,
        numberOfCodes: examData.numberOfCodes || 0,
      }, userId);
    } catch (error) {
      console.error('Error creating random exam:', error);
      throw error;
    }
  }

  /**
   * Lấy câu hỏi random theo độ khó
   */
  private async getRandomQuestionsByDifficulty(
    difficulty: number,
    count: number,
    grade?: number | null,
    subjectId?: number | null
  ): Promise<{ id: number }[]> {
    try {
      // LIMIT không thể dùng như parameter trong prepared statement
      // Nên phải convert count thành số và đưa trực tiếp vào query
      const countNum = Number.parseInt(String(count), 10);
      if (isNaN(countNum) || countNum < 0) {
        throw new Error('Số lượng câu hỏi không hợp lệ');
      }

      // Xây dựng WHERE clause
      let whereClause = 'WHERE difficulty = ?';
      const params: any[] = [difficulty];

      if (grade !== undefined && grade !== null) {
        whereClause += ' AND grade = ?';
        params.push(grade);
      }

      if (subjectId !== undefined && subjectId !== null) {
        whereClause += ' AND subject_id = ?';
        params.push(subjectId);
      }

      const results = await query<{ id: number }[]>(
        `SELECT id FROM questions 
         ${whereClause}
         ORDER BY RAND() 
         LIMIT ${countNum}`,
        params
      );
      return results;
    } catch (error) {
      console.error('Error getting random questions:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đề thi (chỉ người tạo mới được cập nhật)
   */
  async update(id: number, examData: UpdateExamDTO, userId?: number | null): Promise<ExamWithQuestions | null> {
    try {
      const updates: string[] = [];
      const values: any[] = [];

      if (examData.name !== undefined) {
        updates.push('name = ?');
        values.push(examData.name.trim());
      }

      if (examData.duration !== undefined) {
        if (examData.duration <= 0) {
          throw new Error('Thời gian thi phải lớn hơn 0');
        }
        updates.push('duration = ?');
        values.push(examData.duration);
      }

      if (examData.maxScore !== undefined) {
        if (examData.maxScore <= 0) {
          throw new Error('Tổng điểm phải lớn hơn 0');
        }
        updates.push('max_score = ?');
        values.push(examData.maxScore);
      }

      if (updates.length === 0) {
        return await this.findById(id, userId);
      }

      values.push(id);
      
      // Thêm điều kiện created_by nếu có userId
      let whereClause = 'WHERE id = ?';
      if (userId) {
        whereClause += ' AND created_by = ?';
        values.push(userId);
      }

      await query(`UPDATE exams SET ${updates.join(', ')} ${whereClause}`, values);

      return await this.findById(id, userId);
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem đề thi đã có học sinh làm bài chưa
   */
  private async hasExamResults(examId: number): Promise<boolean> {
    try {
      const results = await query<{ count: number }[]>(
        'SELECT COUNT(*) as count FROM exam_results WHERE exam_id = ?',
        [examId]
      );
      return (results[0]?.count || 0) > 0;
    } catch (error) {
      console.error('Error checking exam results:', error);
      return false;
    }
  }

  /**
   * Kiểm tra xem đề thi đã có mã đề chưa
   */
  private async hasExamCodes(examId: number): Promise<boolean> {
    try {
      const examCodes = await examCodeService.findByExamId(examId);
      return examCodes.length > 0;
    } catch (error) {
      console.error('Error checking exam codes:', error);
      return false;
    }
  }

  /**
   * Lấy thông tin trạng thái đề thi (có mã đề chưa, có học sinh làm bài chưa)
   */
  async getExamStatus(examId: number): Promise<{ hasExamCodes: boolean; hasExamResults: boolean }> {
    try {
      const hasCodes = await this.hasExamCodes(examId);
      const hasResults = await this.hasExamResults(examId);
      return { hasExamCodes: hasCodes, hasExamResults: hasResults };
    } catch (error) {
      console.error('Error getting exam status:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đề thi kèm câu hỏi
   */
  async updateWithQuestions(
    id: number,
    examData: UpdateExamWithQuestionsDTO,
    userId?: number | null
  ): Promise<ExamWithQuestions | null> {
    try {
      // Kiểm tra đề thi có tồn tại không
      const existingExam = await this.findById(id, userId);
      if (!existingExam) {
        throw new Error('Không tìm thấy đề thi hoặc bạn không có quyền chỉnh sửa');
      }

      // Cập nhật thông tin đề thi
      const updateData: UpdateExamDTO = {
        name: examData.name,
        duration: examData.duration,
        maxScore: examData.maxScore,
      };
      await this.update(id, updateData, userId);

      // Nếu có cập nhật câu hỏi
      if (examData.questions !== undefined) {
        // Kiểm tra xem đã có học sinh làm bài chưa
        const hasResults = await this.hasExamResults(id);
        if (hasResults) {
          throw new Error(
            'Đề thi này đã có học sinh làm bài. Không thể thêm hoặc xóa câu hỏi để đảm bảo tính nhất quán của kết quả. Bạn chỉ có thể sửa tên, thời gian và điểm số của đề thi.'
          );
        }

        // Validate
        if (examData.questions.length === 0) {
          throw new Error('Đề thi phải có ít nhất 1 câu hỏi');
        }

        // Lấy maxScore hiện tại hoặc mới
        const currentMaxScore = examData.maxScore ?? existingExam.maxScore;

        // Tính tổng điểm các câu hỏi
        const totalScore = examData.questions.reduce((sum, q) => sum + q.score, 0);

        if (totalScore > currentMaxScore) {
          throw new Error(
            `Tổng điểm các câu hỏi (${totalScore}) không được vượt quá tổng điểm đề thi (${currentMaxScore})`
          );
        }

        // Kiểm tra các câu hỏi có tồn tại không
        for (const examQuestion of examData.questions) {
          const question = await questionService.findById(examQuestion.questionId);
          if (!question) {
            throw new Error(`Câu hỏi ID ${examQuestion.questionId} không tồn tại`);
          }
          if (examQuestion.score <= 0) {
            throw new Error('Mỗi câu hỏi phải có điểm lớn hơn 0');
          }
        }

        // Kiểm tra xem đã có mã đề chưa
        const hasCodes = await this.hasExamCodes(id);
        
        // Xóa tất cả câu hỏi cũ
        await query('DELETE FROM exam_questions WHERE exam_id = ?', [id]);

        // Thêm các câu hỏi mới
        for (let i = 0; i < examData.questions.length; i++) {
          const examQuestion = examData.questions[i];
          await query(
            'INSERT INTO exam_questions (exam_id, question_id, score, order_index) VALUES (?, ?, ?, ?)',
            [id, examQuestion.questionId, examQuestion.score, i + 1]
          );
        }

        // Nếu đã có mã đề, xóa tất cả mã đề cũ (vì câu hỏi đã thay đổi)
        if (hasCodes) {
          await query('DELETE FROM exam_codes WHERE exam_id = ?', [id]);
        }
      }

      // Lấy lại đề thi đã cập nhật
      return await this.findById(id, userId);
    } catch (error) {
      console.error('Error updating exam with questions:', error);
      throw error;
    }
  }

  /**
   * Xóa đề thi
   */
  async delete(id: number, userId?: number | null): Promise<boolean> {
    try {
      // Kiểm tra quyền sở hữu nếu có userId
      if (userId) {
        const existing = await this.findById(id, userId);
        if (!existing) {
          throw new Error('Không tìm thấy đề thi hoặc bạn không có quyền xóa');
        }
      }
      
      let queryStr = 'DELETE FROM exams WHERE id = ?';
      const params: any[] = [id];
      
      if (userId) {
        queryStr += ' AND created_by = ?';
        params.push(userId);
      }
      
      const result = await query<{ affectedRows: number }>(queryStr, params);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting exam:', error);
      throw error;
    }
  }

  /**
   * Lấy các câu hỏi của đề thi
   */
  private async getExamQuestions(examId: number): Promise<ExamQuestion[]> {
    try {
      const examQuestionRows = await query<ExamQuestionRow[]>(
        `SELECT eq.*, q.* 
         FROM exam_questions eq
         INNER JOIN questions q ON eq.question_id = q.id
         WHERE eq.exam_id = ?
         ORDER BY eq.order_index`,
        [examId]
      );

      const examQuestions: ExamQuestion[] = [];

      for (const row of examQuestionRows) {
        const question = await questionService.findById(row.question_id);
        examQuestions.push({
          id: row.id,
          examId: row.exam_id,
          questionId: row.question_id,
          score: Number(row.score),
          orderIndex: row.order_index,
          createdAt: row.created_at,
          question: question || undefined,
        });
      }

      return examQuestions;
    } catch (error) {
      console.error('Error getting exam questions:', error);
      throw error;
    }
  }

  /**
   * Tạo mã đề cho đề thi
   * @param examId ID của đề thi
   * @param numberOfCodes Số mã đề cần tạo
   */
  async createExamCodes(examId: number, numberOfCodes: number): Promise<void> {
    try {
      // Lấy danh sách question IDs từ đề thi (theo thứ tự)
      const examQuestions = await this.getExamQuestions(examId);
      const questionIds = examQuestions.map((eq) => eq.questionId);

      console.log('Creating exam codes for exam:', examId);
      console.log('Exam questions:', examQuestions.length);
      console.log('Question IDs:', questionIds);

      if (questionIds.length === 0) {
        throw new Error('Đề thi không có câu hỏi');
      }

      // Tạo các mã đề
      for (let i = 1; i <= numberOfCodes; i++) {
        // Tạo mã đề (MĐ001, MĐ002, ...)
        const code = `MĐ${String(i).padStart(3, '0')}`;

        // Đảo thứ tự câu hỏi (shuffle)
        const shuffledOrder = [...questionIds];
        for (let j = shuffledOrder.length - 1; j > 0; j--) {
          const k = Math.floor(Math.random() * (j + 1));
          [shuffledOrder[j], shuffledOrder[k]] = [shuffledOrder[k], shuffledOrder[j]];
        }

        console.log(`Creating code ${code} with order:`, shuffledOrder);
        const questionOrderJson = JSON.stringify(shuffledOrder);
        console.log(`Question order JSON:`, questionOrderJson);

        // Lưu vào database
        await query(
          'INSERT INTO exam_codes (exam_id, code, question_order) VALUES (?, ?, ?)',
          [examId, code, questionOrderJson]
        );

        // Verify sau khi insert
        const verifyResult = await query<any[]>(
          'SELECT question_order FROM exam_codes WHERE exam_id = ? AND code = ?',
          [examId, code]
        );
        if (verifyResult.length > 0) {
          console.log(`Verified ${code}:`, verifyResult[0].question_order);
        }
      }
    } catch (error) {
      console.error('Error creating exam codes:', error);
      throw error;
    }
  }

  /**
   * Map database row sang Exam object
   */
  private mapRowToExam(row: ExamRow): Exam {
    return {
      id: row.id,
      name: row.name,
      duration: row.duration,
      maxScore: Number(row.max_score),
      createdBy: row.created_by || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new ExamService();

