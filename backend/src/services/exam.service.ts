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

interface ExamRow {
  id: number;
  name: string;
  duration: number;
  max_score: number;
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
   * Lấy đề thi theo ID
   */
  async findById(id: number): Promise<ExamWithQuestions | null> {
    try {
      const results = await query<ExamRow[]>(
        'SELECT * FROM exams WHERE id = ?',
        [id]
      );

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
  async create(examData: CreateExamDTO): Promise<ExamWithQuestions> {
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
        'INSERT INTO exams (name, duration, max_score) VALUES (?, ?, ?)',
        [examData.name.trim(), examData.duration, examData.maxScore]
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
  async createRandom(examData: CreateExamRandomDTO): Promise<ExamWithQuestions> {
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
          examData.nhanBietCount
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
          examData.thongHieuCount
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
          examData.vanDungCount
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
          examData.vanDungCaoCount
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
      });
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
    count: number
  ): Promise<{ id: number }[]> {
    try {
      // LIMIT không thể dùng như parameter trong prepared statement
      // Nên phải convert count thành số và đưa trực tiếp vào query
      const countNum = Number.parseInt(String(count), 10);
      if (isNaN(countNum) || countNum < 0) {
        throw new Error('Số lượng câu hỏi không hợp lệ');
      }

      const results = await query<{ id: number }[]>(
        `SELECT id FROM questions 
         WHERE difficulty = ? 
         ORDER BY RAND() 
         LIMIT ${countNum}`,
        [difficulty]
      );
      return results;
    } catch (error) {
      console.error('Error getting random questions:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đề thi
   */
  async update(id: number, examData: UpdateExamDTO): Promise<ExamWithQuestions | null> {
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
        return await this.findById(id);
      }

      values.push(id);

      await query(`UPDATE exams SET ${updates.join(', ')} WHERE id = ?`, values);

      return await this.findById(id);
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  /**
   * Cập nhật đề thi kèm câu hỏi
   */
  async updateWithQuestions(
    id: number,
    examData: UpdateExamWithQuestionsDTO
  ): Promise<ExamWithQuestions | null> {
    try {
      // Kiểm tra đề thi có tồn tại không
      const existingExam = await this.findById(id);
      if (!existingExam) {
        throw new Error('Không tìm thấy đề thi');
      }

      // Cập nhật thông tin đề thi
      const updateData: UpdateExamDTO = {
        name: examData.name,
        duration: examData.duration,
        maxScore: examData.maxScore,
      };
      await this.update(id, updateData);

      // Nếu có cập nhật câu hỏi
      if (examData.questions !== undefined) {
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
      }

      // Lấy lại đề thi đã cập nhật
      return await this.findById(id);
    } catch (error) {
      console.error('Error updating exam with questions:', error);
      throw error;
    }
  }

  /**
   * Xóa đề thi
   */
  async delete(id: number): Promise<boolean> {
    try {
      const result = await query<{ affectedRows: number }>(
        'DELETE FROM exams WHERE id = ?',
        [id]
      );

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
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export default new ExamService();

